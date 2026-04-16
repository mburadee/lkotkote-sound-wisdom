import { motion } from "framer-motion";
import { Download, Globe, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Detection } from "./SpeciesResults";
import { exportDarwinCore, exportCSV, exportJSON } from "@/lib/darwin-core-export";

interface Props {
  detections: Detection[];
  latitude?: string;
  longitude?: string;
}

const ExportPanel = ({ detections, latitude, longitude }: Props) => {
  if (detections.length === 0) return null;

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
      action: async () => {
        await exportDarwinCore(exportOptions);
        toast.success("Darwin Core Archive exported!");
      },
    },
    {
      icon: FileSpreadsheet,
      title: "CSV Spreadsheet",
      desc: "For analysis in Excel or R",
      ext: "CSV",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formats.map((f, i) => (
            <motion.button
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={f.action}
              className="bg-card rounded-2xl p-6 shadow-card text-left hover:shadow-warm transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-sand-light" />
                </div>
                <span className="text-xs font-body font-bold text-primary/60 bg-primary/10 px-2 py-1 rounded-md">
                  {f.ext}
                </span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm font-body text-muted-foreground mb-4">{f.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-body font-medium text-forest group-hover:gap-2 transition-all">
                <Download className="w-4 h-4" /> Export
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExportPanel;
