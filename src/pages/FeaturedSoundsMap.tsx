import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Circle,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, Bird, Globe, Volume2, AlertTriangle, MapPin, Feather } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BirdSoundPlayer from "@/components/BirdSoundPlayer";
import { SAMBURU_BIRDS, type SamburuBird } from "@/data/samburuTek";

// Namunyak Conservancy, Northern Kenya
const NAMUNYAK: [number, number] = [0.9453087, 37.4025396];

type Enriched = SamburuBird & {
  lat: number;
  lon: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  recordist?: string;
};

// Category → color + label (design-token adjacent HSL values used in tokens.css)
const CAT_STYLE: Record<
  SamburuBird["category"],
  { color: string; ring: string; label: string; glyph: string }
> = {
  weather: { color: "#3b82c4", ring: "#3b82c4", label: "Weather reader", glyph: "☁" },
  omen: { color: "#7a4a2a", ring: "#7a4a2a", label: "Omen keeper", glyph: "☾" },
  social: { color: "#4e8a3e", ring: "#4e8a3e", label: "Community bird", glyph: "◈" },
  predator: { color: "#d97706", ring: "#d97706", label: "Predator", glyph: "▲" },
  endangered: { color: "#dc2626", ring: "#dc2626", label: "Critically endangered", glyph: "✦" },
};

// Deterministic pseudo-random offset so markers stay put between renders.
function seededOffset(seed: number, spread = 0.7) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 99.13 + n * 7.71) * 43758.5453;
    return x - Math.floor(x);
  };
  const lat = NAMUNYAK[0] + (rand(1) - 0.5) * spread;
  const lon = NAMUNYAK[1] + (rand(2) - 0.5) * spread;
  return { lat, lon };
}

async function fetchWikiThumb(name: string): Promise<string | undefined> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (!r.ok) return;
    const d = await r.json();
    return d.thumbnail?.source ?? d.originalimage?.source;
  } catch {
    return;
  }
}

async function fetchXenoCanto(scientific: string): Promise<{ url?: string; recordist?: string }> {
  try {
    const q = encodeURIComponent(scientific);
    const r = await fetch(`https://xeno-canto.org/api/2/recordings?query=${q}+q:A`);
    if (!r.ok) return {};
    const d = await r.json();
    const rec = d.recordings?.[0];
    if (!rec?.file) return {};
    const url = rec.file.startsWith("http") ? rec.file : `https:${rec.file}`;
    return { url, recordist: rec.rec };
  } catch {
    return {};
  }
}

// Build a stylised bird-dot divIcon. Endangered species get a pulsing halo.
function buildIcon(cat: SamburuBird["category"]) {
  const s = CAT_STYLE[cat];
  const pulse = cat === "endangered";
  const size = pulse ? 40 : 30;
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${
        pulse
          ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${s.color};opacity:.35;animation:lkPulse 1.8s ease-out infinite;"></span>`
          : ""
      }
      <div style="
        position:absolute;inset:${pulse ? "6px" : "2px"};
        border-radius:9999px;
        background:radial-gradient(circle at 30% 30%, #fff8, ${s.color} 60%, ${s.color});
        border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,.35), 0 0 0 2px ${s.color}44;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font:700 12px/1 system-ui;">${s.glyph}</div>
    </div>`;
  return L.divIcon({
    html,
    className: "lk-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Small helper component that lets outside buttons control the map.
const MapController = ({ target }: { target: [number, number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target[0], target[1]], target[2], { duration: 0.9 });
  }, [target, map]);
  return null;
};

const BirdPopup = ({ bird }: { bird: Enriched }) => {
  const audioSrc = bird.localAudio ?? bird.audioUrl;
  const s = CAT_STYLE[bird.category];
  return (
    <div className="w-[280px]">
      <div className="flex gap-3 items-start mb-2">
        {bird.thumbnailUrl ? (
          <img
            src={bird.thumbnailUrl}
            alt={`${bird.commonName} (${bird.localName})`}
            className="w-16 h-16 rounded-full object-cover ring-2 shrink-0"
            style={{ boxShadow: `0 0 0 2px ${s.color}66` }}
            width={64}
            height={64}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-border shrink-0">
            <Bird className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-foreground leading-tight m-0">
            {bird.localName}
          </h3>
          <p className="text-xs font-body text-foreground/80 m-0">{bird.commonName}</p>
          <p className="text-[11px] font-body italic text-muted-foreground m-0">
            {bird.scientificName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span
          className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55` }}
        >
          {s.label}
        </span>
        {bird.iucnStatus === "CR" && (
          <span className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-wide inline-flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> IUCN: CR
          </span>
        )}
      </div>
      <p className="text-xs font-body font-semibold text-savanna-amber m-0 mb-1">
        Predicts: {bird.prediction}
      </p>
      <p className="text-xs font-body text-foreground/85 leading-relaxed m-0 mb-2">{bird.story}</p>
      {audioSrc ? (
        <BirdSoundPlayer src={audioSrc} credit={bird.audioCredit ?? bird.recordist} />
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
          <Volume2 className="w-3.5 h-3.5" /> No recording available
        </div>
      )}
    </div>
  );
};

