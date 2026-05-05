import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface Props {
  src: string;
  credit?: string;
}

const BirdSoundPlayer = ({ src, credit }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(35, 25%, 65%)",
      progressColor: "hsl(105, 38%, 39%)",
      cursorColor: "hsl(30, 75%, 45%)",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 56,
      normalize: true,
    });
    ws.on("ready", () => {
      setReady(true);
      setDuration(ws.getDuration());
    });
    ws.on("audioprocess", () => setCurrent(ws.getCurrentTime()));
    ws.on("seeking", () => setCurrent(ws.getCurrentTime()));
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    ws.on("finish", () => setPlaying(false));
    ws.load(src);
    wsRef.current = ws;
    return () => {
      ws.destroy();
    };
  }, [src]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg bg-muted/60 p-3 border border-border">
      <div ref={containerRef} className="rounded overflow-hidden mb-2 min-h-[56px]" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => wsRef.current?.playPause()}
          disabled={!ready}
          className="w-9 h-9 rounded-full bg-gradient-forest flex items-center justify-center text-sand-light hover:opacity-90 transition-opacity disabled:opacity-50"
          aria-label={playing ? "Pause" : "Play"}
        >
          {!ready ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : playing ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        <button
          onClick={() => {
            wsRef.current?.seekTo(0);
            wsRef.current?.play();
          }}
          disabled={!ready}
          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Restart"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="text-xs font-body text-muted-foreground tabular-nums">
          {fmt(current)} / {fmt(duration)}
        </span>
        {credit && (
          <span className="ml-auto text-[10px] font-body text-muted-foreground truncate">
            {credit}
          </span>
        )}
      </div>
    </div>
  );
};

export default BirdSoundPlayer;
