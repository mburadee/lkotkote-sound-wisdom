import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface Bird {
  commonName: string;
  scientificName: string;
  region: string;
  imageUrl: string;
  audioUrl: string;
  detections: string;
}

// Curated sample birds — Wikimedia images + Xeno-canto CC audio streams
const BIRDS: Bird[] = [
  {
    commonName: "Northern Red-billed Hornbill",
    scientificName: "Tockus erythrorhynchus",
    region: "Detected 2,148 times across East Africa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Tockus_erythrorhynchus_-Tarangire_National_Park%2C_Tanzania-8.jpg/800px-Tockus_erythrorhynchus_-Tarangire_National_Park%2C_Tanzania-8.jpg",
    audioUrl: "https://xeno-canto.org/sounds/uploaded/SQNHRWBYUC/XC712413-Tockus_erythrorhynchus_kempi.mp3",
    detections: "2,148",
  },
  {
    commonName: "African Fish Eagle",
    scientificName: "Haliaeetus vocifer",
    region: "Detected 1,047 times along Rift Valley lakes",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/African_Fish_Eagle_calling.jpg/800px-African_Fish_Eagle_calling.jpg",
    audioUrl: "https://xeno-canto.org/sounds/uploaded/RUEFGFHAEM/XC601595-Haliaeetus_vocifer.mp3",
    detections: "1,047",
  },
  {
    commonName: "Common Bulbul",
    scientificName: "Pycnonotus barbatus",
    region: "Detected 4,512 times in 18 countries",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Common_Bulbul_-_Mole_-_Ghana_S4E6035_%2816076918448%29.jpg/800px-Common_Bulbul_-_Mole_-_Ghana_S4E6035_%2816076918448%29.jpg",
    audioUrl: "https://xeno-canto.org/sounds/uploaded/HWYCJNNDXW/XC707413-Common%20Bulbul%20-%20Pycnonotus%20barbatus.mp3",
    detections: "4,512",
  },
];

// Static stylised waveform shape
const WAVE_BARS = Array.from({ length: 56 }, (_, i) => {
  const t = i / 56;
  const v = Math.abs(Math.sin(t * 9)) * 0.7 + Math.abs(Math.sin(t * 23)) * 0.3;
  return Math.max(0.18, v);
});

const FeaturedBirds = () => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bird = BIRDS[idx];

  // Reset audio when bird changes
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [idx]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const next = () => setIdx((i) => (i + 1) % BIRDS.length);
  const prev = () => setIdx((i) => (i - 1 + BIRDS.length) % BIRDS.length);

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const activeBar = Math.floor((pct / 100) * WAVE_BARS.length);

  return (
    <section
      id="featured-birds"
      className="relative py-24 overflow-hidden bg-foreground"
    >
      {/* subtle backdrop pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, hsl(var(--savanna-gold)) 0, transparent 35%), radial-gradient(circle at 80% 70%, hsl(var(--forest-green)) 0, transparent 40%)",
        }}
      />

      <div className="container max-w-6xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-savanna-gold/15 border border-savanna-gold/30 text-xs font-body uppercase tracking-wider text-savanna-gold mb-6">
              Featured Voices
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-sand-light leading-tight mb-6">
              Listen to the species
              <span className="text-gradient-savanna"> AI is hearing</span>
            </h2>
            <p className="text-lg font-body text-sand/70 mb-8 max-w-lg leading-relaxed">
              Every recording you upload joins a growing acoustic atlas of African
              birdlife — from hornbills calling at dawn to eagles patrolling the
              Rift Valley shores.
            </p>

            <div className="flex items-center gap-8 pt-2">
              <div>
                <div className="text-3xl font-display font-bold text-savanna-gold">12k+</div>
                <div className="text-xs font-body text-sand/50 uppercase tracking-wider">Recordings</div>
              </div>
              <div className="h-10 w-px bg-sand/15" />
              <div>
                <div className="text-3xl font-display font-bold text-savanna-gold">340+</div>
                <div className="text-xs font-body text-sand/50 uppercase tracking-wider">Species</div>
              </div>
              <div className="h-10 w-px bg-sand/15" />
              <div>
                <div className="text-3xl font-display font-bold text-savanna-gold">14</div>
                <div className="text-xs font-body text-sand/50 uppercase tracking-wider">Countries</div>
              </div>
            </div>
          </motion.div>

          {/* Right: bird card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-foreground/40 border border-sand/10 shadow-warm">
              {/* Bird image */}
              <div className="relative h-80 md:h-96 overflow-hidden">
                <motion.img
                  key={bird.imageUrl}
                  src={bird.imageUrl}
                  alt={`${bird.commonName} (${bird.scientificName})`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />

                {/* arrows */}
                <button
                  onClick={prev}
                  aria-label="Previous bird"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/60 backdrop-blur border border-sand/20 text-sand-light hover:bg-savanna-gold/30 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next bird"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/60 backdrop-blur border border-sand/20 text-sand-light hover:bg-savanna-gold/30 transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Audio panel */}
              <div className="p-6 md:p-7 -mt-20 relative">
                <div className="rounded-2xl bg-foreground/70 backdrop-blur-md border border-sand/15 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={togglePlay}
                      aria-label={playing ? "Pause" : "Play"}
                      className="shrink-0 w-12 h-12 rounded-full bg-savanna-gold text-foreground hover:scale-105 transition-transform flex items-center justify-center shadow-warm"
                    >
                      {playing ? (
                        <Pause className="w-5 h-5" fill="currentColor" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      )}
                    </button>

                    {/* Waveform */}
                    <div className="flex-1 flex items-center gap-[2px] h-12">
                      {WAVE_BARS.map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${
                            i <= activeBar ? "bg-savanna-gold" : "bg-sand/20"
                          }`}
                          style={{ height: `${h * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.01}
                    value={progress}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setProgress(v);
                      if (audioRef.current) audioRef.current.currentTime = v;
                    }}
                    className="w-full h-1 accent-savanna-gold cursor-pointer"
                    aria-label="Audio progress"
                  />

                  <div className="mt-3">
                    <h3 className="font-display font-semibold text-sand-light text-lg leading-tight">
                      {bird.commonName}{" "}
                      <span className="font-body italic font-normal text-sand/60 text-sm">
                        ({bird.scientificName})
                      </span>
                    </h3>
                    <p className="text-xs font-body text-sand/50 mt-1">{bird.region}</p>
                  </div>
                </div>

                {/* dots */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {BIRDS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Show bird ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === idx ? "w-6 bg-savanna-gold" : "w-2 bg-sand/30 hover:bg-sand/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={bird.audioUrl}
              preload="metadata"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
              onEnded={() => {
                setPlaying(false);
                setProgress(0);
              }}
              crossOrigin="anonymous"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBirds;