const FeaturedSoundsMap = () => {
  const initial = useMemo<Enriched[]>(
    () =>
      SAMBURU_BIRDS.map((b) => ({
        ...b,
        // Endangered vultures cluster tighter to the escarpments; others spread wider.
        ...seededOffset(b.id, b.category === "endangered" ? 0.35 : 0.75),
      })),
    [],
  );
  const [birds, setBirds] = useState<Enriched[]>(initial);
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState<[number, number, number] | null>(null);
  const [activeCats, setActiveCats] = useState<Set<SamburuBird["category"]>>(
    new Set(["weather", "omen", "social", "predator", "endangered"]),
  );
  const markerRefs = useRef<Record<number, L.Marker | null>>({});

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const enriched = await Promise.all(
        initial.map(async (b) => {
          const [thumb, audio] = await Promise.all([
            fetchWikiThumb(b.commonName),
            fetchXenoCanto(b.scientificName),
          ]);
          return { ...b, thumbnailUrl: thumb, audioUrl: audio.url, recordist: audio.recordist };
        }),
      );
      if (!cancelled) setBirds(enriched);
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const visible = birds.filter((b) => activeCats.has(b.category));
  const endangeredCount = birds.filter((b) => b.category === "endangered").length;

  const toggleCat = (c: SamburuBird["category"]) => {
    setActiveCats((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  };

  const flyTo = (b: Enriched) => {
    setTarget([b.lat, b.lon, 12]);
    setTimeout(() => {
      markerRefs.current[b.id]?.openPopup();
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sounds Map — Featured Birds of Namunyak · Lkotkote</title>
        <meta
          name="description"
          content="An interactive bioacoustic atlas of Namunyak Conservancy. Explore 17 featured birds — including three critically endangered vultures — with calls, waveforms, and Samburu Traditional Ecological Knowledge."
        />
        <link rel="canonical" href="https://lkotkote.com/map" />
        <meta property="og:title" content="Sounds Map — Lkotkote" />
        <meta
          property="og:description"
          content="Bioacoustic atlas of Namunyak Conservancy with 17 featured birds and 3 critically endangered vultures."
        />
        <meta property="og:url" content="https://lkotkote.com/map" />
        <style>{`
          @keyframes lkPulse { 0% { transform:scale(.6); opacity:.6 } 100% { transform:scale(1.8); opacity:0 } }
          .leaflet-popup-content-wrapper { border-radius: 14px; }
          .leaflet-popup-content { margin: 12px 14px; }
        `}</style>
      </Helmet>
      <Navbar />

      {/* Cinematic hero */}
      <header className="relative pt-32 pb-14 overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--forest-green)) 0, transparent 40%), radial-gradient(circle at 80% 60%, hsl(var(--savanna-amber)) 0, transparent 45%), radial-gradient(circle at 50% 90%, #dc262655 0, transparent 40%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-earth" />
        <div className="relative container max-w-6xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="grid md:grid-cols-[1.6fr_1fr] gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-savanna-gold/15 border border-savanna-gold/40 mb-4">
                <Globe className="w-3.5 h-3.5 text-savanna-amber" />
                <span className="text-xs font-body font-medium text-savanna-amber tracking-wide">
                  Namunyak Conservancy · Northern Kenya · 0.945° N, 37.402° E
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-[1.05] mb-4">
                A bioacoustic atlas
                <span className="block text-forest-green">of a living landscape</span>
              </h1>
              <p className="text-lg font-body text-foreground/80 max-w-2xl leading-relaxed">
                Every dot is a voice. Tap a marker to hear the bird, read its Samburu meaning, and
                see the sound-graph of its call. Red pulses mark <strong>critically endangered
                vultures</strong> whose disappearance the elders warned us about first.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                {[
                  { k: "Species", v: birds.length, icon: Feather },
                  { k: "Critically endangered", v: endangeredCount, icon: AlertTriangle },
                  { k: "Sample points", v: birds.length, icon: MapPin },
                ].map(({ k, v, icon: I }) => (
                  <div
                    key={k}
                    className="rounded-xl bg-card/70 backdrop-blur border border-border px-3 py-3"
                  >
                    <I className="w-4 h-4 text-forest-green mb-1.5" />
                    <div className="text-2xl font-display font-bold text-foreground leading-none">
                      {v}
                    </div>
                    <div className="text-[11px] font-body text-muted-foreground mt-1">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend card */}
            <div className="rounded-2xl bg-card/85 backdrop-blur border border-border p-5 shadow-warm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">
                  Legend
                </h2>
                <span className="text-[10px] font-body text-muted-foreground">Click to filter</span>
              </div>
              <ul className="space-y-2">
                {(Object.keys(CAT_STYLE) as SamburuBird["category"][]).map((c) => {
                  const s = CAT_STYLE[c];
                  const active = activeCats.has(c);
                  const count = birds.filter((b) => b.category === c).length;
                  return (
                    <li key={c}>
                      <button
                        onClick={() => toggleCat(c)}
                        className={`w-full flex items-center gap-3 text-left px-2 py-1.5 rounded-lg transition-all ${
                          active ? "bg-muted/60" : "opacity-40 hover:opacity-70"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{
                            background: s.color,
                            boxShadow: `0 0 0 3px ${s.color}33`,
                          }}
                        />
                        <span className="text-xs font-body text-foreground flex-1">{s.label}</span>
                        <span className="text-[10px] font-body font-semibold text-muted-foreground tabular-nums">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[10px] font-body text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
                Marker positions are illustrative samples clustered around the conservancy for
                educational visualisation.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Map + side rail */}
      <section className="py-8 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <div className="rounded-2xl overflow-hidden border border-border h-[640px] relative z-0 bg-muted shadow-warm">
              {ready && (
                <MapContainer
                  center={NAMUNYAK}
                  zoom={10}
                  scrollWheelZoom
                  className="h-full w-full"
                  worldCopyJump
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer name="OpenStreetMap">
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
                        maxZoom={19}
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer checked name="Esri Satellite">
                      <TileLayer
                        attribution="Tiles &copy; Esri"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={19}
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Esri Terrain">
                      <TileLayer
                        attribution="Tiles &copy; Esri"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={13}
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  {/* Ecological halo rings around Namunyak — evokes abundance/range visuals */}
                  <Circle
                    center={NAMUNYAK}
                    radius={45000}
                    pathOptions={{
                      color: "#4e8a3e",
                      weight: 1,
                      opacity: 0.35,
                      fillColor: "#4e8a3e",
                      fillOpacity: 0.04,
                      dashArray: "4 6",
                    }}
                  />
                  <Circle
                    center={NAMUNYAK}
                    radius={22000}
                    pathOptions={{
                      color: "#d97706",
                      weight: 1,
                      opacity: 0.45,
                      fillColor: "#d97706",
                      fillOpacity: 0.05,
                      dashArray: "2 5",
                    }}
                  />
                  <Circle
                    center={NAMUNYAK}
                    radius={7000}
                    pathOptions={{
                      color: "#dc2626",
                      weight: 1.5,
                      opacity: 0.55,
                      fillColor: "#dc2626",
                      fillOpacity: 0.08,
                    }}
                  />

                  <MapController target={target} />

                  <MarkerClusterGroup chunkedLoading maxClusterRadius={45}>
                    {visible.map((b) => (
                      <Marker
                        key={b.id}
                        position={[b.lat, b.lon]}
                        icon={buildIcon(b.category)}
                        ref={(ref) => {
                          markerRefs.current[b.id] = ref;
                        }}
                      >
                        <Popup minWidth={280} maxWidth={320}>
                          <BirdPopup bird={b} />
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              )}

              {/* Overlay: Range legend (bottom-left) */}
              <div className="absolute bottom-3 left-3 z-[400] bg-card/90 backdrop-blur px-3 py-2.5 rounded-lg text-[11px] font-body shadow-card border border-border max-w-[220px]">
                <div className="font-display font-bold text-foreground text-xs mb-1.5">
                  Sampling rings
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-red-600/60 border border-red-600" />
                  <span className="text-muted-foreground">Core (7 km)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-savanna-amber/60 border border-savanna-amber" />
                  <span className="text-muted-foreground">Buffer (22 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-forest-green/60 border border-forest-green" />
                  <span className="text-muted-foreground">Range (45 km)</span>
                </div>
              </div>
            </div>

            {/* Species side rail */}
            <aside className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col max-h-[640px]">
              <div className="px-4 py-3 border-b border-border bg-gradient-earth">
                <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">
                  Featured voices
                </h2>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                  Tap a species to fly there
                </p>
              </div>
              <ul className="overflow-y-auto divide-y divide-border">
                {visible.map((b) => {
                  const s = CAT_STYLE[b.category];
                  return (
                    <li key={b.id}>
                      <button
                        onClick={() => flyTo(b)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        {b.thumbnailUrl ? (
                          <img
                            src={b.thumbnailUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                            style={{ boxShadow: `0 0 0 2px ${s.color}55` }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                            style={{ background: s.color }}
                          >
                            {s.glyph}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-display font-bold text-foreground truncate">
                              {b.localName}
                            </span>
                            {b.iucnStatus === "CR" && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white leading-none">
                                CR
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-body text-muted-foreground truncate">
                            {b.commonName}
                          </div>
                        </div>
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs font-body text-muted-foreground">
                    No species match the current filters.
                  </li>
                )}
              </ul>
            </aside>
          </div>

          {/* Endangered spotlight */}
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-card to-savanna-gold/10 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Silent skies: the vulture spotlight
              </h2>
            </div>
            <p className="font-body text-sm md:text-base text-foreground/80 max-w-3xl leading-relaxed mb-5">
              African vultures have collapsed by more than 80% in a generation. Samburu elders knew
              first — the spirals over carcasses grew thinner, the manyattas quieter. Three
              critically endangered species now feature on this map so their calls stay heard.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {birds
                .filter((b) => b.category === "endangered")
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => flyTo(b)}
                    className="text-left group rounded-xl border border-red-500/30 bg-card p-4 hover:shadow-warm hover:border-red-500/60 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {b.thumbnailUrl ? (
                        <img
                          src={b.thumbnailUrl}
                          alt={b.commonName}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 ring-2 ring-red-500/40"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded inline-block mb-1">
                          IUCN · CRITICALLY ENDANGERED
                        </div>
                        <h3 className="font-display font-bold text-foreground text-base leading-tight">
                          {b.localName}
                        </h3>
                        <p className="text-xs font-body text-muted-foreground">{b.commonName}</p>
                        <p className="text-[11px] font-body italic text-muted-foreground">
                          {b.scientificName}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-body text-foreground/80 mt-3 leading-relaxed line-clamp-3">
                      {b.story}
                    </p>
                    <div className="mt-3 text-[11px] font-body font-semibold text-red-600 group-hover:underline">
                      Locate on map →
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <p className="text-xs font-body text-muted-foreground mt-6 text-center max-w-2xl mx-auto leading-relaxed">
            Marker locations are illustrative samples around Namunyak Conservancy. Bird photos via
            Wikipedia; sound recordings courtesy of{" "}
            <a href="https://xeno-canto.org" target="_blank" rel="noreferrer" className="underline">
              Xeno-canto
            </a>{" "}
            contributors (CC licensed). IUCN status from the IUCN Red List of Threatened Species.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FeaturedSoundsMap;
