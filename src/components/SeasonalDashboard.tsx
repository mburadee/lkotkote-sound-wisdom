import { motion } from "framer-motion";
import { Bird, Thermometer, CloudRain, Leaf, TrendingUp } from "lucide-react";
import type { Detection } from "./SpeciesResults";

interface Props {
  detections: Detection[];
}

const indicators = [
  {
    icon: Bird,
    label: "Species Richness",
    value: "12",
    change: "+3 this month",
    positive: true,
  },
  {
    icon: Thermometer,
    label: "Climate Signal",
    value: "Warm onset",
    change: "Based on 4 indicator species",
    positive: true,
  },
  {
    icon: CloudRain,
    label: "Rain Forecast",
    value: "Short rains likely",
    change: "Hornbill activity up 40%",
    positive: true,
  },
  {
    icon: Leaf,
    label: "Ecosystem Health",
    value: "Good",
    change: "7 of 10 TEK indicators met",
    positive: true,
  },
];

const SeasonalDashboard = ({ detections }: Props) => {
  if (detections.length === 0) return null;

  return (
    <section className="py-24">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Seasonal Indicators
          </h2>
          <p className="text-lg font-body text-muted-foreground max-w-xl mx-auto">
            AI analysis combined with TEK annotations reveals ecological patterns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((ind, i) => (
            <motion.div
              key={ind.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ind.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-body font-medium text-muted-foreground">
                  {ind.label}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">{ind.value}</p>
              <div className="flex items-center gap-1 text-sm font-body text-forest">
                <TrendingUp className="w-3.5 h-3.5" />
                {ind.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Species timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-card rounded-2xl p-8 shadow-card"
        >
          <h3 className="font-display font-semibold text-lg text-foreground mb-6">
            Detection Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6 pl-10">
              {detections.slice(0, 5).map((d, i) => (
                <div key={d.id} className="relative">
                  <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
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
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SeasonalDashboard;
