import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, ArrowRight, Bird, Globe2, MapPin, RotateCcw, Volume2, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BirdSoundPlayer from "@/components/BirdSoundPlayer";
import { Button } from "@/components/ui/button";
import { SAMBURU_BIRDS } from "@/data/samburuTek";
import { acceptedTaxonKey, occurrenceTileUrl } from "@/lib/species-occurrences";

function MapView({ birdId, world, reset }: { birdId: number; world: boolean; reset: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (world) map.fitWorld({ animate: false });
    else map.setView(birdId === 4 || birdId === 14 ? [8, 52] : [0, 25], birdId === 4 || birdId === 14 ? 2 : 3, { animate: false });
  }, [map, birdId, world, reset]);
  return null;
}

const FeaturedSoundsMap = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [world, setWorld] = useState(false);
  const [reset, setReset] = useState(0);
  const [showRecords, setShowRecords] = useState(true);
  const [tileError, setTileError] = useState(false);
  const bird = SAMBURU_BIRDS[activeIndex] ?? SAMBURU_BIRDS[0];
  const { data: taxon, isLoading, isError } = useQuery({
    queryKey: ["gbif-species", bird.scientificName],
    queryFn: async () => {
      const response = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(bird.scientificName)}`);
      if (!response.ok) throw new Error("Species source unavailable");
      const match = await response.json();
      const key = acceptedTaxonKey(match);
      if (!key) throw new Error("No verified exact species match");
      return { key, name: match.acceptedScientificName ?? match.scientificName };
    }, staleTime: 86400000, retry: 1,
  });
  const { data: count } = useQuery({
    queryKey: ["gbif-count", taxon?.key], enabled: Boolean(taxon?.key),
    queryFn: async () => {
      const response = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${taxon?.key}&hasCoordinate=true&hasGeospatialIssue=false&limit=0`);
      if (!response.ok) return undefined;
      return (await response.json()).count as number;
    }, staleTime: 86400000,
  });
  useEffect(() => { setTileError(false); setWorld(false); }, [activeIndex]);
  const navigate = (index: number) => setActiveIndex((index + SAMBURU_BIRDS.length) % SAMBURU_BIRDS.length);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Bird Occurrence & Sound Map — Lkotkote</title>
        <meta name="description" content="Explore real worldwide GBIF bird occurrences on OpenStreetMap alongside featured bird portraits, Indigenous names, and sound recordings." />
        <link rel="canonical" href="https://lkotkote.com/map" />
        <meta property="og:title" content="Bird Occurrence & Sound Map — Lkotkote" />
        <meta property="og:description" content="Explore sourced bird occurrences, Indigenous names, and sound recordings worldwide." />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 md:px-8">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div><p className="mb-1 text-xs font-semibold uppercase text-forest">Lkotkote · Featured Sounds</p><h1 className="font-display text-3xl font-bold">Sounds Map</h1></div>
          <div className="flex items-center gap-3">
            <label htmlFor="bird-selector" className="sr-only">Featured species</label>
            <select id="bird-selector" value={activeIndex} onChange={(event) => navigate(Number(event.target.value))} className="h-10 max-w-[min(300px,75vw)] rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring">
              {SAMBURU_BIRDS.map((item, index) => <option key={item.id} value={index}>{item.commonName}</option>)}
            </select>
            <span className="text-xs tabular-nums text-muted-foreground">{String(activeIndex + 1).padStart(2, "0")} / {SAMBURU_BIRDS.length}</span>
          </div>
        </header>
        <section className="grid items-start gap-7 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)] lg:gap-10">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-forest">{bird.localName}</p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight">{bird.commonName}</h2>
            <p className="mt-2 text-sm italic text-muted-foreground">{bird.scientificName}</p>
            <div className="flex h-60 items-center justify-center py-4 md:h-72">
              <SpeciesPortrait name={bird.scientificName} commonName={bird.commonName} />
            </div>
            <div className="border-t border-border py-4">
              <p className="text-xs uppercase text-muted-foreground">Traditional signal</p><p className="mt-1 text-sm font-medium">{bird.prediction}</p>
              {bird.iucnStatus && <p className="mt-3 text-xs font-semibold text-destructive">{bird.iucnStatus} · Critically Endangered</p>}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-forest" /> Global species occurrences</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showRecords} onChange={(event) => setShowRecords(event.target.checked)} className="accent-secondary" /> Records</label>
                <Button size="icon" variant="outline" aria-label="View worldwide occurrences" title="World view" onClick={() => setWorld(true)}><Globe2 /></Button>
                <Button size="icon" variant="outline" aria-label="Reset species map" title="Reset map" onClick={() => { setWorld(false); setReset((value) => value + 1); }}><RotateCcw /></Button>
              </div>
            </div>
            <div className="lk-sound-map relative h-[400px] overflow-hidden rounded-md border border-border md:h-[460px]">
              <MapContainer center={[0, 25]} zoom={3} minZoom={2} maxZoom={18} scrollWheelZoom zoomControl className="h-full w-full">
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                <MapView birdId={bird.id} world={world} reset={reset} />
                {taxon && showRecords && <TileLayer key={taxon.key} url={occurrenceTileUrl(taxon.key)} attribution='<a href="https://www.gbif.org">GBIF.org</a> occurrences' opacity={0.85} maxNativeZoom={14} maxZoom={18} eventHandlers={{ tileerror: () => setTileError(true) }} />}
              </MapContainer>
              {(isLoading || isError || tileError) && <div className="absolute bottom-7 left-3 right-3 z-[500] rounded border border-border bg-background/95 p-3 text-xs shadow-card">{isLoading ? "Loading verified species records…" : "Occurrence source unavailable. Please try again shortly."}</div>}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-forest" /> Recorded presence{count !== undefined ? ` · ${count.toLocaleString()} georeferenced records` : ""}</p>
              <a className="inline-flex items-center gap-1 text-forest underline underline-offset-4" href={taxon ? `https://www.gbif.org/occurrence/search?taxon_key=${taxon.key}&has_coordinate=true` : "https://www.gbif.org"} target="_blank" rel="noopener noreferrer">GBIF source <ExternalLink className="h-3 w-3" /></a>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Observed locations, not complete habitat boundaries. Coverage varies; historical, captive, and uncertain records may be included.</p>
          </div>
        </section>
        <section className="mt-6 flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center">
          <Button variant="outline" size="icon" aria-label="Previous featured bird" onClick={() => navigate(activeIndex - 1)}><ArrowLeft /></Button>
          <div className="min-w-0 flex-1">{bird.localAudio ? <BirdSoundPlayer key={bird.id} src={bird.localAudio} credit={bird.audioCredit} immersive /> : <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground"><Volume2 className="h-4 w-4" /> Recording not yet available</div>}</div>
          <Button onClick={() => navigate(activeIndex + 1)} className="bg-forest text-secondary-foreground hover:bg-forest/90">Scroll next <ArrowRight /></Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// Locally stored asset pointers preserve photographer attribution and edited cut-outs.
const portraitModules = import.meta.glob<{ default: { url: string; author: string; source: string; license: string } }>("../assets/bird-portraits/*.asset.json", { eager: true });
function SpeciesPortrait({ name, commonName }: { name: string; commonName: string }) {
  const key = `../assets/bird-portraits/${name.toLowerCase().replace(/ /g, "_")}.asset.json`;
  const portrait = portraitModules[key]?.default;
  return portrait ? <figure className="flex h-full w-full flex-col items-center justify-center"><img src={portrait.url} alt={commonName} className="min-h-0 w-full flex-1 object-contain" /><figcaption className="mt-2 text-center text-[10px] text-muted-foreground"><a href={portrait.source} target="_blank" rel="noopener noreferrer" className="underline">{portrait.author} · {portrait.license} · background removed</a></figcaption></figure> : <Bird className="h-20 w-20 text-forest" aria-label="Bird portrait unavailable" />;
}
export default FeaturedSoundsMap;
