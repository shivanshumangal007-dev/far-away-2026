import { useState, useEffect, useRef } from "react";
import { Waveform } from "./Waveform";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "framer-motion";

interface TranscriptionChunk {
  speaker: string;
  text: string;
  is_final: boolean;
}

interface Message {
  id: string;
  speaker: string;
  text: string;
  isFinal: boolean;
}

export let globalMessages: Message[] = [];

export function RecordingScreen() {
  const [time, setTime] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to deepgram transcriptions
  useEffect(() => {
    const unlistenPromise = listen<TranscriptionChunk>("transcription_chunk", (event) => {
      const { speaker, text, is_final } = event.payload;

      setMessages((prev) => {
        let lastIndex = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].speaker === speaker && !prev[i].isFinal) {
            lastIndex = i;
            break;
          }
        }

        let newMessages;
        if (lastIndex !== -1) {
          newMessages = [...prev];
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: text, // Deepgram sends the full cumulative transcript for partials, so don't concatenate!
            isFinal: is_final,
          };
        } else {
          // Otherwise add a new message bubble
          newMessages = [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              speaker,
              text,
              isFinal: is_final,
            },
          ];
        }
        globalMessages = newMessages;
        return newMessages;
      });
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isMac = navigator.userAgent.toLowerCase().includes("mac");
  const shortcutModifier = isMac ? "Cmd" : "Ctrl";

  return (
    <div className="w-full h-full flex flex-col p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {formatTime(time)}
          </span>
        </div>
        <div className="h-6">
          <Waveform isRecording={true} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto w-full no-scrollbar space-y-4 mb-4 relative z-10">
        <div className="h-full flex flex-col items-center justify-center opacity-80">
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Listening to conversation...</p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center shrink-0 border-t border-border/50 pt-4">
        <p className="text-xs text-muted-foreground/80 font-medium">
          Press <kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded-md text-[10px] shadow-sm">{shortcutModifier} + Shift + E</kbd> to stop
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-image-bottom { mask-image: linear-gradient(to bottom, black 80%, transparent 100%); }
      `}} />
    </div>
  );
}
