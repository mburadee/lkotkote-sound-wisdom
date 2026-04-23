import { motion } from "framer-motion";
import { Bird, Mic, ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-savanna.jpg";

const HeroSection = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="African savanna at golden hour"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-8">
            <Bird className="w-4 h-4 text-savanna-gold" />
            <span className="text-sm font-body text-sand-light tracking-wide">
              Bioacoustic Intelligence Platform
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-sand-light mb-6 leading-tight"
        >
          Lkotkote
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl font-body text-sand/90 max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Transform bird sound recordings into climate and ecological insights
          by blending AI-powered bioacoustics with Traditional Ecological Knowledge.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-savanna-gold/15 border border-savanna-gold/40 text-sm md:text-base font-body font-medium text-savanna-gold backdrop-blur-sm shadow-warm">
            Named after the Samburu word for the Eastern Yellow-billed Hornbill
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-forest font-body font-semibold text-sand-light hover:opacity-90 transition-opacity shadow-warm text-lg"
          >
            <Mic className="w-5 h-5" />
            Upload Recording
          </button>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-sand/30 font-body font-medium text-sand-light/80 hover:bg-sand/10 transition-colors"
          >
            Learn More
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ArrowDown className="w-6 h-6 text-sand/50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
