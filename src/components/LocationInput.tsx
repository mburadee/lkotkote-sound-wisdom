import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Check, Mountain, Loader2 } from "lucide-react";
import LocationMap from "./LocationMap";

interface LocationInputProps {
  latitude: string;
  longitude: string;
  altitude: string;
  onLocationChange: (lat: string, lon: string) => void;
  onAltitudeChange: (alt: string) => void;
}

const LocationInput = ({
  latitude,
  longitude,
  altitude,
  onLocationChange,
  onAltitudeChange,
}: LocationInputProps) => {
  const [useGPS, setUseGPS] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [altLoading, setAltLoading] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
        setUseGPS(true);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true }
    );
  };

  // Auto-fetch altitude from Open-Meteo whenever lat/lon become valid
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    let cancelled = false;
    const fetchAlt = async () => {
      setAltLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
        );
        if (!res.ok) throw new Error("elevation fetch failed");
        const data = await res.json();
        const elev = Array.isArray(data?.elevation) ? data.elevation[0] : null;
        if (!cancelled && typeof elev === "number") {
          onAltitudeChange(elev.toFixed(1));
        }
      } catch {
        // silent — user can still type manually
      } finally {
        if (!cancelled) setAltLoading(false);
      }
    };
    fetchAlt();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card space-y-5"
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Recording Location</h3>
      </div>

      <LocationMap latitude={latitude} longitude={longitude} onPick={onLocationChange} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div>
          <label className="text-xs font-body font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Mountain className="w-3 h-3" /> Altitude (m)
            {altLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </label>
          <input
            type="text"
            value={altitude}
            onChange={(e) => onAltitudeChange(e.target.value)}
            placeholder="auto"
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
            <Check className="w-4 h-4 text-secondary" /> Location set
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
