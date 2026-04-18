import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationMapProps {
  latitude: string;
  longitude: string;
  onPick: (lat: string, lon: string) => void;
}

const FlyTo = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      map.flyTo([lat, lon], Math.max(map.getZoom(), 10), { duration: 0.8 });
    }
  }, [lat, lon, map]);
  return null;
};

const ClickHandler = ({ onPick }: { onPick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationMap = ({ latitude, longitude, onPick }: LocationMapProps) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const valid = Number.isFinite(lat) && Number.isFinite(lon);
  const center: [number, number] = valid ? [lat, lon] : [0.5697, 37.5342];

  const handleClick = (la: number, lo: number) => {
    onPick(la.toFixed(6), lo.toFixed(6));
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border h-[320px] relative z-0">
      <MapContainer center={center} zoom={valid ? 10 : 5} scrollWheelZoom className="h-full w-full">
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Esri Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <ClickHandler onPick={handleClick} />
        {valid && <Marker position={[lat, lon]} />}
        {valid && <FlyTo lat={lat} lon={lon} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] bg-card/90 backdrop-blur px-2 py-1 rounded-md text-xs font-body text-muted-foreground shadow-card">
        Click the map to pick a location
      </div>
    </div>
  );
};

export default LocationMap;
