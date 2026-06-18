import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { ReadyScreen } from "./components/ReadyScreen";
import { RecordingScreen, globalMessages } from "./components/RecordingScreen";
import { ProcessingScreen } from "./components/ProcessingScreen";

export type AppState = "ready" | "recording" | "processing";

function App() {
  const [appState, setAppState] = useState<AppState>("ready");
  const stateRef = useRef<AppState>("ready");
  stateRef.current = appState;

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Simulate Global Shortcut: Cmd/Ctrl + Shift + E
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        
        if (stateRef.current === "ready") {
          setAppState("recording");
          invoke("start_recording").catch(console.error);
        } else if (stateRef.current === "recording") {
          setAppState("processing");
          
          // Stop recording on backend
          // We pass a copy of globalMessages to avoid mutations before serialization
          invoke("stop_recording", { transcript: [...globalMessages] })
            .then(() => {
              // Clear global messages for next recording after successful send
              globalMessages.length = 0;
            })
            .catch(console.error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-screen bg-transparent flex items-center justify-center p-4">
      {/* Fixed Window Size Container simulating a lightweight utility app */}
      <div className="w-[420px] h-[520px] glass-panel rounded-3xl overflow-hidden relative shadow-2xl flex flex-col bg-background/90">
        <AnimatePresence mode="wait">
          {appState === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ReadyScreen />
            </motion.div>
          )}

          {appState === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <RecordingScreen />
            </motion.div>
          )}

          {appState === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <ProcessingScreen onComplete={() => setAppState("ready")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
