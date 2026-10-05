import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface Props {
  src: string;
  credit?: string;
  immersive?: boolean;
}

const BirdSoundPlayer = ({ src, credit, immersive = false }: Props) => {
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
      waveColor: immersive ? "hsl(145, 12%, 38%)" : "hsl(35, 25%, 65%)",
      progressColor: immersive ? "hsl(82, 90%, 60%)" : "hsl(105, 38%, 39%)",
      cursorColor: immersive ? "hsl(82, 90%, 60%)" : "hsl(30, 75%, 45%)",
      barWidth: immersive ? 3 : 2,
      barGap: immersive ? 2 : 1,
      barRadius: 3,
      height: immersive ? 78 : 56,
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

  if (immersive) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => wsRef.current?.playPause()}
            disabled={!ready}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-map-signal text-map-ink shadow-signal transition-transform hover:scale-105 disabled:opacity-50"
            aria-label={playing ? "Pause bird sound" : "Play bird sound"}
          >
            {!ready ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div ref={containerRef} className="min-h-[78px] overflow-hidden" />
            <div className="mt-1 flex items-center justify-between gap-3 font-body text-[10px] uppercase text-map-muted">
              <span className="tabular-nums">{fmt(current)} / {fmt(duration)}</span>
              {credit && <span className="truncate">Recording: {credit}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
