"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { formatWeddingTime } from "@/lib/format";
import { Bloom } from "./backdrop";
import { Countdown } from "./countdown";

type HeroProps = {
  partnerOneName: string;
  partnerTwoName: string;
  startsAt: string;
  timeZone: string;
  venueName: string;
  coverPhoto: { src: string; alt: string } | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Tamanho dos nomes ajustado ao comprimento, para "Ana" e "Alexandra" caberem numa linha.
 * A Lamoric Rowen é larga (maiúsculas com ~0,9 em por letra).
 */
function nameSize(name: string) {
  const em = Math.max(name.length, 4) * 0.92;
  return `min(6rem, calc(min(100vw - 5rem, 28rem) / ${em.toFixed(2)}))`;
}

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-PT", { ...o, timeZone }).format(d);
  return {
    day: part({ day: "2-digit" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
    weekday: part({ weekday: "long" }),
  };
}

/**
 * Abertura em ecrã inteiro e curta: a foto num arco dourado, os nomes que
 * aparecem letra a letra com o "&" a brilhar, a data e o local.
 */
export function Hero({ partnerOneName, partnerTwoName, startsAt, timeZone, venueName, coverPhoto }: HeroProps) {
  const date = dateParts(startsAt, timeZone);
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease, delay },
  });

  return (
    <header className="relative flex min-h-[100svh] items-center">
      <div
        className={`mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-16 pb-24 sm:px-8 ${
          coverPhoto ? "lg:grid-cols-[0.9fr_1.1fr] lg:gap-20" : ""
        }`}
      >
        {coverPhoto && <ArchPhoto src={coverPhoto.src} alt={coverPhoto.alt} />}

        <div className="relative mx-auto w-full max-w-[34rem] min-w-0 px-4 py-10 text-center sm:px-10 sm:py-14">
          {!coverPhoto && <ArchOutline />}

          <motion.p className="text-xs font-medium tracking-[0.42em] text-dourado uppercase" {...fade(0.1)}>
            Vamos casar
          </motion.p>

          <h1 className="mt-6 font-display leading-[0.95]">
            <span className="sr-only">
              {partnerOneName} e {partnerTwoName}
            </span>
            <Letters text={partnerOneName} delay={0.35} size={nameSize(partnerOneName)} />
            <motion.span
              aria-hidden="true"
              className="brilho my-2 block text-[clamp(2.8rem,9vw,4.5rem)] leading-none"
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease, delay: 0.9 }}
            >
              &amp;
            </motion.span>
            <Letters text={partnerTwoName} delay={1.1} size={nameSize(partnerTwoName)} />
          </h1>

          <motion.div {...fade(1.8)}>
            <div className="mt-9 flex items-center justify-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-dourado/70 sm:w-16" />
              <p className="text-xs font-medium tracking-[0.32em] text-pedra uppercase">{date.weekday}</p>
              <span aria-hidden="true" className="h-px w-10 bg-dourado/70 sm:w-16" />
            </div>
            <p className="mt-3 font-display text-[clamp(1.3rem,5.4vw,1.75rem)] leading-tight">
              {date.day}
              <span className="mx-2.5 text-dourado">·</span>
              {date.month}
              <span className="mx-2.5 text-dourado">·</span>
              {date.year}
            </p>
            <p className="mt-2 text-pedra">
              {formatWeddingTime(startsAt, timeZone)}
              <span className="mx-2 text-dourado">|</span>
              {venueName}
            </p>
            <div className="text-sm">
              <Countdown startsAt={startsAt} />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#convite"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium tracking-[0.3em] text-pedra uppercase"
        {...fade(2.4)}
      >
        Abrir o convite
        <motion.span
          aria-hidden="true"
          className="block h-8 w-px origin-top bg-dourado"
          animate={{ scaleY: [0, 1, 0], y: [0, 0, 12] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.a>
    </header>
  );
}

/** Cada letra sobe e ganha nitidez, uma a seguir à outra. */
function Letters({ text, delay, size }: { text: string; delay: number; size: string }) {
  return (
    <span aria-hidden="true" className="block whitespace-nowrap" style={{ fontSize: size }}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: "0.35em", filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease, delay: delay + i * 0.06 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

/** A foto do casal num arco, com um filete dourado à volta e rosas a desabrochar. */
function ArchPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      className="relative mx-auto w-[min(54vw,17rem)] sm:w-[19rem] lg:w-full lg:max-w-[25rem]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease, delay: 0.2 }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute -inset-2.5 rounded-t-full rounded-b-lg border border-dourado/70 sm:-inset-3.5"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease, delay: 0.9 }}
      />
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-md bg-linho shadow-[0_30px_60px_-30px_rgba(60,20,25,0.55)]">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3.2, ease, delay: 0.2 }}
        >
          <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 25rem, 60vw" className="object-cover" />
        </motion.div>
      </div>
      <Bloom className="absolute -bottom-7 -left-8 w-20 sm:w-24" delay={1.6} rotate={-15} />
      <Bloom className="absolute -bottom-3 left-8 w-10 sm:w-12" delay={1.9} rotate={30} bud />
      <Bloom className="absolute top-[18%] -right-6 w-12 sm:w-14" delay={2.1} rotate={50} bud />
    </motion.div>
  );
}

/** Sem foto: um arco dourado desenha-se à volta dos nomes. */
function ArchOutline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 400"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-dourado"
    >
      {[0, 8].map((inset, i) => (
        <motion.path
          key={inset}
          d={`M${2 + inset} 398 V${150} A${148 - inset} ${148 - inset} 0 0 1 ${298 - inset} 150 V398`}
          fill="none"
          stroke="currentColor"
          strokeOpacity={i === 0 ? 0.75 : 0.35}
          strokeWidth={0.8}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 + i * 0.3 }}
        />
      ))}
    </svg>
  );
}
