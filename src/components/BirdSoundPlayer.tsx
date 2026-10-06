import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";

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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setReady(false);
    setPlaying(false);
    setFailed(false);
    setCurrent(0);
    setDuration(0);
    const tokens = getComputedStyle(document.documentElement);
    const tokenColor = (name: string) => `hsl(${tokens.getPropertyValue(name).trim()})`;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: tokenColor("--muted-foreground"),
      progressColor: tokenColor("--forest-green"),
      cursorColor: tokenColor("--primary"),
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
    ws.on("error", () => setFailed(true));
    void ws.load(src).catch(() => setFailed(true));
    wsRef.current = ws;
    return () => {
      ws.destroy();
    };
  }, [src, immersive]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (immersive) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 md:gap-6">
          <Button size="icon"
            onClick={() => wsRef.current?.playPause()}
            disabled={!ready}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-forest text-secondary-foreground hover:bg-forest/90 disabled:opacity-50"
            aria-label={playing ? "Pause bird sound" : "Play bird sound"}
          >
            {!ready ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </Button>
          <div className="min-w-0 flex-1">
            <div ref={containerRef} className="min-h-[78px] overflow-hidden" />
            <div className="mt-1 flex items-center justify-between gap-3 font-body text-[10px] uppercase text-muted-foreground">
              <span className="tabular-nums">{fmt(current)} / {fmt(duration)}</span>
              {credit && <span className="truncate">Recording: {credit}</span>}
            </div>
            {failed && <p className="mt-1 text-xs text-destructive">Recording unavailable</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted/60 p-3 border border-border">
      <div ref={containerRef} className="rounded overflow-hidden mb-2 min-h-[56px]" />
      <div className="flex items-center gap-2">
        <Button size="icon"
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
        </Button>
        <Button size="icon" variant="outline"
          onClick={() => {
            wsRef.current?.seekTo(0);
            wsRef.current?.play();
          }}
          disabled={!ready}
          className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Restart"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
        <span className="text-xs font-body text-muted-foreground tabular-nums">
          {fmt(current)} / {fmt(duration)}
        </span>
        {credit && (
          <span className="ml-auto text-[10px] font-body text-muted-foreground truncate">
            {credit}
          </span>
        )}
      </div>
      {failed && <p className="mt-1 text-xs text-destructive">Recording unavailable</p>}
    </div>
  );
};

export default BirdSoundPlayer;
