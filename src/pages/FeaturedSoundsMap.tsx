import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ArrowRight, Bird, ChevronDown, MapPin, Volume2 } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BirdSoundPlayer from "@/components/BirdSoundPlayer";
import { Button } from "@/components/ui/button";
import { SAMBURU_BIRDS, type SamburuBird } from "@/data/samburuTek";

type EnrichedBird = SamburuBird & {
  thumbnailUrl?: string;
  audioUrl?: string;
  recordist?: string;
};

type Habitat = {
  center: [number, number];
  zoom: number;
  radius: number;
  label: string;
};

const HABITATS: Record<SamburuBird["category"], Habitat> = {
  weather: { center: [0.45, 37.35], zoom: 6, radius: 220000, label: "Seasonal grasslands and river corridors" },
  omen: { center: [0.85, 37.2], zoom: 6, radius: 190000, label: "Acacia woodland and settled rangelands" },
  social: { center: [0.95, 37.4], zoom: 7, radius: 150000, label: "Dry savanna, cliffs and community lands" },
  predator: { center: [0.25, 37.7], zoom: 6, radius: 240000, label: "Open savanna and scrubland" },
  endangered: { center: [1.15, 37.1], zoom: 6, radius: 300000, label: "Northern rangelands and escarpments" },
};

const STATUS_LABEL: Record<NonNullable<SamburuBird["iucnStatus"]>, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
};

const categoryLabel: Record<SamburuBird["category"], string> = {
  weather: "Weather reader",
  omen: "Cultural indicator",
  social: "Community bird",
  predator: "Bird of prey",
  endangered: "At risk",
};

async function fetchWikiThumb(name: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (!response.ok) return undefined;
    const data = await response.json();
    return data.thumbnail?.source ?? data.originalimage?.source;
  } catch {
    return undefined;
  }
}

async function fetchXenoCanto(scientific: string): Promise<{ url?: string; recordist?: string }> {
  try {
    const response = await fetch(
      `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(scientific)}+q:A`,
    );
    if (!response.ok) return {};
    const data = await response.json();
    const recording = data.recordings?.[0];
    if (!recording?.file) return {};
    return {
      url: recording.file.startsWith("http") ? recording.file : `https:${recording.file}`,
      recordist: recording.rec,
    };
  } catch {
    return {};
  }
}

const habitatMarker = L.divIcon({
  className: "lk-habitat-marker",
  html: '<span class="lk-habitat-marker__pulse"></span><span class="lk-habitat-marker__core"></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapFocus = ({ habitat }: { habitat: Habitat }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(habitat.center, habitat.zoom, { duration: 1.1 });
  }, [habitat, map]);

  return null;
};

