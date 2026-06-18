import { Mic } from "lucide-react";

export function ReadyScreen() {
  const isMac = navigator.userAgent.toLowerCase().includes("mac");
  const shortcutModifier = isMac ? "Cmd" : "Ctrl";

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-background to-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Calvio</span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          Ready
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold mb-2">Your AI meeting assistant is ready.</h1>
        <p className="text-muted-foreground text-sm mb-12 max-w-[280px]">
          Start transcribing instantly from anywhere on your computer.
        </p>

        {/* Global Shortcut Display */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <kbd className="px-3 py-1.5 bg-secondary/80 border border-border/50 rounded-lg shadow-sm font-mono text-sm font-medium text-foreground">
            {shortcutModifier}
          </kbd>
          <span className="text-muted-foreground font-medium">+</span>
          <kbd className="px-3 py-1.5 bg-secondary/80 border border-border/50 rounded-lg shadow-sm font-mono text-sm font-medium text-foreground">
            Shift
          </kbd>
          <span className="text-muted-foreground font-medium">+</span>
          <kbd className="px-3 py-1.5 bg-secondary/80 border border-border/50 rounded-lg shadow-sm font-mono text-sm font-medium text-foreground">
            E
          </kbd>
        </div>

        {/* Options */}
        <div className="w-full max-w-[280px] space-y-3">
          <label className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-secondary/30 transition-colors">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Launch at Startup
            </span>
            <div className="w-10 h-6 bg-primary rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-primary-foreground rounded-full translate-x-4 shadow-sm" />
            </div>
          </label>
          <label className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-secondary/30 transition-colors">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Minimize to Tray
            </span>
            <div className="w-10 h-6 bg-primary rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-primary-foreground rounded-full translate-x-4 shadow-sm" />
            </div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-auto pt-6">
        <p className="text-xs text-muted-foreground/60 font-medium">
          Press the shortcut anytime to start recording.
        </p>
      </div>
    </div>
  );
}
