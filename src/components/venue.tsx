"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { formatWeddingTime } from "@/lib/format";

const VenueMap = dynamic(() => import("./venue-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-linho" />,
});

export type Place = {
  label: string;
  name: string;
  address: string;
  startsAt: string;
  latitude: number | null;
  longitude: number | null;
};

/** Os locais do casamento (cerimónia e receção), com mapa e caminho em cada um. */
export function Venue({ places, timeZone }: { places: Place[]; timeZone: string }) {
  const [index, setIndex] = useState(0);
  const place = places[index];
  const hasPin = place.latitude !== null && place.longitude !== null;
  const destination = hasPin ? `${place.latitude},${place.longitude}` : encodeURIComponent(place.address);

  const directions = [
    { label: "Google Maps", href: `https://www.google.com/maps/dir/?api=1&destination=${destination}` },
    {
      label: "Waze",
      href: hasPin ? `https://waze.com/ul?ll=${destination}&navigate=yes` : `https://waze.com/ul?q=${destination}&navigate=yes`,
    },
    { label: "Apple Maps", href: `https://maps.apple.com/?daddr=${destination}` },
  ];

  return (
    <div>
      {places.length > 1 && (
        <div role="tablist" aria-label="Locais" className="mb-6 inline-flex rounded-full border border-nevoa bg-papel p-1">
          {places.map((p, i) => (
            <button
              key={p.label}
              role="tab"
              type="button"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                i === index ? "bg-cartao text-sobre-cartao" : "bg-transparent text-pedra hover:text-tinta"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div role="tabpanel">
        <p className="text-lg font-medium">{place.name}</p>
        <address className="mt-1 not-italic text-pedra">{place.address}</address>
        <p className="mt-1 text-sm text-pedra">às {formatWeddingTime(place.startsAt, timeZone)}</p>

        {hasPin && (
          <div className="mapa-papel mt-6 h-64 overflow-hidden rounded-lg border border-nevoa sm:h-80">
            <VenueMap key={place.label} latitude={place.latitude!} longitude={place.longitude!} label={place.name} />
          </div>
        )}

        <p className="mt-6 text-sm text-pedra">Abrir o caminho em</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {directions.map((d) => (
            <li key={d.label}>
              <a
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-nevoa bg-papel px-4 py-2 text-sm font-medium transition-colors hover:border-vinho hover:text-vinho"
              >
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
