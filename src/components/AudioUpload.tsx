import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, Loader2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import AudioRecorder from "./AudioRecorder";

interface AudioUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const AudioUpload = ({ onAnalyze, isAnalyzing, file, onFileChange }: AudioUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (f.type.startsWith("audio/") || f.name.match(/\.(wav|mp3|ogg|flac|m4a)$/i)) {
        onFileChange(f);
      }
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <section id="upload" className="py-24">
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Upload a Recording
          </h2>
          <p className="text-lg font-body text-muted-foreground">
            Drop your bird audio file below to begin species detection.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AudioPlayer file={file} onRemove={() => onFileChange(null)} />
              <div className="text-center">
                <button
                  onClick={() => onAnalyze(file)}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-forest text-sand-light font-body font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-warm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" /> Analyze Recording
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground">
                    Drag & drop an audio file
                  </p>
                  <p className="text-sm font-body text-muted-foreground mt-1">
                    WAV, MP3, OGG, FLAC, or M4A • Max 50MB
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!file && (
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-3 w-full max-w-xs">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <AudioRecorder onRecorded={onFileChange} />
          </div>
        )}
      </div>
    </section>
  );
};

export default AudioUpload;
