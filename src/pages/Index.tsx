import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import AudioUpload from "@/components/AudioUpload";
import LocationInput from "@/components/LocationInput";
import SpeciesResults, { type Detection } from "@/components/SpeciesResults";
import TEKAnnotationModal from "@/components/TEKAnnotationModal";
import DetectionTimeline from "@/components/DetectionTimeline";
import ExportPanel from "@/components/ExportPanel";
import StepperNav, { type StepKey } from "@/components/StepperNav";

// Wikipedia thumbnail helper — fetches species image via Wikimedia API
async function fetchSpeciesThumbnail(commonName: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(commonName)}`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.thumbnail?.source;
  } catch {
    return undefined;
  }
}

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top: y, behavior: "smooth" });
};

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("");
  const [tekModal, setTekModal] = useState<{ open: boolean; detectionId: string }>({
    open: false,
    detectionId: "",
  });
  const lastFileId = useRef<string | null>(null);

  const completed = useMemo(
    () => ({
      upload: !!audioFile,
      location: !!(latitude && longitude),
      results: detections.length > 0,
    }),
    [audioFile, latitude, longitude, detections.length]
  );

  const current: StepKey = !audioFile
    ? "upload"
    : detections.length === 0
      ? "location"
      : "results";

  // Auto-scroll to next step when file is added
  useEffect(() => {
    if (audioFile) {
      const id = `${audioFile.name}-${audioFile.size}`;
      if (lastFileId.current !== id) {
        lastFileId.current = id;
        setTimeout(() => scrollToId("location"), 250);
      }
    } else {
      lastFileId.current = null;
    }
  }, [audioFile]);

  // Auto-scroll to results when detections arrive
  useEffect(() => {
    if (detections.length > 0) {
      setTimeout(() => scrollToId("results"), 250);
    }
  }, [detections.length]);

  const handleGetStarted = () => scrollToId("upload");

  const handleAnalyze = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("audio", file);
        if (latitude) formData.append("lat", latitude);
        if (longitude) formData.append("lon", longitude);
        formData.append("min_conf", "0.1");

        const { data, error } = await supabase.functions.invoke("birdnet-analyze", {
          body: formData,
        });

        if (error) throw error;

        const raw = (data?.detections ?? []) as Array<{
          id: string;
          species: string;
          commonName: string;
          confidence: number;
          startTime: number;
          endTime: number;
        }>;

        if (raw.length === 0) {
          toast.info("No species detected with confidence above threshold.");
        }

        const withThumbs: Detection[] = await Promise.all(
          raw.map(async (d) => ({
            ...d,
            location: latitude && longitude ? `${latitude}, ${longitude}` : undefined,
            thumbnailUrl: await fetchSpeciesThumbnail(d.commonName),
          })),
        );

        setDetections(withThumbs);
      } catch (err) {
        console.error("BirdNET analysis failed:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to analyze recording. Check BirdNET server.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [latitude, longitude],
  );

  const handleAnnotate = (id: string) => {
    setTekModal({ open: true, detectionId: id });
  };

  const handleSaveTEK = (annotation: string, season: string) => {
    setDetections((prev) =>
      prev.map((d) =>
        d.id === tekModal.detectionId
          ? { ...d, tekAnnotation: `${season ? `[${season}] ` : ""}${annotation}` }
          : d
      )
    );
    setTekModal({ open: false, detectionId: "" });
  };

  const activeDetection = detections.find((d) => d.id === tekModal.detectionId);

  const handleJump = (key: StepKey) => scrollToId(key);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className={audioFile ? "block" : "hidden"}>
        <StepperNav current={current} completed={completed} onJump={handleJump} />
      </div>
      <HeroSection onGetStarted={handleGetStarted} />
      <HowItWorks />

      <AudioUpload
        file={audioFile}
        onFileChange={setAudioFile}
      />

      <div
        id="location"
        className={`container max-w-3xl mx-auto px-6 -mt-12 mb-8 scroll-mt-32 ${
          audioFile ? "block" : "hidden"
        }`}
      >
        {audioFile && (
          <LocationInput
            latitude={latitude}
            longitude={longitude}
            altitude={altitude}
            onLocationChange={(lat, lon) => {
              setLatitude(lat);
              setLongitude(lon);
            }}
            onAltitudeChange={setAltitude}
          />
        )}
      </div>

      {audioFile && (
        <div className="container max-w-3xl mx-auto px-6 mb-16 text-center">
          <button
            onClick={() => handleAnalyze(audioFile)}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-forest text-sand-light font-body font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-warm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" /> Analyze Recording
              </>
            )}
          </button>
          {!(latitude && longitude) && (
            <p className="text-xs font-body text-muted-foreground mt-3">
              Tip: add a location above for more accurate species filtering.
            </p>
          )}
        </div>
      )}

      <div id="results" className="scroll-mt-32">
        <SpeciesResults detections={detections} onAnnotate={handleAnnotate} />
      </div>
      <DetectionTimeline detections={detections} />
      <ExportPanel
        detections={detections}
        latitude={latitude}
        longitude={longitude}
        onAddTEK={handleAnnotate}
      />

      <TEKAnnotationModal
        isOpen={tekModal.open}
        speciesName={activeDetection?.commonName ?? ""}
        onClose={() => setTekModal({ open: false, detectionId: "" })}
        onSave={handleSaveTEK}
      />

      <footer className="py-12 border-t border-border">
        <div className="container max-w-6xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Lkotkote logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-savanna-gold/40"
              width={40}
              height={40}
            />
            <span className="font-display font-bold text-lg text-foreground">Lkotkote</span>
          </div>
          <p className="text-sm font-body text-muted-foreground max-w-2xl">
            © 2026 Lkotkote — Bridging bioacoustics and Traditional Ecological Knowledge for climate resilience.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