const FeaturedSoundsMap = () => {
  const [birds, setBirds] = useState<EnrichedBird[]>(SAMBURU_BIRDS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSpecies, setShowSpecies] = useState(false);
  const [ready, setReady] = useState(false);

  const activeBird = birds[activeIndex] ?? birds[0];
  const habitat = activeBird ? HABITATS[activeBird.category] : HABITATS.social;
  const audioSrc = activeBird?.localAudio ?? activeBird?.audioUrl;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      SAMBURU_BIRDS.map(async (bird) => {
        const [thumbnailUrl, audio] = await Promise.all([
          fetchWikiThumb(bird.commonName),
          bird.localAudio
            ? Promise.resolve<{ url?: string; recordist?: string }>({})
            : fetchXenoCanto(bird.scientificName),
        ]);
        return { ...bird, thumbnailUrl, audioUrl: audio.url, recordist: audio.recordist };
      }),
    ).then((enriched) => {
      if (!cancelled) setBirds(enriched);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = (index: number) => {
    const length = birds.length;
    if (!length) return;
    setActiveIndex((index + length) % length);
    setShowSpecies(false);
  };

  const progress = useMemo(() => `${String(activeIndex + 1).padStart(2, "0")} / ${String(birds.length).padStart(2, "0")}`, [activeIndex, birds.length]);

  if (!activeBird) return null;

  return (
    <div className="min-h-screen bg-map-ink text-map-foreground">
      <Helmet>
        <title>Interactive Sound Map — Featured Birds · Lkotkote</title>
        <meta name="description" content="Explore featured birds through interactive habitat maps, Indigenous knowledge and playable bioacoustic waveforms." />
        <link rel="canonical" href="https://lkotkote.com/map" />
        <meta property="og:title" content="Interactive Sound Map — Lkotkote" />
        <meta property="og:description" content="Explore featured birds through interactive habitat maps, Indigenous knowledge and playable bioacoustic waveforms." />
        <meta property="og:url" content="https://lkotkote.com/map" />
        <style>{`
          .lk-sound-map .leaflet-container { background: hsl(var(--map-ink)); font-family: var(--font-body); }
          .lk-sound-map .leaflet-tile-pane { filter: saturate(.35) brightness(.55) contrast(1.1); }
          .lk-sound-map .leaflet-control-zoom a { background: hsl(var(--map-panel) / .94); color: hsl(var(--map-foreground)); border-color: hsl(var(--map-line)); }
          .lk-sound-map .leaflet-control-attribution { background: hsl(var(--map-panel) / .82); color: hsl(var(--map-muted)); }
          .lk-sound-map .leaflet-control-attribution a { color: hsl(var(--map-signal)); }
          .lk-habitat-marker { position: relative; }
          .lk-habitat-marker__pulse, .lk-habitat-marker__core { position: absolute; inset: 50% auto auto 50%; border-radius: 999px; transform: translate(-50%, -50%); }
          .lk-habitat-marker__pulse { width: 32px; height: 32px; background: hsl(var(--map-signal) / .18); animation: habitat-pulse 2s ease-out infinite; }
          .lk-habitat-marker__core { width: 10px; height: 10px; background: hsl(var(--map-signal)); box-shadow: var(--shadow-signal); }
          @keyframes habitat-pulse { 0% { transform: translate(-50%, -50%) scale(.35); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; } }
          @media (prefers-reduced-motion: reduce) { .lk-habitat-marker__pulse { animation: none; } }
        `}</style>
      </Helmet>
      <Navbar />

      <main className="lk-sound-map relative min-h-[820px] overflow-hidden pt-20 lg:h-[calc(100vh-1rem)] lg:min-h-[720px]">
        <div className="absolute inset-x-0 bottom-0 top-20">
          {ready && (
            <MapContainer center={habitat.center} zoom={habitat.zoom} minZoom={5} maxZoom={12} scrollWheelZoom zoomControl attributionControl className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
              <MapFocus habitat={habitat} />
              <Circle center={habitat.center} radius={habitat.radius} pathOptions={{ color: "hsl(268, 78%, 66%)", fillColor: "hsl(268, 78%, 66%)", fillOpacity: 0.24, weight: 1.5, dashArray: "7 8" }} />
              <Circle center={[habitat.center[0] + 0.5, habitat.center[1] - 0.35]} radius={habitat.radius * 0.52} pathOptions={{ color: "hsl(82, 90%, 60%)", fillColor: "hsl(82, 90%, 60%)", fillOpacity: 0.1, weight: 1 }} />
              <Marker position={habitat.center} icon={habitatMarker}>
                <Tooltip direction="top" offset={[0, -12]}>{activeBird.commonName} range focus</Tooltip>
              </Marker>
            </MapContainer>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-20 z-[400] bg-[linear-gradient(90deg,hsl(var(--map-ink)/.97)_0%,hsl(var(--map-ink)/.76)_30%,transparent_58%),linear-gradient(0deg,hsl(var(--map-ink)/.98)_0%,transparent_46%)]" />

        <section className="pointer-events-none relative z-[500] mx-auto grid min-h-[740px] max-w-[1500px] grid-cols-1 px-5 pb-44 pt-8 md:px-8 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-40 lg:pt-10">
          <div className="pointer-events-auto self-start lg:col-span-4 lg:self-center">
            <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase text-map-signal">
              <span className="h-px w-8 bg-map-signal" /> Featured sound · {progress}
            </div>
            <p className="mb-2 text-sm font-semibold uppercase text-map-signal">{activeBird.localName}</p>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.03] text-map-foreground md:text-6xl lg:text-7xl">
              {activeBird.commonName}
            </h1>
            <p className="mt-3 text-lg italic text-map-muted md:text-xl">{activeBird.scientificName}</p>

            <div className="mt-7 grid max-w-md grid-cols-2 gap-5 border-y border-map-line py-5">
              <div>
                <p className="text-[10px] uppercase text-map-muted">Traditional signal</p>
                <p className="mt-1 text-sm font-semibold text-map-foreground">{activeBird.prediction}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-map-muted">Conservation</p>
                <p className="mt-1 text-sm font-semibold text-map-foreground">
                  {activeBird.iucnStatus ? STATUS_LABEL[activeBird.iucnStatus] : "Not assessed here"}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md border-l-2 border-map-range pl-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-map-muted">
                <MapPin className="h-4 w-4 text-map-range" /> Habitat &amp; range
              </div>
              <p className="mt-2 text-base text-map-foreground">{habitat.label}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-map-muted">{activeBird.story}</p>
            </div>
          </div>

          <div className="pointer-events-auto mt-6 flex items-end justify-center lg:col-span-5 lg:mt-0">
            <div className="relative h-52 w-full max-w-xl overflow-hidden border border-map-line bg-map-panel/70 shadow-2xl md:h-72 lg:h-[500px]">
              {activeBird.thumbnailUrl ? (
                <img key={activeBird.id} src={activeBird.thumbnailUrl} alt={activeBird.commonName} className="h-full w-full object-cover transition-opacity duration-500" />
              ) : (
                <div className="grid h-full place-items-center text-map-muted"><Bird className="h-20 w-20" /></div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-map-ink via-map-ink/50 to-transparent p-5 pt-16">
                <p className="text-[10px] font-semibold uppercase text-map-signal">{categoryLabel[activeBird.category]}</p>
                <p className="mt-1 text-sm text-map-foreground">Range overlay is illustrative</p>
              </div>
            </div>
          </div>

          <aside className="pointer-events-auto mt-6 self-center lg:col-span-3 lg:mt-0 lg:justify-self-end">
            <div className="relative w-full lg:w-64">
              <Button variant="outline" onClick={() => setShowSpecies((value) => !value)} className="w-full justify-between border-map-line bg-map-panel/90 text-map-foreground hover:bg-map-line hover:text-map-foreground">
                All featured birds <ChevronDown className={`h-4 w-4 transition-transform ${showSpecies ? "rotate-180" : ""}`} />
              </Button>
              {showSpecies && (
                <div className="absolute right-0 top-12 z-[700] max-h-72 w-full overflow-y-auto border border-map-line bg-map-panel/95 p-1 shadow-2xl backdrop-blur-xl">
                  {birds.map((bird, index) => (
                    <Button key={bird.id} variant="ghost" onClick={() => goTo(index)} className={`h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-xs hover:bg-map-line hover:text-map-foreground ${index === activeIndex ? "bg-map-line text-map-signal" : "text-map-muted"}`}>
                      <span className="truncate">{bird.localName} · {bird.commonName}</span>
                    </Button>
                  ))}
                </div>
              )}
              <div className="mt-8 hidden lg:block">
                <p className="text-right text-[10px] uppercase text-map-muted">Current range focus</p>
                <p className="mt-2 text-right text-sm text-map-foreground">Northern Kenya</p>
                <div className="mt-3 ml-auto h-1 w-36 bg-map-line"><div className="h-full bg-map-signal" style={{ width: `${((activeIndex + 1) / birds.length) * 100}%` }} /></div>
              </div>
            </div>
          </aside>
        </section>

        <div className="absolute inset-x-0 bottom-0 z-[600] border-t border-map-line bg-map-ink/95 px-5 py-4 backdrop-blur-xl md:px-8 lg:px-12 lg:py-5">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => goTo(activeIndex - 1)} className="text-map-muted hover:bg-map-line hover:text-map-foreground" aria-label="Previous featured bird"><ArrowLeft className="h-5 w-5" /></Button>
              <span className="min-w-14 text-center text-xs text-map-muted">{progress}</span>
            </div>
            <div className="min-w-0 flex-1">
              {audioSrc ? (
                <BirdSoundPlayer key={activeBird.id} src={audioSrc} credit={activeBird.audioCredit ?? activeBird.recordist} immersive />
              ) : (
                <div className="flex h-20 items-center justify-center gap-2 text-sm text-map-muted"><Volume2 className="h-4 w-4" /> Recording not yet available</div>
              )}
            </div>
            <Button onClick={() => goTo(activeIndex + 1)} className="h-12 shrink-0 bg-map-signal px-5 text-map-ink hover:bg-map-signal/90">
              Scroll next <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturedSoundsMap;