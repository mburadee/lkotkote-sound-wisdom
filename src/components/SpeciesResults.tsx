import { motion } from "framer-motion";
import { Bird, Clock, MapPin, Percent } from "lucide-react";
import hornbillImg from "@/assets/hornbill.jpg";

export interface Detection {
  id: string;
  species: string;
  commonName: string;
  confidence: number;
  startTime: number;
  endTime: number;
  location?: string;
  tekAnnotation?: string;
}

interface Props {
  detections: Detection[];
  onAnnotate: (id: string) => void;
}

const SpeciesResults = ({ detections, onAnnotate }: Props) => {
  if (detections.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-earth">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Species Detected
          </h2>
          <p className="text-lg font-body text-muted-foreground">
            {detections.length} species identified in your recording.
          </p>
        </motion.div>

        <div className="space-y-4">
          {detections.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <img
                src={hornbillImg}
                alt={d.commonName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                loading="lazy"
                width={64}
                height={64}
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {d.commonName}
                </h3>
                <p className="text-sm font-body text-muted-foreground italic">{d.species}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm font-body text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    {(d.confidence * 100).toFixed(0)}% confidence
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {d.startTime.toFixed(1)}s – {d.endTime.toFixed(1)}s
                  </span>
                  {d.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {d.location}
                    </span>
                  )}
                </div>
                {d.tekAnnotation && (
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-forest/10 text-sm font-body text-forest">
                    <span className="font-semibold">TEK:</span> {d.tekAnnotation}
                  </div>
                )}
              </div>

              {!d.tekAnnotation && (
                <button
                  onClick={() => onAnnotate(d.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg border border-forest/30 text-forest font-body text-sm font-medium hover:bg-forest/5 transition-colors"
                >
                  + Add TEK
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeciesResults;
