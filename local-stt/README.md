# local-stt

Lightweight background speech-to-text for Windows and macOS, linked to the **Far Away assistant backend**.

Press **Ctrl+Shift+Space** to record, press again to stop — transcription is copied to the clipboard and sent to the assistant API.

## Link to backend

Copy `.env.example` to `.env`:

```env
ASSISTANT_API_URL=http://localhost:4001/api/assistant
ASSISTANT_ENABLED=true
ASSISTANT_ASYNC=false
```

Start the backend first (`cd ../backend && npm run dev`), then run local-stt.

Toggle the assistant link from the tray menu: **Assistant link → Enabled**.

## Run from source

```bash
cd local-stt
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS

pip install -r requirements.txt
cp .env.example .env
python app.py
```

## Usage

| Action | Result |
|--------|--------|
| `Ctrl+Shift+Space` | Start recording |
| `Ctrl+Shift+Space` again | Stop, transcribe, copy, send to assistant |
| `Esc` | Dismiss overlay |

## System Requirements

- **Python 3.8+**
- **ffmpeg** (required by faster-whisper for audio processing)
- **Microphone access** (system will prompt for permissions on first run)
- **Windows:** Windows 10 or later
- **macOS:** macOS 10.13 or later with microphone/screen recording permissions enabled in System Preferences

## User Transcripts

When you record, local-stt captures and transcribes **two separate audio streams**:

- **Mic (user):** Your voice
- **Loopback (other):** System audio / other speakers

The output is formatted as JSON-style dialogue with speaker labels:

```json
{
  "user" : "what time is the meeting",
  "other" : "the meeting is at 2pm",
  "user" : "thanks"
}
```

**Output behavior:**
- Transcripts are **automatically copied to clipboard**
- If assistant link is enabled, they're sent to your configured backend
- Toggle assistant link from tray menu: **Assistant link → Enabled/Disabled**
- Press **Esc** to dismiss the overlay and clear the transcript from display

## Troubleshooting

### No audio captured / "Nothing heard" message
- Check microphone permissions (macOS requires explicit access)
- Ensure microphone is not in use by another application
- Try adjusting the microphone volume
- Verify loopback device is available (`sc.get_microphone()` on macOS requires Soundflower or BlackHole)

### Transcription takes too long
- The first run downloads the Whisper model (~1.5GB) — subsequent runs are faster
- Model is cached locally in the venv; this only happens once

### Assistant backend not responding
- Verify backend is running: `cd ../backend && npm run dev`
- Check `ASSISTANT_API_URL` in `.env` matches your backend URL
- Check network connectivity between local-stt and backend

### Accessibility/Permission issues on macOS
- Grant **Microphone** access: System Settings → Privacy & Security → Microphone
- Grant **Screen Recording** permission if recording system audio: System Settings → Privacy & Security → Screen Recording
- For loopback recording, install [BlackHole](https://existential.audio/blackhole/) or similar virtual audio device

## Build

**Windows:** `build_windows.bat` → `dist\local-stt.exe`

**macOS:** `./build_mac.sh` → `dist/local-stt-mac.zip`

## Privacy

Audio and transcription run locally via faster-whisper. Only the **text transcript** is sent to your configured assistant backend.
