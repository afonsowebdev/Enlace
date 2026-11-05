"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

// Pino desenhado em CSS: um nó cobalto, como os do fio.
const pin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:var(--cobalto);border:3px solid var(--porcelana);box-shadow:0 0 0 1.5px var(--cobalto)"></span>',
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
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pin} title={label} alt={label} />
    </MapContainer>
  );
}
