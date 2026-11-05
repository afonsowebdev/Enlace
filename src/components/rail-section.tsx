"use client";

import { motion } from "motion/react";
import { Reveal } from "./reveal";

type RailSectionProps = {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  last?: boolean;
};

/**
 * Uma secção pendurada no fio. O nó acende-se quando o convidado chega a ela.
 * A linha do fio é desenhada por <Rail>, que a preenche com o scroll.
 */
export function RailSection({ id, title, intro, children, last = false }: RailSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`relative scroll-mt-8 pl-7 ${last ? "pb-4" : "pb-24"}`}>
      <motion.span
        aria-hidden="true"
        className="absolute top-[1.1rem] -left-[0.33rem] size-[0.75rem] rounded-full border-[1.5px] border-cobalto"
        initial={{ backgroundColor: "var(--porcelana)", scale: 0.6 }}
        whileInView={{ backgroundColor: "var(--cobalto)", scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -45% 0px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <Reveal>
        <h2 id={`${id}-titulo`} className="font-display text-[2.5rem] leading-tight sm:text-[3.1rem]">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-[60ch] text-pedra">{intro}</p>}
      </Reveal>
      <Reveal className="mt-8" delay={0.1}>
        {children}
      </Reveal>
    </section>
  );
}
