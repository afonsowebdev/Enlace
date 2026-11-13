"use client";

import { Reveal } from "./reveal";

type SectionProps = {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  /** Largura do conteúdo: "narrow" para formulários, "wide" para listas, fotos e mapas. */
  width?: "narrow" | "wide";
};

/** Uma secção do convite: título centrado com um raminho dourado e o conteúdo por baixo. */
export function Section({ id, title, intro, children, width = "wide" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-8 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <TitleFlourish />
        <h2 id={`${id}-titulo`} className="mt-4 font-display text-[2.4rem] leading-tight sm:text-[3.2rem]">
          {title}
        </h2>
        {intro && <p className="mx-auto mt-3 max-w-[56ch] text-pretty text-pedra">{intro}</p>}
      </Reveal>
      <Reveal className={`mx-auto mt-12 w-full ${width === "narrow" ? "max-w-xl" : "max-w-5xl"}`} delay={0.1}>
        {children}
      </Reveal>
    </section>
  );
}

/** Pequeno ramo dourado simétrico por cima dos títulos. */
function TitleFlourish() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 24" className="mx-auto h-5 w-28 text-dourado" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M4 12h38M78 12h38" strokeOpacity="0.6" />
      <path d="M42 12c6-7 12-7 14-2M78 12c-6-7-12-7-14-2M42 12c6 7 12 7 14 2M78 12c-6 7-12 7-14 2" />
      <circle cx="60" cy="12" r="3" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}
