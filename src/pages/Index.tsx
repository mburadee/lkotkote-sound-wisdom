import { useState, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import AudioUpload from "@/components/AudioUpload";
import SpeciesResults, { type Detection } from "@/components/SpeciesResults";
import TEKAnnotationModal from "@/components/TEKAnnotationModal";
import SeasonalDashboard from "@/components/SeasonalDashboard";
import ExportPanel from "@/components/ExportPanel";

const MOCK_DETECTIONS: Detection[] = [
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
  const [tekModal, setTekModal] = useState<{ open: boolean; detectionId: string }>({
    open: false,
    detectionId: "",
  });
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = useCallback((_file: File) => {
    setIsAnalyzing(true);
    // Simulate BirdNET analysis
    setTimeout(() => {
      setDetections(MOCK_DETECTIONS);
      setIsAnalyzing(false);
    }, 2500);
  }, []);

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
      <div ref={uploadRef}>
        <AudioUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      </div>
      <SpeciesResults detections={detections} onAnnotate={handleAnnotate} />
      <SeasonalDashboard detections={detections} />
      <ExportPanel detections={detections} />

      <TEKAnnotationModal
        isOpen={tekModal.open}
        speciesName={activeDetection?.commonName ?? ""}
        onClose={() => setTekModal({ open: false, detectionId: "" })}
        onSave={handleSaveTEK}
      />

      {/* Footer */}
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
