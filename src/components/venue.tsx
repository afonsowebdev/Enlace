"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Fragment, useState } from "react";
import { formatWeddingDate, formatWeddingTime } from "@/lib/format";
import type { Place } from "@/lib/types";
import { Bloom, Sprig } from "./backdrop";
import { ArchFrame } from "./arch-frame";

const VenueMap = dynamic(() => import("./venue-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-linho" />,
});

const ease = [0.22, 1, 0.36, 1] as const;
const eyebrow = "text-[0.7rem] font-medium tracking-[0.32em] text-dourado uppercase";

type VenueProps = { places: Place[]; timeZone: string; coupleNames: string };

/**
 * Onde e quando: cada local (cerimónia, receção) dentro de um arco dourado que se
 * desenha, como na entrada, com o mapa numa janela em arco, a hora em destaque e
 * o caminho. Entre os dois, um ornamento; por baixo, guardar o dia na agenda.
 */
export function Venue({ places, timeZone, coupleNames }: VenueProps) {
  const two = places.length > 1;
  return (
    <div>
      <DateLine startsAt={places[0].startsAt} timeZone={timeZone} />

      <ol className={`mt-14 grid ${two ? "lg:grid-cols-[1fr_auto_1fr] lg:gap-6" : ""}`}>
        {places.map((p, i) => (
          <Fragment key={p.label}>
            {i > 0 && <Interlude />}
            <motion.li
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1, ease, delay: i * 0.2 }}
            >
              <PlaceArch place={p} timeZone={timeZone} step={two ? i + 1 : null} delay={i * 0.4} />
            </motion.li>
          </Fragment>
        ))}
      </ol>

      <SaveTheDate places={places} coupleNames={coupleNames} />
    </div>
  );
}

/** Entre a cerimónia e a receção: uma linha dourada com uma rosa, de pé no telemóvel. */
function Interlude() {
  return (
    <li aria-hidden="true" className="flex flex-col items-center justify-center py-6 lg:py-0">
      <span className="h-12 w-px bg-gradient-to-b from-transparent to-dourado/60 lg:h-40" />
      <Bloom className="my-3 w-10" delay={0.8} rotate={15} />
      <span className="h-12 w-px bg-gradient-to-t from-transparent to-dourado/60 lg:h-40" />
    </li>
  );
}

/** "Sexta-feira" por cima, "25 de dezembro de 2026" por baixo: nunca parte a meio. */
function DateLine({ startsAt, timeZone }: { startsAt: string; timeZone: string }) {
  const [weekday, ...rest] = formatWeddingDate(startsAt, timeZone).split(", ");
  return (
    <div className="text-center">
      <p className={eyebrow}>{weekday}</p>
      <p className="mt-2 font-display text-[clamp(1.25rem,5vw,1.9rem)] leading-tight text-vinho">{rest.join(", ")}</p>
    </div>
  );
}

function directionsFor(place: Place) {
  const hasPin = place.latitude !== null && place.longitude !== null;
  const destination = hasPin ? `${place.latitude},${place.longitude}` : encodeURIComponent(`${place.name}, ${place.address}`);
  return [
    { label: "Google Maps", href: `https://www.google.com/maps/dir/?api=1&destination=${destination}` },
    {
      label: "Waze",
      href: hasPin ? `https://waze.com/ul?ll=${destination}&navigate=yes` : `https://waze.com/ul?q=${destination}&navigate=yes`,
    },
    { label: "Apple Maps", href: `https://maps.apple.com/?daddr=${destination}` },
  ];
}

