import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, FileAudio } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  file: File;
  onRemove: () => void;
}

const AudioPlayer = ({ file, onRemove }: AudioPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(35, 25%, 70%)",
      progressColor: "hsl(150, 30%, 28%)",
      cursorColor: "hsl(30, 75%, 45%)",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
    });

    ws.on("ready", () => {
      setDuration(ws.getDuration());
    });
    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });
    ws.on("seeking", () => {
      setCurrentTime(ws.getCurrentTime());
    });
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    const url = URL.createObjectURL(file);
    ws.load(url);
    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const restart = useCallback(() => {
    wavesurferRef.current?.seekTo(0);
    wavesurferRef.current?.play();
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-3 mb-4">
        <FileAudio className="w-5 h-5 text-forest" />
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-foreground text-sm truncate">
            {file.name}
          </p>
          <p className="text-xs font-body text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
        >
          Remove
        </button>
      </div>

      <div ref={containerRef} className="mb-4 rounded-lg overflow-hidden" />

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gradient-forest flex items-center justify-center text-sand-light hover:opacity-90 transition-opacity"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={restart}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-body text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
