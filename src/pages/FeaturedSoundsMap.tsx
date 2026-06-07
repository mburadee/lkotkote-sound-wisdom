import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { ArrowLeft, Bird, Globe, Volume2 } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BirdSoundPlayer from "@/components/BirdSoundPlayer";
import { SAMBURU_BIRDS, type SamburuBird } from "@/data/samburuTek";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Namunyak Conservancy, Northern Kenya
const NAMUNYAK: [number, number] = [0.9453087, 37.4025396];

type Enriched = SamburuBird & {
  lat: number;
  lon: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  recordist?: string;
};

// Deterministic pseudo-random offset so markers stay put between renders.
function seededOffset(seed: number) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 99.13 + n * 7.71) * 43758.5453;
    return x - Math.floor(x);
  };
  // ~0.35 deg spread around the conservancy
  const lat = NAMUNYAK[0] + (rand(1) - 0.5) * 0.7;
  const lon = NAMUNYAK[1] + (rand(2) - 0.5) * 0.7;
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

const BirdPopup = ({ bird }: { bird: Enriched }) => {
  const audioSrc = bird.localAudio ?? bird.audioUrl;
  return (
    <div className="w-[260px]">
      <div className="flex gap-3 items-start mb-2">
        {bird.thumbnailUrl ? (
          <img
            src={bird.thumbnailUrl}
            alt={`${bird.commonName} (${bird.localName})`}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-savanna-gold/40 shrink-0"
            width={56}
            height={56}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center ring-2 ring-border shrink-0">
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
    () => SAMBURU_BIRDS.map((b) => ({ ...b, ...seededOffset(b.id) })),
    [],
  );
  const [birds, setBirds] = useState<Enriched[]>(initial);
  const [ready, setReady] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Featured Sounds Map — Lkotkote</title>
        <meta
          name="description"
          content="Explore featured bird sounds across Namunyak Conservancy on an interactive map. Click clustered markers to hear calls and read their Samburu meanings."
        />
        <link rel="canonical" href="https://lkotkote.com/map" />
        <meta property="og:title" content="Featured Sounds Map — Lkotkote" />
        <meta
          property="og:description"
          content="An interactive map of featured bird sounds around Namunyak Conservancy, Northern Kenya."
        />
        <meta property="og:url" content="https://lkotkote.com/map" />
      </Helmet>
      <Navbar />

      <header className="pt-32 pb-10 bg-gradient-earth border-b border-border">
        <div className="container max-w-5xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-savanna-gold/15 border border-savanna-gold/40 mb-4">
            <Globe className="w-3.5 h-3.5 text-savanna-amber" />
            <span className="text-xs font-body font-medium text-savanna-amber tracking-wide">
              Namunyak Conservancy · Northern Kenya
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-4">
            Featured sounds map
          </h1>
          <p className="text-lg font-body text-foreground/75 max-w-3xl leading-relaxed">
            Each marker is a featured bird recorded across Namunyak Conservancy. Click a marker to
            see the species, hear its call, view the sound-graph, and read its Samburu meaning.
          </p>
        </div>
      </header>

      <section className="py-10">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden border border-border h-[600px] relative z-0 bg-muted">
            {ready && (
              <MapContainer center={NAMUNYAK} zoom={10} scrollWheelZoom className="h-full w-full">
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Esri Satellite">
                    <TileLayer
                      attribution="Tiles &copy; Esri"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19}
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                <MarkerClusterGroup chunkedLoading>
                  {birds.map((b) => (
                    <Marker key={b.id} position={[b.lat, b.lon]}>
                      <Popup minWidth={260} maxWidth={300}>
                        <BirdPopup bird={b} />
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </div>
          <p className="text-xs font-body text-muted-foreground mt-6 text-center">
            Marker locations are illustrative samples around Namunyak Conservancy. Bird photos via
            Wikipedia · sound recordings courtesy of{" "}
            <a href="https://xeno-canto.org" target="_blank" rel="noreferrer" className="underline">
              Xeno-canto
            </a>{" "}
            contributors (CC licensed).
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FeaturedSoundsMap;
