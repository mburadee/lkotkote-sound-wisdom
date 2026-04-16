import { motion } from "framer-motion";
import type { Detection } from "./SpeciesResults";

interface Props {
  detections: Detection[];
}

const DetectionTimeline = ({ detections }: Props) => {
  if (detections.length === 0) return null;

  return (
    <section className="py-24">
      <div className="container max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Detection Timeline
          </h2>
          <p className="text-lg font-body text-muted-foreground">
            Chronological view of species detected in your recording.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-8 shadow-card"
        >
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6 pl-10">
              {detections.map((d) => (
                <div key={d.id} className="relative">
                  <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="flex items-start gap-3">
                    {d.thumbnailUrl && (
                      <img
                        src={d.thumbnailUrl}
                        alt={d.commonName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">
                        {d.commonName}
                      </p>
                      <p className="text-xs font-body text-muted-foreground">
                        {d.startTime.toFixed(1)}s – {d.endTime.toFixed(1)}s •{" "}
                        {(d.confidence * 100).toFixed(0)}% confidence
                      </p>
                      {d.tekAnnotation && (
                        <p className="text-xs font-body text-forest mt-1">
                          TEK: {d.tekAnnotation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DetectionTimeline;
