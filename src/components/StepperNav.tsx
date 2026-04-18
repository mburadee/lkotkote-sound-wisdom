import { motion } from "framer-motion";
import { Check } from "lucide-react";

export type StepKey = "upload" | "location" | "results";

interface StepperNavProps {
  current: StepKey;
  completed: Record<StepKey, boolean>;
  onJump: (key: StepKey) => void;
}

const STEPS: { key: StepKey; label: string }[] = [
  { key: "upload", label: "Audio" },
  { key: "location", label: "Location" },
  { key: "results", label: "Results" },
];

const StepperNav = ({ current, completed, onJump }: StepperNavProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-16 z-30 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="container max-w-4xl mx-auto px-6 py-3 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, i) => {
          const isCurrent = current === step.key;
          const isDone = completed[step.key];
          return (
            <div key={step.key} className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => onJump(step.key)}
                className={`flex items-center gap-2 transition-opacity ${
                  isCurrent || isDone ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-colors ${
                    isDone
                      ? "bg-secondary text-secondary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className="hidden sm:inline text-sm font-body font-medium text-foreground">
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 sm:w-12 h-px ${isDone ? "bg-secondary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StepperNav;
