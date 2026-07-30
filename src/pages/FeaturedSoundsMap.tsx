import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, Bird, Volume2, AlertTriangle } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BirdSoundPlayer from "@/components/BirdSoundPlayer";
import { SAMBURU_BIRDS, type SamburuBird } from "@/data/samburuTek";

// Kenya center + tight bounds for a national editorial map view
const KENYA_CENTER: [number, number] = [0.6, 37.9];
const KENYA_BOUNDS: L.LatLngBoundsLiteral = [
  [-4.9, 33.7],
  [5.2, 42.1],
];

type Sample = { id: string; birdId: number; lat: number; lon: number; abundance: number };
type Enriched = SamburuBird & {
  thumbnailUrl?: string;
  audioUrl?: string;
  recordist?: string;
};

// Editorial palette — mirrors the reference map (muted red / blue / green)
const CAT_STYLE: Record<
  SamburuBird["category"],
  { color: string; label: string }
> = {
  endangered: { color: "#d64545", label: "Critically endangered" },
  predator: { color: "#c98a2b", label: "Predator" },
  weather: { color: "#3a76b8", label: "Weather reader" },
  omen: { color: "#6b4a2a", label: "Omen keeper" },
  social: { color: "#3f7a3a", label: "Community bird" },
};

// Seeded PRNG so dots are stable between renders
function rand(seed: number, n: number) {
  const x = Math.sin(seed * 99.13 + n * 7.71) * 43758.5453;
  return x - Math.floor(x);
}

// Regional bias per bird category so each species reads as a range map.
// Values are rough Kenyan biogeographic zones (northern arid, central highlands,
// coastal, western lakes) — purely illustrative.
const REGION_BIAS: Record<SamburuBird["category"], Array<[number, number, number]>> = {
  // [lat, lon, spread]
  endangered: [
    [1.6, 36.3, 1.4], // northern rift / Samburu
    [-1.5, 37.2, 1.2], // Nairobi + Athi plains
    [2.6, 40.0, 1.4], // north-east
  ],
  predator: [
    [0.5, 37.4, 2.0],
    [-2.5, 38.5, 1.5],
  ],
  weather: [
    [0.0, 37.0, 2.4],
    [-3.5, 39.8, 1.2], // coast
  ],
  omen: [
    [0.9, 37.6, 2.0],
    [-0.5, 35.5, 1.4], // western highlands
  ],
  social: [
    [0.6, 37.8, 2.4],
    [-1.2, 36.9, 1.4],
    [-3.5, 39.7, 1.0],
  ],
};

