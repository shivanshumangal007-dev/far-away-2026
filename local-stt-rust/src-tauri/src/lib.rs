// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::{Arc, Mutex};
use std::env;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::sync::mpsc as tokio_mpsc;
use std::sync::mpsc as std_mpsc;
use serde::{Deserialize, Serialize};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

use screencapturekit::prelude::*;
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message, tungstenite::client::IntoClientRequest};
use futures_util::{SinkExt, StreamExt};

// State to hold the stop signals for our audio threads
struct AppAudioState {
    stop_mic_tx: Mutex<Option<std_mpsc::Sender<()>>>,
    stop_sys_tx: Mutex<Option<std_mpsc::Sender<()>>>,
}

#[derive(Clone, Serialize)]
struct TranscriptionChunk {
    speaker: String,
    text: String,
    is_final: bool,
}

#[derive(Deserialize, Debug)]
struct DeepgramResponse {
    channel: DeepgramChannel,
    is_final: bool,
    #[serde(rename = "type")]
    msg_type: String,
}

#[derive(Deserialize, Debug)]
struct DeepgramChannel {
    alternatives: Vec<DeepgramAlternative>,
}

#[derive(Deserialize, Debug)]
struct DeepgramAlternative {
    transcript: String,
}

// Helper to establish Deepgram connection
async fn connect_to_deepgram(api_key: &str, sample_rate: u32, channels: u16) -> Result<(
    futures_util::stream::SplitSink<tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>, Message>,
    futures_util::stream::SplitStream<tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>>
), String> {
    let url = format!("wss://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate={}&channels={}", sample_rate, channels);
    let mut request = url.into_client_request().map_err(|e| format!("Bad URL: {}", e))?;
    request.headers_mut().insert(
        "Authorization",
        format!("Token {}", api_key).parse().unwrap(),
    );
        
    let (ws_stream, _) = connect_async(request).await.map_err(|e| format!("Failed to connect: {}", e))?;
    Ok(ws_stream.split())
}

