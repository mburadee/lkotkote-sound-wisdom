import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecorded: (file: File) => void;
}

const AudioRecorder = ({ onRecorded }: AudioRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone not supported in this browser.");
      return;
    }
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const ext = (recorder.mimeType || "audio/webm").includes("webm") ? "webm" : "wav";
        const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: blob.type });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        onRecorded(file);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied.");
    } finally {
      setRequesting(false);
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {recording ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center">
              <Mic className="w-6 h-6 text-destructive-foreground" />
            </div>
          </motion.div>
          <p className="font-display text-2xl text-foreground tabular-nums">{mm}:{ss}</p>
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background font-body font-semibold hover:opacity-90 transition-opacity"
          >
            <Square className="w-4 h-4" /> Stop & Use Recording
          </button>
        </>
      ) : (
        <button
          onClick={start}
          disabled={requesting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-card text-foreground font-body font-semibold hover:bg-muted transition-colors disabled:opacity-50"
        >
          {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          {requesting ? "Requesting mic…" : "Record audio live"}
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
