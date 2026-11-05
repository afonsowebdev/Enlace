"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type EnvelopeIntroProps = {
  partnerOneName: string;
  partnerTwoName: string;
  dateText: string;
};

const STORAGE_KEY = "enlace-aberto";
export const OPEN_EVENT = "enlace:abrir";

type Phase = "closed" | "opening" | "gone";

function alreadyOpened() {
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {}
  return Boolean(window.location.hash);
}

/**
 * true quando o convite já está à vista: logo, se o envelope foi saltado,
 * ou perto do fim da animação de abertura. As animações da página esperam por isto.
 */
export function useInviteOpened() {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (alreadyOpened()) {
      setOpened(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const onOpen = () => {
      timer = setTimeout(() => setOpened(true), 1900);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      clearTimeout(timer);
    };
  }, []);
  return opened;
}

/**
 * Ecrã de abertura: um envelope fechado com selo de lacre.
 * Ao tocar em "Abrir convite", o selo parte, a aba abre, o convite sobe
 * e o ecrã desaparece, mostrando o site. Na mesma visita não volta a aparecer.
 */
export function EnvelopeIntro({ partnerOneName, partnerTwoName, dateText }: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  // Já abriu nesta visita, ou chegou por um link para uma secção: salta o envelope.
  useEffect(() => {
    if (alreadyOpened()) setPhase("gone");
  }, []);

  // Sem scroll por trás enquanto o envelope está fechado.
  useEffect(() => {
    if (phase === "gone") return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [phase]);

  function open() {
    if (phase !== "closed") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(OPEN_EVENT)); // a música (se houver) começa aqui
    setPhase("opening");
    setTimeout(() => setPhase("gone"), reduce ? 300 : 2600);
  }

  const initials = `${partnerOneName.charAt(0)}${partnerTwoName.charAt(0)}`;
  const opening = phase === "opening";

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Convite de casamento de ${partnerOneName} e ${partnerTwoName}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6"
          style={{ background: "radial-gradient(120% 90% at 30% 10%, #7a2430, #4a1119 55%, #2c090e)" }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          onKeyDown={(e) => e.key === "Escape" && open()}
        >
          <Petals />

          <p className="relative text-sm tracking-wide text-[#f1dcdc]/80">Estás convidado para o casamento de</p>

          {/* Envelope */}
          <div className="relative mt-[clamp(7rem,22vh,11rem)] w-[min(22rem,86vw)] [perspective:1200px]">
            <div className="relative aspect-[3/2]">
              {/* fundo do envelope */}
              <div className="absolute inset-0 rounded-md bg-[#e9dccb] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]" />

              {/* o convite lá dentro */}
              <motion.div
                className="absolute inset-x-[6%] top-[6%] bottom-[6%] z-10 flex flex-col items-center justify-center rounded-sm bg-[#fbf6ef] text-center shadow-sm"
                animate={opening ? { y: "-62%" } : { y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
              >
                <p className="font-display text-[clamp(1.6rem,7vw,2.2rem)] leading-tight text-[#6b1c26]">
                  {partnerOneName}
                  <span className="mx-2 text-[#b08a4f]">&amp;</span>
                  {partnerTwoName}
                </p>
                <p className="mt-2 text-xs tracking-wide text-[#7d5f61]">{dateText}</p>
              </motion.div>

              {/* bolso da frente: três triângulos de papel */}
              <svg viewBox="0 0 300 200" className="absolute inset-0 z-[15] h-full w-full" aria-hidden="true">
                <path d="M0 0 L150 112 L0 200 Z" fill="#efe4d6" />
                <path d="M300 0 L150 112 L300 200 Z" fill="#efe4d6" />
                <path d="M0 200 L150 96 L300 200 Z" fill="#f4ebdf" />
                <path d="M0 200 L150 96 L300 200" fill="none" stroke="#d9c7b2" strokeWidth="0.8" />
              </svg>

              {/* aba */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[62%] origin-top [transform-style:preserve-3d]"
                initial={false}
                animate={opening ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 20 }}
                transition={{ rotateX: { duration: 0.75, ease: [0.65, 0, 0.35, 1], delay: 0.35 }, zIndex: { delay: 0.72, duration: 0 } }}
              >
                <svg viewBox="0 0 300 124" className="h-full w-full drop-shadow-[0_6px_6px_rgba(60,20,25,0.18)]" aria-hidden="true">
                  <path d="M0 0 H300 L150 124 Z" fill="#e9dccb" />
                  <path d="M0 0 L150 124 L300 0" fill="none" stroke="#d6c3ad" strokeWidth="0.8" />
                </svg>
              </motion.div>

              {/* selo de lacre com as iniciais */}
              <motion.div
                className="absolute top-[62%] left-1/2 z-30 grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center"
                animate={opening ? { scale: [1, 1.12, 0], rotate: [0, -8, 20], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeIn" }}
              >
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <radialGradient id="lacre" cx="35%" cy="30%" r="75%">
                      <stop offset="0%" stopColor="#9a2f3c" />
                      <stop offset="60%" stopColor="#6b1c26" />
                      <stop offset="100%" stopColor="#3f0e15" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M50 3 C62 3 66 10 75 13 C86 17 95 26 96 38 C97 48 93 52 95 62 C97 74 88 86 76 91 C66 95 60 97 50 97 C38 97 32 92 22 88 C11 83 4 72 5 60 C6 52 3 47 4 38 C6 25 15 16 26 12 C35 9 39 3 50 3 Z"
                    fill="url(#lacre)"
                  />
                  <circle cx="50" cy="50" r="31" fill="none" stroke="#c9a46a" strokeOpacity="0.55" strokeWidth="1.2" />
                </svg>
                <span className="relative font-display text-xl text-[#e7c98f]">{initials}</span>
              </motion.div>
            </div>
          </div>

          <motion.button
            ref={buttonRef}
            type="button"
            onClick={open}
            className="relative mt-12 rounded-full bg-[#f7f0e7] px-8 py-3 font-medium text-[#6b1c26] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 focus-visible:outline-[#f7f0e7]"
            animate={opening ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Abrir convite
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Pétalas a subir devagar no fundo vinho. */
function Petals() {
  const petals = Array.from({ length: 16 }, (_, i) => ({
    left: (i * 61) % 100,
    size: 8 + ((i * 7) % 10),
    duration: 11 + ((i * 5) % 9),
    delay: -((i * 3.7) % 14),
    color: i % 3 === 0 ? "#c9a46a" : "#e8b9bf",
    drift: i % 2 === 0 ? 30 : -30,
  }));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-5%] block rounded-[60%_0_60%_0] opacity-60"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.3, background: p.color }}
          animate={{ y: ["0vh", "-115vh"], x: [0, p.drift, 0], rotate: [0, 180, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
