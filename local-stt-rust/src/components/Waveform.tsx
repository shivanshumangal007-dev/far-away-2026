import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Waveform({ isRecording }: { isRecording: boolean }) {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 24 }, () => 0.1));

  useEffect(() => {
    if (!isRecording) {
      setBars(Array.from({ length: 24 }, () => 0.1));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array.from({ length: 24 }, () => Math.max(0.1, Math.random())));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-24 w-full">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-full bg-primary"
          initial={{ height: "10%" }}
          animate={{ height: `${height * 100}%` }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.5,
          }}
        />
      ))}
    </div>
  );
}
