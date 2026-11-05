"use client";

import dynamic from "next/dynamic";

const VenueMap = dynamic(() => import("./venue-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-esmalte" />,
});

type VenueProps = {
  venueName: string;
  venueAddress: string;
  latitude: number | null;
  longitude: number | null;
};

export function Venue({ venueName, venueAddress, latitude, longitude }: VenueProps) {
  const hasPin = latitude !== null && longitude !== null;
  const destination = hasPin ? `${latitude},${longitude}` : encodeURIComponent(venueAddress);

  const directions = [
    { label: "Google Maps", href: `https://www.google.com/maps/dir/?api=1&destination=${destination}` },
    {
      label: "Waze",
      href: hasPin
        ? `https://waze.com/ul?ll=${destination}&navigate=yes`
        : `https://waze.com/ul?q=${destination}&navigate=yes`,
    },
    { label: "Apple Maps", href: `https://maps.apple.com/?daddr=${destination}` },
  ];

  return (
    <div>
      <p className="text-lg">{venueName}</p>
      <address className="mt-1 not-italic text-pedra">{venueAddress}</address>

      {hasPin && (
        <div className="mapa-porcelana mt-6 h-64 overflow-hidden rounded-lg border border-nevoa sm:h-80">
          <VenueMap latitude={latitude} longitude={longitude} label={venueName} />
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
              className="inline-flex rounded-full border border-nevoa px-4 py-2 text-sm font-medium transition-colors hover:border-cobalto hover:text-cobalto"
            >
              {d.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