#[tauri::command]
fn start_recording(app: AppHandle, state: State<'_, AppAudioState>) -> Result<(), String> {
    println!("Starting recording...");
    let api_key = env::var("DEEPGRAM_API_KEY").unwrap_or_else(|_| "".to_string());
    if api_key.is_empty() {
        println!("Error: DEEPGRAM_API_KEY is missing!");
        return Err("DEEPGRAM_API_KEY environment variable is not set. Please export it and restart the app.".to_string());
    }

    let (stop_mic_tx, stop_mic_rx) = std_mpsc::channel();
    let (stop_sys_tx, stop_sys_rx) = std_mpsc::channel();

    *state.stop_mic_tx.lock().unwrap() = Some(stop_mic_tx);
    *state.stop_sys_tx.lock().unwrap() = Some(stop_sys_tx);

    let app_mic = app.clone();
    let api_key_mic = api_key.clone();

    // 1. Microphone Thread
    std::thread::spawn(move || {
        let host = cpal::default_host();
        let device = host.default_input_device().expect("No default input device");
        let config = device.default_input_config().expect("No default config");
        let sample_rate = config.sample_rate().0;
        let channels = config.channels();

        let (audio_tx, mut audio_rx) = tokio_mpsc::unbounded_channel::<Vec<u8>>();

        let stream = device.build_input_stream(
            &config.into(),
            move |data: &[f32], _: &_| {
                // Convert f32 to i16, then to bytes
                let mut i16_samples = Vec::with_capacity(data.len());
                for &sample in data {
                    i16_samples.push((sample * i16::MAX as f32) as i16);
                }
                let mut u8_samples = Vec::with_capacity(i16_samples.len() * 2);
                for sample in i16_samples {
                    u8_samples.extend_from_slice(&sample.to_le_bytes());
                }
                let _ = audio_tx.send(u8_samples);
            },
            |err| eprintln!("Mic error: {}", err),
            None,
        ).expect("Failed to build mic stream");

        println!("Mic stream built and playing...");
        stream.play().expect("Failed to play mic stream");

        // Toko runtime for Deepgram WS
        tauri::async_runtime::spawn(async move {
            match connect_to_deepgram(&api_key_mic, sample_rate, channels).await {
                Ok((mut ws_sender, mut ws_receiver)) => {
                    println!("Mic connected to Deepgram!");
                    
                    // Read from audio channel and send to Deepgram
                    let send_task = tauri::async_runtime::spawn(async move {
                        while let Some(audio_data) = audio_rx.recv().await {
                            if ws_sender.send(Message::Binary(audio_data.into())).await.is_err() {
                                println!("Failed to send mic audio to deepgram");
                                break;
                            }
                        }
                    });

                    // Read from Deepgram and send to frontend
                    let recv_task = tauri::async_runtime::spawn(async move {
                        while let Some(Ok(msg)) = ws_receiver.next().await {
                            if let Message::Text(text) = msg {
                                if let Ok(resp) = serde_json::from_str::<DeepgramResponse>(&text) {
                                    if resp.msg_type == "Results" && !resp.channel.alternatives.is_empty() {
                                        let transcript = &resp.channel.alternatives[0].transcript;
                                        if !transcript.is_empty() {
                                            let chunk = TranscriptionChunk {
                                                speaker: "user".to_string(),
                                                text: transcript.clone(),
                                                is_final: resp.is_final,
                                            };
                                            let _ = app_mic.emit("transcription_chunk", chunk);
                                        }
                                    }
                                }
                            }
                        }
                    });

                    let _ = tokio::join!(send_task, recv_task);
                }
                Err(e) => println!("Failed to connect mic to Deepgram: {}", e),
            }
        });

        // Wait for stop signal
        let _ = stop_mic_rx.recv();
        drop(stream);
    });

    // 2. System Audio Thread (ScreenCaptureKit)
    let app_sys = app.clone();
    tauri::async_runtime::spawn(async move {
        println!("Starting system audio thread...");
        // macOS 13+ ScreenCaptureKit setup
        let content = match SCShareableContent::get() {
            Ok(c) => c,
            Err(e) => {
                println!("Failed to get SCShareableContent (Needs Screen Recording Permission!): {:?}", e);
                return;
            }
        };
        let displays = content.displays();
        let display = displays.first().expect("No displays found");
        
        let filter = SCContentFilter::create()
            .with_display(&display)
            .build();
        
        let mut config = SCStreamConfiguration::new();
        config.set_captures_audio(true);
        config.set_excludes_current_process_audio(true);

        let mut stream = SCStream::new(&filter, &config);

        let (audio_tx, mut audio_rx) = tokio_mpsc::unbounded_channel::<Vec<u8>>();

        stream.add_output_handler(move |sample: CMSampleBuffer, of_type: SCStreamOutputType| {
            if of_type == SCStreamOutputType::Audio {
                if let Some(list) = sample.audio_buffer_list() {
                    let num_buffers = list.iter().count();
                    if let Some(buffer) = list.iter().next() {
                        let data: &[u8] = buffer.data();
                        
                        let f32_samples = unsafe { std::slice::from_raw_parts(data.as_ptr() as *const f32, data.len() / 4) };
                        let mut i16_samples = Vec::with_capacity(f32_samples.len());
                        
                        if num_buffers > 1 {
                            // Planar: buffer 0 is Left channel. Just use Left.
                            for &s in f32_samples {
                                i16_samples.push((s.clamp(-1.0, 1.0) * i16::MAX as f32) as i16);
                            }
                        } else {
                            // Interleaved: L R L R -> mix to mono
                            for chunk in f32_samples.chunks(2) {
                                if chunk.len() == 2 {
                                    let mono = (chunk[0] + chunk[1]) / 2.0;
                                    i16_samples.push((mono.clamp(-1.0, 1.0) * i16::MAX as f32) as i16);
                                } else {
                                    i16_samples.push((chunk[0].clamp(-1.0, 1.0) * i16::MAX as f32) as i16);
                                }
                            }
                        }

                        let mut u8_samples = Vec::with_capacity(i16_samples.len() * 2);
                        for s in i16_samples {
                            u8_samples.extend_from_slice(&s.to_le_bytes());
                        }
                        let _ = audio_tx.send(u8_samples);
                    }
                }
            }
        }, SCStreamOutputType::Audio);

        stream.start_capture().expect("Failed to start SCK capture");

        println!("System audio SCK capture started...");
        // Deepgram WS for System Audio
        // ScreenCaptureKit audio is mixed to Mono 48000Hz
        match connect_to_deepgram(&api_key, 48000, 1).await {
            Ok((mut ws_sender, mut ws_receiver)) => {
                println!("System audio connected to Deepgram!");
                let send_task = tauri::async_runtime::spawn(async move {
                    while let Some(audio_data) = audio_rx.recv().await {
                        if ws_sender.send(Message::Binary(audio_data.into())).await.is_err() {
                            break;
                        }
                    }
                });

                let recv_task = tauri::async_runtime::spawn(async move {
                    while let Some(Ok(msg)) = ws_receiver.next().await {
                        if let Message::Text(text) = msg {
                            if let Ok(resp) = serde_json::from_str::<DeepgramResponse>(&text) {
                                if resp.msg_type == "Results" && !resp.channel.alternatives.is_empty() {
                                    let transcript = &resp.channel.alternatives[0].transcript;
                                    if !transcript.is_empty() {
                                        let chunk = TranscriptionChunk {
                                            speaker: "other".to_string(),
                                            text: transcript.clone(),
                                            is_final: resp.is_final,
                                        };
                                        let _ = app_sys.emit("transcription_chunk", chunk);
                                    }
                                }
                            }
                        }
                    }
                });

                // Wait until stop signal is sent
                let _ = tauri::async_runtime::spawn_blocking(move || {
                    let _ = stop_sys_rx.recv();
                }).await;

                println!("Stopping system audio SCK capture...");
                let _ = stream.stop_capture();
            }
            Err(e) => println!("Failed to connect system audio to Deepgram: {}", e),
        }
    });

    Ok(())
}

#[derive(Deserialize)]
struct FrontendMessage {
    speaker: String,
    text: String,
}

#[tauri::command]
fn stop_recording(state: State<'_, AppAudioState>, transcript: Vec<FrontendMessage>) -> Result<(), String> {
    if let Some(tx) = state.stop_mic_tx.lock().unwrap().take() {
        let _ = tx.send(());
    }
    if let Some(tx) = state.stop_sys_tx.lock().unwrap().take() {
        let _ = tx.send(());
    }
    
    // Dump transcript to local file
    let current_dir = env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    let file_path = current_dir.join("calvio_transcript.json");
    
    // We can format the transcript however we want, let's map it to JSON
    let json_data: Vec<serde_json::Value> = transcript.into_iter().map(|msg| {
        serde_json::json!({
            "speaker": msg.speaker,
            "text": msg.text,
        })
    }).collect();

    if let Ok(json_str) = serde_json::to_string_pretty(&json_data) {
        if let Err(e) = std::fs::write(&file_path, json_str) {
            println!("Failed to write transcript to file: {}", e);
        } else {
            println!("Saved transcript to {}", file_path.display());
        }
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppAudioState {
            stop_mic_tx: Mutex::new(None),
            stop_sys_tx: Mutex::new(None),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_recording, stop_recording])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
