import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";

interface Props {
  isOpen: boolean;
  speciesName: string;
  onClose: () => void;
  onSave: (annotation: string, season: string, localName: string) => void;
}

const seasons = [
  "Winter",
  "Spring",
  "Summer",
  "Autumn",
  "Dry Season",
  "Short Rains",
  "Long Rains",
  "Cool Dry",
  "Migration",
];

const TEKAnnotationModal = ({ isOpen, speciesName, onClose, onSave }: Props) => {
  const [annotation, setAnnotation] = useState("");
  const [season, setSeason] = useState("");

  const handleSave = () => {
    if (annotation.trim()) {
      onSave(annotation.trim(), season);
      setAnnotation("");
      setSeason("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tek-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background rounded-2xl shadow-warm max-w-lg w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-forest flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-sand-light" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    Add Traditional Knowledge
                  </h3>
                  <p className="text-sm font-body text-muted-foreground">{speciesName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Associated Season
                </label>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-body transition-colors ${
                        season === s
                          ? "bg-forest text-sand-light"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Traditional Ecological Knowledge
                </label>
                <textarea
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  placeholder="What does hearing this bird tell your community about the season, weather, or environment?"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-border font-body text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!annotation.trim()}
                  className="px-5 py-2.5 rounded-lg bg-gradient-forest font-body text-sm font-semibold text-sand-light hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Save Annotation
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TEKAnnotationModal;
