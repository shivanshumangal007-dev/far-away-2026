import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Converting speech to text...",
  "Sending transcript...",
  "Creating actions...",
];

export function ProcessingScreen({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      // Finish mock processing
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Move to next step after random time (1.5s - 3s)
    const timeout = setTimeout(() => {
      setStepIndex((s) => s + 1);
    }, Math.random() * 1500 + 1500);

    return () => clearTimeout(timeout);
  }, [stepIndex, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="flex flex-col items-center text-center">
        {/* Spinner */}
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-secondary/50" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {stepIndex >= STEPS.length && (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-full text-white"
             >
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </motion.div>
          )}
        </div>

        {/* Dynamic Text */}
        <div className="flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-medium text-lg tracking-tight text-foreground text-center px-4"
            >
              {stepIndex >= STEPS.length ? "Done!" : STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
