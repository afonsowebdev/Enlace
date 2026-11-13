"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, ZoomControl } from "react-leaflet";

// Pino desenhado em CSS: um nó vinho, como os do fio.
const pin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:var(--vinho);border:3px solid var(--papel);box-shadow:0 0 0 1.5px var(--vinho)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type VenueMapProps = { latitude: number; longitude: number; label: string };

export default function VenueMap({ latitude, longitude, label }: VenueMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <Marker position={[latitude, longitude]} icon={pin} title={label} alt={label} />
    </MapContainer>
  );
}
