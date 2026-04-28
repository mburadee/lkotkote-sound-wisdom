import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Skull, Users, Bird, Volume2, Loader2, ArrowLeft, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { SAMBURU_BIRDS, type SamburuBird } from "@/data/samburuTek";

type Enriched = SamburuBird & { thumbnailUrl?: string; audioUrl?: string; recordist?: string };

const CATEGORY_META: Record<
  SamburuBird["category"],
  { label: string; icon: typeof CloudRain; className: string }
> = {
  weather: { label: "Weather", icon: CloudRain, className: "bg-sky-warm/30 text-foreground border-sky-warm/40" },
  omen: { label: "Omen", icon: Skull, className: "bg-earth-brown/20 text-earth-brown border-earth-brown/30" },
  social: { label: "Social", icon: Users, className: "bg-forest-green/20 text-forest-green border-forest-green/30" },
  predator: { label: "Predator", icon: Bird, className: "bg-savanna-amber/20 text-savanna-amber border-savanna-amber/40" },
};

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

const BirdCard = ({ bird, index }: { bird: Enriched; index: number }) => {
  const meta = CATEGORY_META[bird.category];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
    >
      <Card className="overflow-hidden h-full border-border hover:shadow-warm transition-shadow bg-card">
        <div className="flex gap-4 p-4">
          <div className="relative shrink-0">
            {bird.thumbnailUrl ? (
              <img
                src={bird.thumbnailUrl}
                alt={`${bird.commonName} (${bird.localName})`}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-savanna-gold/40"
                loading="lazy"
                width={80}
                height={80}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                <Bird className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 inline-flex items-center justify-center w-7 h-7 rounded-full border ${meta.className}`}
              title={meta.label}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold text-foreground leading-tight">
                {bird.localName}
              </h3>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.className}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-sm font-body text-foreground/80 mt-0.5">{bird.commonName}</p>
            <p className="text-xs font-body italic text-muted-foreground">{bird.scientificName}</p>
            <p className="text-sm font-body font-semibold text-savanna-amber mt-2">
              Predicts: {bird.prediction}
            </p>
          </div>
        </div>

        <CardContent className="pt-0 pb-4">
          <p className="text-sm font-body text-foreground/85 leading-relaxed mb-3">
            {bird.story}
          </p>
          {bird.audioUrl ? (
            <div className="rounded-lg bg-muted/60 p-2 border border-border">
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-body text-muted-foreground">
                <Volume2 className="w-3.5 h-3.5" />
                Listen — recording courtesy of {bird.recordist ?? "Xeno-canto contributor"}
              </div>
              <audio controls preload="none" src={bird.audioUrl} className="w-full h-8" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading sound…
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SamburuTEK = () => {
  const [birds, setBirds] = useState<Enriched[]>(SAMBURU_BIRDS);
  const [filter, setFilter] = useState<SamburuBird["category"] | "all">("all");

  useEffect(() => {
    document.title = "Samburu Bird TEK — Lkotkote";
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

  const filtered = useMemo(
    () => (filter === "all" ? birds : birds.filter((b) => b.category === filter)),
    [birds, filter],
  );

  const categories: Array<{ key: typeof filter; label: string }> = [
    { key: "all", label: "All" },
    { key: "weather", label: "Weather" },
    { key: "omen", label: "Omens" },
    { key: "social", label: "Social" },
    { key: "predator", label: "Predators" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="pt-32 pb-12 bg-gradient-earth border-b border-border">
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
              Sample dataset · Samburu, Northern Kenya
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-4">
            Birds that speak the land
          </h1>
          <p className="text-lg font-body text-foreground/75 max-w-3xl leading-relaxed">
            For generations, Samburu pastoralists have read the calls of birds as warnings, weather
            forecasts, and signs from the ancestors. Below is a living sample of that knowledge — the
            same kind of community wisdom <strong>Lkotkote</strong> helps you record, link to species,
            and preserve <em>anywhere in the world</em>.
          </p>
        </div>
      </header>

      <section className="py-10">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
                  filter === c.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground/70 border-border hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((b, i) => (
              <BirdCard key={b.id} bird={b} index={i} />
            ))}
          </div>

          <div className="mt-16 p-6 rounded-xl bg-muted/50 border border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Universal by design
            </h2>
            <p className="font-body text-foreground/80 leading-relaxed">
              These entries come from Samburu elders, but the framework is universal. Whether you are
              an Indigenous knowledge holder in the Amazon, a farmer in the Mekong delta, or a birder
              in the Scottish Highlands — Lkotkote lets you pair AI species detection with the
              cultural meaning <em>your</em> community gives each call.
            </p>
            <Link
              to="/#upload"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-gradient-forest text-sand-light font-body font-semibold hover:opacity-90 transition-opacity shadow-warm"
            >
              Contribute your own recording
            </Link>
          </div>

          <p className="text-xs font-body text-muted-foreground mt-8 text-center">
            Bird photos via Wikipedia · sound recordings courtesy of{" "}
            <a href="https://xeno-canto.org" target="_blank" rel="noreferrer" className="underline">
              Xeno-canto
            </a>{" "}
            contributors (CC licensed).
          </p>
        </div>
      </section>
    </div>
  );
};

export default SamburuTEK;
