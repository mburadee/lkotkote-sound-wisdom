import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import AudioUpload from "@/components/AudioUpload";
import LocationInput from "@/components/LocationInput";
import SpeciesResults, { type Detection } from "@/components/SpeciesResults";
import TEKAnnotationModal from "@/components/TEKAnnotationModal";
import DetectionTimeline from "@/components/DetectionTimeline";
import ExportPanel from "@/components/ExportPanel";

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

const MOCK_DETECTIONS: Omit<Detection, "thumbnailUrl">[] = [
  {
    id: "1",
    species: "Tockus flavirostris",
    commonName: "Eastern Yellow-billed Hornbill",
    confidence: 0.94,
    startTime: 2.3,
    endTime: 5.8,
    location: "Samburu County",
  },
  {
    id: "2",
    species: "Turdoides jardineii",
    commonName: "Arrow-marked Babbler",
    confidence: 0.87,
    startTime: 8.1,
    endTime: 12.4,
    location: "Samburu County",
  },
  {
    id: "3",
    species: "Bubalornis niger",
    commonName: "Red-billed Buffalo Weaver",
    confidence: 0.82,
    startTime: 15.0,
    endTime: 18.3,
    location: "Samburu County",
  },
  {
    id: "4",
    species: "Lamprotornis superbus",
    commonName: "Superb Starling",
    confidence: 0.78,
    startTime: 22.1,
    endTime: 25.7,
    location: "Samburu County",
  },
  {
    id: "5",
    species: "Merops pusillus",
    commonName: "Little Bee-eater",
    confidence: 0.71,
    startTime: 30.2,
    endTime: 33.5,
    location: "Samburu County",
  },
];

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [tekModal, setTekModal] = useState<{ open: boolean; detectionId: string }>({
    open: false,
    detectionId: "",
  });

  const handleGetStarted = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("audio", file);
        if (latitude) formData.append("lat", latitude);
        if (longitude) formData.append("lon", longitude);
        formData.append("min_conf", "0.5");

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onGetStarted={handleGetStarted} />
      <HowItWorks />

      <AudioUpload
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        file={audioFile}
        onFileChange={setAudioFile}
      />

      {audioFile && (
        <div className="container max-w-3xl mx-auto px-6 -mt-12 mb-12">
          <LocationInput
            latitude={latitude}
            longitude={longitude}
            onLocationChange={(lat, lon) => {
              setLatitude(lat);
              setLongitude(lon);
            }}
          />
        </div>
      )}

      <SpeciesResults detections={detections} onAnnotate={handleAnnotate} />
      <DetectionTimeline detections={detections} />
      <ExportPanel detections={detections} latitude={latitude} longitude={longitude} />

      <TEKAnnotationModal
        isOpen={tekModal.open}
        speciesName={activeDetection?.commonName ?? ""}
        onClose={() => setTekModal({ open: false, detectionId: "" })}
        onSave={handleSaveTEK}
      />

      <footer className="py-12 border-t border-border">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-body text-muted-foreground">
            © 2026 Lkotkote — Bridging bioacoustics and Traditional Ecological Knowledge for climate resilience.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
