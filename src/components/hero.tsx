"use client";

import { motion } from "motion/react";
import { formatWeddingDate, formatWeddingTime } from "@/lib/format";
import { PrintPhoto } from "./print-photo";
import { Countdown } from "./countdown";

type HeroProps = {
  partnerOneName: string;
  partnerTwoName: string;
  startsAt: string;
  timeZone: string;
  venueName: string;
  welcomeMessage?: string | null;
  coverPhoto: { src: string; alt: string };
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Tamanho dos nomes ajustado ao comprimento, para "Maria" e "Alexandra" caberem sem partir. */
function nameSize(name: string) {
  const em = Math.max(name.length, 4) * 0.62;
  return `min(8.5rem, calc((min(100vw, 38rem) - 2.5rem) / ${em.toFixed(2)}))`;
}

/**
 * Abertura: os nomes, o fio que se enlaça entre eles e a foto do casal.
 * O fio termina na margem esquerda e continua pela página.
 */
export function Hero({
  partnerOneName,
  partnerTwoName,
  startsAt,
  timeZone,
  venueName,
  welcomeMessage,
  coverPhoto,
}: HeroProps) {
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, ease, delay },
  });
  return (
    <header className="pt-14 sm:pt-20">
      <h1 className="font-display leading-[0.95]">
        <motion.span
          className="block"
          style={{ fontSize: nameSize(partnerOneName) }}
          {...enter(0)}
        >
          {partnerOneName}
        </motion.span>
        <span className="sr-only"> e </span>
        <Knot />
        <motion.span
          className="block border-l-[1.5px] border-vinho text-right"
          style={{ fontSize: nameSize(partnerTwoName) }}
          {...enter(0.5)}
        >
          {partnerTwoName}
        </motion.span>
      </h1>

      <div className="border-l-[1.5px] border-vinho pt-10 pb-4 pl-7">
        <PrintPhoto
          src={coverPhoto.src}
          alt={coverPhoto.alt}
          tilt={-2}
          caption={`${partnerOneName} & ${partnerTwoName}`}
          trigger="load"
          priority
          className="-mr-1 sm:-mr-6"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 1.5 }}
        >
          <p className="mt-12 text-lg leading-snug font-medium">
            {formatWeddingDate(startsAt, timeZone)},{" "}
            <span className="whitespace-nowrap">às {formatWeddingTime(startsAt, timeZone)}</span>
          </p>
          <p className="mt-1 text-pedra">{venueName}</p>
          <Countdown startsAt={startsAt} />
          {welcomeMessage && <p className="mt-8 max-w-[52ch] text-pretty">{welcomeMessage}</p>}
        </motion.div>
      </div>
    </header>
  );
}

/** O laço. Entra pela direita, dá uma volta sobre si e desce pela margem esquerda. */
function Knot() {
  return (
    <svg
      viewBox="0 0 340 96"
      className="-my-2 block h-auto w-full overflow-visible text-vinho sm:-my-4"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="fio-desenhar"
        d="M340 38 H214 C192 38 184 14 163 14 C143 14 133 30 133 46 C133 64 151 74 168 66 C186 57 182 38 158 38 H26 C10 38 0.75 48 0.75 62 V96"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