function generateSamples(bird: SamburuBird): Sample[] {
  const regions = REGION_BIAS[bird.category];
  const perRegion = bird.category === "endangered" ? 3 : 2;
  const samples: Sample[] = [];
  regions.forEach((r, ri) => {
    for (let i = 0; i < perRegion; i++) {
      const rx = rand(bird.id * 13 + ri * 5, i * 3 + 1) - 0.5;
      const ry = rand(bird.id * 17 + ri * 7, i * 3 + 2) - 0.5;
      const lat = r[0] + rx * r[2];
      const lon = r[1] + ry * r[2];
      // Kenya land bbox
      if (lat < -4.6 || lat > 4.6 || lon < 33.95 || lon > 41.9) continue;
      // Trim Indian Ocean along the south-eastern coast (rough diagonal)
      if (lat < -1.6 && lon > 41.0) continue;
      if (lat < -3.0 && lon > 40.4) continue;
      if (lat < -4.0 && lon > 39.9) continue;
      // Trim Lake Victoria (SW corner)
      if (lat < -0.2 && lat > -1.5 && lon < 34.5) continue;
      const abundance = 0.35 + rand(bird.id, i * 5 + ri) * 0.65;
      samples.push({ id: `${bird.id}-${ri}-${i}`, birdId: bird.id, lat, lon, abundance });
    }
  });
  return samples;
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

// Small, flat coloured dot — matches the editorial reference map exactly.
function dotIcon(color: string, abundance: number) {
  const size = Math.round(6 + abundance * 8); // 6 → 14 px
  const html = `<div style="
    width:${size}px;height:${size}px;border-radius:9999px;
    background:${color};
    border:1px solid rgba(255,255,255,.85);
    box-shadow:0 0 0 0.5px rgba(0,0,0,.25);
  "></div>`;
  return L.divIcon({
    html,
    className: "lk-dot",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

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
            className="w-16 h-16 rounded-full object-cover shrink-0"
            style={{ boxShadow: `0 0 0 2px ${s.color}66` }}
            width={64}
            height={64}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0">
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
  const [birds, setBirds] = useState<Enriched[]>(SAMBURU_BIRDS);
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState<[number, number, number] | null>(null);
  const [activeCats, setActiveCats] = useState<Set<SamburuBird["category"]>>(
    new Set(["weather", "omen", "social", "predator", "endangered"]),
  );
  const [hiddenBirds, setHiddenBirds] = useState<Set<number>>(new Set());

  const samples = useMemo(() => SAMBURU_BIRDS.flatMap(generateSamples), []);
  const birdMap = useMemo(() => {
    const m = new Map<number, Enriched>();
    birds.forEach((b) => m.set(b.id, b));
    return m;
  }, [birds]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const enriched = await Promise.all(
        SAMBURU_BIRDS.map(async (b) => {
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
  }, []);

  const visibleSamples = samples.filter((s) => {
    const b = birdMap.get(s.birdId);
    return b && activeCats.has(b.category) && !hiddenBirds.has(b.id);
  });

  const toggleCat = (c: SamburuBird["category"]) => {
    setActiveCats((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  };

  const toggleBird = (id: number) => {
    setHiddenBirds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const grouped = useMemo(() => {
    const order: SamburuBird["category"][] = [
      "endangered",
      "predator",
      "weather",
      "omen",
      "social",
    ];
    return order
      .map((c) => ({ cat: c, list: birds.filter((b) => b.category === c) }))
      .filter((g) => g.list.length > 0);
  }, [birds]);

  const flyToBird = (b: Enriched) => {
    const first = samples.find((s) => s.birdId === b.id);
    if (first) setTarget([first.lat, first.lon, 8]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sounds Map — Featured Birds of Kenya · Lkotkote</title>
        <meta
          name="description"
          content="An editorial bioacoustic atlas of Kenya. Explore 17 featured birds — including three critically endangered vultures — with calls, waveforms, and Samburu Traditional Ecological Knowledge."
        />
        <link rel="canonical" href="https://lkotkote.com/map" />
        <meta property="og:title" content="Sounds Map — Lkotkote" />
        <meta property="og:url" content="https://lkotkote.com/map" />
        <style>{`
          .leaflet-popup-content-wrapper { border-radius: 14px; }
          .leaflet-popup-content { margin: 12px 14px; }
          .lk-editorial .leaflet-container { background: #f4f1ea; font-family: 'Source Sans 3', sans-serif; }
        `}</style>
      </Helmet>
      <Navbar />

      <section className="pt-24 pb-8 bg-[#f4f1ea]">
        <div className="container max-w-[1400px] mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          {/* Editorial map canvas */}
          <div className="lk-editorial relative rounded-lg overflow-hidden border border-black/10 bg-[#f4f1ea] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] h-[68vh] min-h-[460px] max-h-[620px]">
            {ready && (
              <MapContainer
                center={KENYA_CENTER}
                zoom={6}
                minZoom={5}
                maxZoom={10}
                scrollWheelZoom
                zoomControl={true}
                attributionControl={false}
                maxBounds={KENYA_BOUNDS}
                className="h-full w-full"
              >
                {/* Pale editorial base (CartoDB Positron) */}
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                  url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />
                <TileLayer
                  attribution=""
                  url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />

                <MapController target={target} />

                {visibleSamples.map((s) => {
                  const b = birdMap.get(s.birdId)!;
                  const st = CAT_STYLE[b.category];
                  return (
                    <Marker
                      key={s.id}
                      position={[s.lat, s.lon]}
                      icon={dotIcon(st.color, s.abundance)}
                    >
                      <Popup minWidth={280} maxWidth={320}>
                        <BirdPopup bird={b} />
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}

            {/* Editorial title — top-left */}
            <div className="absolute top-4 left-4 z-[400] max-w-[380px] pointer-events-none bg-white/90 backdrop-blur rounded-lg border border-black/10 shadow-sm px-4 py-3">
              <h1 className="font-display font-bold text-foreground text-xl md:text-2xl leading-tight tracking-tight m-0">
                Featured Birds of Kenya
              </h1>
              <p className="font-body text-foreground/75 text-xs md:text-sm mt-1 leading-snug">
                Occurrence &amp; relative abundance across Kenya
              </p>
              <p className="font-body text-foreground/60 text-[10px] md:text-xs mt-0.5">
                Samburu TEK · Xeno-canto recordings
              </p>
            </div>

            {/* Species filter panel — top-right */}
            <div className="absolute top-4 right-4 z-[400] w-[290px] bg-white/92 backdrop-blur rounded-lg border border-black/10 shadow-md pointer-events-auto flex flex-col max-h-[calc(100%-2rem)]">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="text-[11px] font-body font-semibold text-foreground/70 uppercase tracking-wider">
                  Filter species
                </div>
                <button
                  onClick={() => {
                    setHiddenBirds(new Set());
                    setActiveCats(
                      new Set(["weather", "omen", "social", "predator", "endangered"]),
                    );
                  }}
                  className="text-[10px] font-body text-foreground/60 hover:text-foreground underline"
                >
                  Reset
                </button>
              </div>
              <div className="overflow-y-auto px-4 pb-3 space-y-3">
                {grouped.map(({ cat, list }) => {
                  const s = CAT_STYLE[cat];
                  const catOn = activeCats.has(cat);
                  return (
                    <div key={cat}>
                      <button
                        onClick={() => toggleCat(cat)}
                        className={`flex items-center gap-2 w-full text-left mb-1.5 transition-opacity ${
                          catOn ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: s.color }}
                        />
                        <span className="text-[10px] font-body font-semibold uppercase tracking-wider text-foreground/70">
                          {s.label}
                        </span>
                      </button>
                      <ul className="space-y-1.5 pl-1">
                        {list.map((b) => {
                          const on = catOn && !hiddenBirds.has(b.id);
                          return (
                            <li key={b.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggleBird(b.id)}
                                disabled={!catOn}
                                aria-label={`Toggle ${b.commonName}`}
                                className="accent-[#4e8a3e] w-3 h-3 shrink-0"
                              />
                              {b.thumbnailUrl ? (
                                <img
                                  src={b.thumbnailUrl}
                                  alt=""
                                  className={`w-7 h-7 rounded object-cover shrink-0 ${
                                    on ? "" : "grayscale opacity-50"
                                  }`}
                                />
                              ) : (
                                <span className="w-7 h-7 rounded bg-muted shrink-0" />
                              )}
                              <button
                                onClick={() => flyToBird(b)}
                                className={`text-left flex-1 min-w-0 hover:opacity-70 transition-opacity ${
                                  on ? "" : "opacity-50"
                                }`}
                              >
                                <div className="font-body font-semibold text-foreground text-[11px] leading-tight truncate">
                                  {b.commonName}
                                </div>
                                <div className="text-[10px] font-body text-foreground/60 truncate">
                                  {b.localName}
                                </div>
                              </button>
                              {b.iucnStatus && (
                                <span
                                  className={`text-[9px] font-body font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                    b.iucnStatus === "CR"
                                      ? "bg-red-600 text-white"
                                      : b.iucnStatus === "EN"
                                        ? "bg-orange-500 text-white"
                                        : "bg-amber-400 text-black"
                                  }`}
                                >
                                  {b.iucnStatus}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Species legend — bottom-right */}
            <div className="absolute bottom-6 right-6 z-[400] w-[300px] bg-white/90 backdrop-blur rounded-lg border border-black/10 p-4 shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-body font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                    Species group
                  </div>
                  <ul className="space-y-1.5">
                    {(Object.keys(CAT_STYLE) as SamburuBird["category"][]).map((c) => {
                      const s = CAT_STYLE[c];
                      const active = activeCats.has(c);
                      return (
                        <li key={c}>
                          <button
                            onClick={() => toggleCat(c)}
                            className={`flex items-center gap-2 text-left w-full text-[11px] font-body transition-opacity ${
                              active ? "opacity-100" : "opacity-30 hover:opacity-60"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="text-foreground/80">{s.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-body font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                    Relative abundance
                  </div>
                  <div className="flex items-end gap-1.5 h-6">
                    {[4, 6, 8, 11, 14].map((sz) => (
                      <span
                        key={sz}
                        className="rounded-full bg-foreground/70"
                        style={{ width: sz, height: sz }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] font-body text-foreground/50 mt-1">
                    <span>Lower</span>
                    <span>Higher</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-black/10 mt-3 pt-2 text-[9px] font-body text-foreground/50 leading-relaxed">
                Illustrative sample points across Kenyan biogeographic zones.
              </div>
            </div>

            {/* Footer strip — bottom-left */}
            <div className="absolute bottom-6 left-6 z-[400] text-[10px] font-body text-foreground/60">
              Data: Samburu TEK · Xeno-canto · Wikipedia &nbsp;|&nbsp; Map: Lkotkote Project &nbsp;|&nbsp; {new Date().getFullYear()}
            </div>
          </div>

          <p className="text-xs font-body text-muted-foreground mt-4 text-center max-w-2xl mx-auto leading-relaxed">
            Click any dot to hear the bird, read its Samburu meaning, and see the sound-graph of its
            call. Toggle species groups in the legend to filter the map.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturedSoundsMap;
