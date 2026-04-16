import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";

interface LocationInputProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lon: string) => void;
}

const LocationInput = ({ latitude, longitude, onLocationChange }: LocationInputProps) => {
  const [useGPS, setUseGPS] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(
          pos.coords.latitude.toFixed(6),
          pos.coords.longitude.toFixed(6)
        );
        setUseGPS(true);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Recording Location</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
            Latitude
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => onLocationChange(e.target.value, longitude)}
            placeholder="e.g. 0.5697"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">
            Longitude
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => onLocationChange(latitude, e.target.value)}
            placeholder="e.g. 37.5342"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <button
        onClick={handleGPS}
        disabled={gpsLoading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-body text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        {useGPS ? (
          <>
            <Check className="w-4 h-4 text-forest" /> Location set
          </>
        ) : gpsLoading ? (
          "Getting location…"
        ) : (
          <>
            <MapPin className="w-4 h-4" /> Use my current location
          </>
        )}
      </button>
    </motion.div>
  );
};

export default LocationInput;
