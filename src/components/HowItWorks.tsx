import { motion } from "framer-motion";
import { Upload, Bird, BookOpen, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Audio",
    description: "Record or upload bird sounds from your community's environment.",
  },
  {
    icon: Bird,
    title: "AI Detection",
    description: "BirdNET-Analyzer identifies species from your recordings automatically.",
  },
  {
    icon: BookOpen,
    title: "Add TEK",
    description: "Annotate detections with Traditional Ecological Knowledge from your community.",
  },
  {
    icon: BarChart3,
    title: "Get Insights",
    description: "View seasonal indicators and export data in Darwin Core format for GBIF.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-earth">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg font-body text-muted-foreground max-w-xl mx-auto">
            Four simple steps from field recording to ecological insight.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-card rounded-2xl p-8 shadow-card text-center group hover:shadow-warm transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-forest mb-6">
                <step.icon className="w-6 h-6 text-sand-light" />
              </div>
              <div className="absolute top-4 right-4 text-5xl font-display font-bold text-muted/60">
                {i + 1}
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
