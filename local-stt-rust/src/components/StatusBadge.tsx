import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AppStatus = "Idle" | "Recording" | "Transcribing" | "Sending";

interface StatusBadgeProps {
  status: AppStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    Idle: {
      color: "bg-muted-foreground",
      text: "text-muted-foreground",
      bg: "bg-muted/50",
      pulse: false,
    },
    Recording: {
      color: "bg-red-500",
      text: "text-red-500",
      bg: "bg-red-500/10",
      pulse: true,
    },
    Transcribing: {
      color: "bg-blue-500",
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      pulse: true,
    },
    Sending: {
      color: "bg-purple-500",
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      pulse: true,
    },
  };

  const { color, text, bg, pulse } = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium border border-border/50",
        bg,
        text
      )}
    >
      <div className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              color
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", color)} />
      </div>
      {status}
    </div>
  );
}
