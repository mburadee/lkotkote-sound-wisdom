import { motion } from "framer-motion";
import { Download, Globe, FileSpreadsheet, FileText, Lock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { Detection } from "./SpeciesResults";
import { exportDarwinCore, exportCSV, exportJSON } from "@/lib/darwin-core-export";

interface Props {
  detections: Detection[];
  latitude?: string;
  longitude?: string;
  onAddTEK?: (detectionId: string) => void;
}

const ExportPanel = ({ detections, latitude, longitude, onAddTEK }: Props) => {
  if (detections.length === 0) return null;

  const annotatedCount = detections.filter((d) => d.tekAnnotation && d.tekAnnotation.trim()).length;
  const tekReady = annotatedCount > 0;
  const firstUnannotated = detections.find((d) => !d.tekAnnotation || !d.tekAnnotation.trim());

  const exportOptions = {
    detections,
    latitude,
    longitude,
    recordedDate: new Date().toISOString().split("T")[0],
  };

  const formats = [
    {
      icon: Globe,
      title: "Darwin Core Archive",
      desc: "Standard format for GBIF publishing",
      ext: "DwC-A",
      requiresTEK: true,
      action: async () => {
        if (!tekReady) {
          toast.error("Please add Traditional Ecological Knowledge to at least one detection before publishing to GBIF.");
          if (firstUnannotated) onAddTEK?.(firstUnannotated.id);
          return;
        }
        await exportDarwinCore(exportOptions);
        toast.success("Darwin Core Archive exported!");
      },
    },
    {
      icon: FileSpreadsheet,
      title: "CSV Spreadsheet",
      desc: "For analysis in Excel or R",
      ext: "CSV",
      requiresTEK: false,
      action: () => {
        exportCSV(exportOptions);
        toast.success("CSV exported!");
      },
    },
    {
      icon: FileText,
      title: "JSON Report",
      desc: "Machine-readable with full metadata",
      ext: "JSON",
      requiresTEK: false,
      action: () => {
        exportJSON(exportOptions);
        toast.success("JSON exported!");
      },
    },
  ];

  return (
    <section className="py-24 bg-gradient-earth">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Export Your Data
          </h2>
          <p className="text-lg font-body text-muted-foreground">
            Publish findings to GBIF or download for your own analysis.
          </p>
        </motion.div>

        {/* TEK readiness banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mb-8 rounded-2xl p-5 border ${
            tekReady
              ? "bg-forest/10 border-forest/30"
              : "bg-accent/10 border-accent/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tekReady ? "bg-forest" : "bg-accent"
              }`}
            >
              <BookOpen className="w-4 h-4 text-sand-light" />
            </div>
            <div className="flex-1">
              <p className="font-body font-semibold text-foreground text-sm">
                {tekReady
                  ? `${annotatedCount} of ${detections.length} detections enriched with Traditional Ecological Knowledge`
                  : "TEK labeling required before GBIF publication"}
              </p>
              <p className="text-xs font-body text-muted-foreground mt-1">
                {tekReady
                  ? "Your Darwin Core Archive will preserve indigenous knowledge alongside species data."
                  : "Add TEK to at least one detection above so your GBIF dataset reflects local ecological wisdom."}
              </p>
              {!tekReady && firstUnannotated && (
                <button
                  onClick={() => onAddTEK?.(firstUnannotated.id)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-sand-light text-xs font-body font-semibold hover:opacity-90 transition-opacity"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Add TEK to {firstUnannotated.commonName}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formats.map((f, i) => {
            const isLocked = f.requiresTEK && !tekReady;
            return (
              <motion.button
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={f.action}
                className={`bg-card rounded-2xl p-6 shadow-card text-left transition-shadow group relative ${
                  isLocked ? "opacity-70 hover:shadow-card cursor-pointer" : "hover:shadow-warm"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-sand-light" />
                  </div>
                  <span className="text-xs font-body font-bold text-primary/60 bg-primary/10 px-2 py-1 rounded-md">
                    {f.ext}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
                  {f.title}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </h3>
                <p className="text-sm font-body text-muted-foreground mb-4">{f.desc}</p>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-body font-medium group-hover:gap-2 transition-all ${
                    isLocked ? "text-muted-foreground" : "text-forest"
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-4 h-4" /> Add TEK to unlock
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Export
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExportPanel;
