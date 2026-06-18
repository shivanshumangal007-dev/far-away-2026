import { useState, useEffect } from "react";
import { Waveform } from "./Waveform";

export function RecordingScreen() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isMac = navigator.userAgent.toLowerCase().includes("mac");
  const shortcutModifier = isMac ? "Cmd" : "Ctrl";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background relative overflow-hidden">
      {/* Subtle pulsing background glow */}
      <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-50" />

      {/* Timer and Status */}
      <div className="relative z-10 flex flex-col items-center mb-16">
        <div className="flex items-center gap-3 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          <span className="font-mono font-medium text-lg w-16 text-center text-foreground tracking-wider">
            {formatTime(time)}
          </span>
        </div>
        <h2 className="text-xl font-medium text-foreground tracking-tight">Listening...</h2>
      </div>

      {/* Animated Waveform */}
      <div className="relative z-10 w-full mb-16 px-8">
        <Waveform isRecording={true} />
      </div>

      {/* Footer Instruction */}
      <div className="relative z-10 text-center mt-auto">
        <p className="text-xs text-muted-foreground/80 font-medium max-w-[200px] leading-relaxed">
          Press <kbd className="font-mono bg-secondary/50 px-1 py-0.5 rounded text-[10px]">{shortcutModifier} + Shift + E</kbd> again to stop recording.
        </p>
      </div>
    </div>
  );
}