/** Um local dentro do arco: janela do mapa, hora, nome, morada e caminho. */
function PlaceArch({ place, timeZone, step, delay }: { place: Place; timeZone: string; step: number | null; delay: number }) {
  const [copied, setCopied] = useState(false);
  const hasPin = place.latitude !== null && place.longitude !== null;
  const sameText = place.address.trim().toLowerCase() === place.name.trim().toLowerCase();
  const fullAddress = sameText ? place.name : `${place.name}, ${place.address}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // sem acesso à área de transferência: não faz nada
    }
  }

  return (
    // pt-[8%]: a janela do mapa fica concêntrica com o arco (o padding em % segue a largura)
    <div className="relative mx-auto w-full max-w-[27rem] pt-[8%] pb-16 text-center">
      <ArchFrame delay={delay} />

      {/* janela do mapa, em arco, com rosas na base */}
      <div className="relative mx-auto w-[84%]">
        <div className="relative aspect-[6/5] overflow-hidden rounded-t-full rounded-b-md border border-dourado/40 bg-linho shadow-[0_30px_60px_-34px_rgba(60,20,25,0.5)]">
          {hasPin ? (
            <div className="mapa-papel absolute inset-0">
              <VenueMap latitude={place.latitude!} longitude={place.longitude!} label={place.name} />
            </div>
          ) : (
            <MapPlaceholder />
          )}
        </div>
        <Bloom className="absolute -bottom-6 -left-7 w-16" delay={delay + 1.4} rotate={-15} />
        <Bloom className="absolute -bottom-3 left-7 w-8" delay={delay + 1.7} rotate={30} bud />
      </div>

      <div className="relative px-8 pt-10 sm:px-12">
        <p className={eyebrow}>
          {step !== null && <span className="mr-2 text-dourado/70">{String(step).padStart(2, "0")}</span>}
          {place.label}
        </p>
        <p className="mt-3 font-display text-[clamp(3rem,13vw,4rem)] leading-none text-vinho tabular-nums">
          {formatWeddingTime(place.startsAt, timeZone)}
        </p>

        <div aria-hidden="true" className="mx-auto mt-5 flex items-center justify-center gap-3 text-dourado">
          <span className="h-px w-10 bg-dourado/60" />
          <svg viewBox="0 0 12 12" className="size-2.5" fill="currentColor">
            <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" />
          </svg>
          <span className="h-px w-10 bg-dourado/60" />
        </div>

        <p className="mt-5 text-[1.1rem] leading-snug font-medium text-balance">{place.name}</p>
        {!sameText && <address className="mt-1.5 text-pedra not-italic">{place.address}</address>}

        <button type="button" onClick={copy} className="mx-auto mt-3 inline-flex items-center gap-1.5 text-sm text-pedra transition-colors hover:text-vinho">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            {copied ? <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /> : <><rect x="5" y="5" width="8.5" height="8.5" rx="1.5" /><path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5H5" /></>}
          </svg>
          <span aria-live="polite">{copied ? "Morada copiada" : "Copiar morada"}</span>
        </button>

        <p className={`mt-8 ${eyebrow}`}>Como chegar</p>
        <ul className="mt-2 flex items-center justify-center">
          {directionsFor(place).map((d, i) => (
            <li key={d.label} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="text-dourado">·</span>}
              <a
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 text-sm font-medium text-vinho underline decoration-dourado/50 decoration-1 underline-offset-[6px] transition-colors hover:decoration-vinho"
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

/** Sem ponto no mapa: um pino dourado com rosas, em vez de um espaço vazio. */
function MapPlaceholder() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div aria-hidden="true" className="absolute -bottom-6 -left-6 w-36 text-vinho opacity-25">
        <Sprig variant={0} blossomColor="var(--dourado)" />
      </div>
      <div aria-hidden="true" className="absolute -top-4 -right-6 w-32 rotate-180 text-vinho opacity-20">
        <Sprig variant={1} blossomColor="var(--dourado)" />
      </div>
      <div className="relative flex flex-col items-center">
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 40 52"
          className="h-14 w-11 text-vinho"
          initial={{ y: -14, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
        >
          <path d="M20 51S4 31.5 4 19a16 16 0 0 1 32 0c0 12.5-16 32-16 32z" fill="currentColor" />
          <circle cx="20" cy="19" r="6" fill="var(--convite-luz)" />
        </motion.svg>
        <span aria-hidden="true" className="mt-1 h-1.5 w-8 rounded-full bg-vinho/15" />
        <Bloom className="absolute -right-10 -bottom-2 w-9" delay={0.6} rotate={20} bud />
      </div>
    </div>
  );
}

/** Formato de data das agendas: 20261225T160000Z */
function calendarStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Guardar o dia na agenda: Google Calendar ou ficheiro .ics (Apple, Outlook). */
function SaveTheDate({ places, coupleNames }: { places: Place[]; coupleNames: string }) {
  const start = new Date(places[0].startsAt);
  const last = new Date(places[places.length - 1].startsAt);
  const end = new Date(last.getTime() + 5 * 60 * 60 * 1000);
  const title = `Casamento de ${coupleNames}`;
  const location = `${places[0].name}, ${places[0].address}`;
  const details = places.map((p) => `${p.label}: ${p.name}, ${p.address}`).join("\n");

  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${calendarStamp(start)}/${calendarStamp(end)}` +
    `&location=${encodeURIComponent(location)}` +
    `&details=${encodeURIComponent(details)}`;

  function downloadIcs() {
    const escape = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Enlace//Convite//PT",
      "BEGIN:VEVENT",
      `UID:${calendarStamp(start)}-casamento@enlace`,
      `DTSTAMP:${calendarStamp(new Date())}`,
      `DTSTART:${calendarStamp(start)}`,
      `DTEND:${calendarStamp(end)}`,
      `SUMMARY:${escape(title)}`,
      `LOCATION:${escape(location)}`,
      `DESCRIPTION:${escape(details)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "casamento.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const button =
    "inline-flex items-center justify-center gap-2 rounded-full border border-dourado/60 px-6 py-3 text-sm font-medium transition-colors hover:border-vinho hover:bg-cartao hover:text-sobre-cartao";

  return (
    <div className="mt-14 text-center">
      <p className={eyebrow}>Guardar na agenda</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a href={google} target="_blank" rel="noopener noreferrer" className={button}>
          <CalendarIcon /> Google Calendar
        </a>
        <button type="button" onClick={downloadIcs} className={button}>
          <CalendarIcon /> Apple ou Outlook
        </button>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
    </svg>
  );
}
