"use client";

import { motion } from "motion/react";
import { formatWeddingTime } from "@/lib/format";
import { Bloom, Sprig } from "./backdrop";
import { Ornament } from "./ornament";
import { Reveal } from "./reveal";

type Event = { label: string; place: string; startsAt: string };

type InvitationCardProps = {
  partnerOneName: string;
  partnerTwoName: string;
  parents: { partnerOne: string[]; partnerTwo: string[] };
  events: Event[];
  timeZone: string;
  welcomeMessage?: string | null;
  verse?: { text: string; reference: string | null } | null;
};

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-PT", { ...o, timeZone }).format(d);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
    weekday: part({ weekday: "long" }),
  };
}

/**
 * O cartão-convite: papel branco champanhe com filete dourado duplo e rosas
 * nos cantos. Curto: pais, convite, nomes, mensagem e os eventos lado a lado.
 */
export function InvitationCard({ partnerOneName, partnerTwoName, parents, events, timeZone, welcomeMessage, verse }: InvitationCardProps) {
  const hasParents = parents.partnerOne.length > 0 || parents.partnerTwo.length > 0;
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <motion.div
        className="papel-claro relative overflow-hidden rounded-[1.75rem] px-6 py-14 text-center text-sobre-convite shadow-[0_40px_80px_-40px_rgba(70,40,20,0.45),0_2px_6px_rgba(70,40,20,0.06)] sm:px-14 sm:py-16"
        style={{ background: "linear-gradient(160deg, var(--convite-luz), var(--convite) 55%, var(--convite-luz))" }}
        initial={{ opacity: 0, y: 50, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* filete dourado duplo */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-dourado/60 sm:inset-4" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-[1.15rem] rounded-[1.1rem] border border-dourado/25 sm:inset-[1.45rem]" />
        <span aria-hidden="true" className="grao pointer-events-none absolute inset-0" />

        {/* raminhos nos cantos, dentro do cartão */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-6 -left-6 w-32 text-vinho opacity-25 sm:w-44">
          <Sprig variant={1} flip blossomColor="var(--dourado)" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-6 -bottom-6 w-32 rotate-180 text-vinho opacity-25 sm:w-44">
          <Sprig variant={1} flip blossomColor="var(--dourado)" />
        </div>

        <Reveal className="relative">
          <p className="text-xs font-medium tracking-[0.42em] text-dourado uppercase">Convite de casamento</p>
        </Reveal>

        {hasParents && (
          <Reveal className="relative mx-auto mt-8 grid max-w-xl grid-cols-[1fr_auto_1fr] items-stretch gap-5 text-sm" delay={0.05}>
            <ParentsColumn title={`Pais de ${partnerOneName}`} names={parents.partnerOne} />
            <span aria-hidden="true" className="w-px bg-dourado/50" />
            <ParentsColumn title={`Pais de ${partnerTwoName}`} names={parents.partnerTwo} />
          </Reveal>
        )}

        <Reveal className="relative mt-8" delay={0.1}>
          <p className="text-[0.95rem] leading-relaxed text-sobre-convite/80">
            {hasParents ? "Têm a alegria de vos convidar para o casamento dos seus filhos" : "Temos a alegria de te convidar para o nosso casamento"}
          </p>
        </Reveal>

        <Reveal className="relative mt-7" delay={0.2}>
          <p className="font-display text-[clamp(2.2rem,7vw,3.6rem)] leading-none text-vinho">
            {partnerOneName}
            <span className="brilho mx-3 inline-block sm:mx-5">&amp;</span>
            {partnerTwoName}
          </p>
        </Reveal>

        {welcomeMessage && (
          <Reveal className="relative mx-auto mt-7 max-w-[46ch]" delay={0.25}>
            <p className="text-pretty italic leading-relaxed text-sobre-convite/80">“{welcomeMessage}”</p>
          </Reveal>
        )}

        {verse && (
          <Reveal className="relative mx-auto mt-8 max-w-[52ch]" delay={0.3}>
            <figure>
              <blockquote className="text-pretty whitespace-pre-line text-[0.95rem] italic leading-relaxed text-sobre-convite/75">
                {verse.text}
              </blockquote>
              {verse.reference && (
                <figcaption className="mt-3 text-xs font-medium tracking-[0.28em] text-dourado uppercase">{verse.reference}</figcaption>
              )}
            </figure>
          </Reveal>
        )}

        <Ornament className="relative mt-10 text-dourado" />

        <div className={`relative mx-auto mt-10 grid max-w-2xl gap-10 ${events.length > 1 ? "sm:grid-cols-2 sm:gap-0" : ""}`}>
          {events.map((ev, i) => {
            const p = dateParts(ev.startsAt, timeZone);
            return (
              <Reveal
                key={ev.label}
                delay={0.1 + i * 0.15}
                className={i > 0 && events.length > 1 ? "sm:border-l sm:border-dourado/40" : ""}
              >
                <p className="text-xs font-medium tracking-[0.32em] text-dourado uppercase">{ev.label}</p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <p className="font-display text-5xl leading-none text-vinho">{p.day}</p>
                  <span aria-hidden="true" className="h-12 w-px bg-dourado/60" />
                  <p className="text-left text-sm leading-tight">
                    <span className="block font-medium capitalize">{p.month}</span>
                    <span className="block text-sobre-convite/70">{p.year}</span>
                  </p>
                </div>
                <p className="mt-4 text-sm">
                  <span className="capitalize">{p.weekday}</span>, às {formatWeddingTime(ev.startsAt, timeZone)}
                </p>
                <p className="mt-1 px-4 font-medium">{ev.place}</p>
              </Reveal>
            );
          })}
        </div>
      </motion.div>

      {/* rosas a sair pela margem do cartão */}
      <Bloom className="pointer-events-none absolute -top-8 -right-3 w-20 sm:-top-10 sm:-right-8 sm:w-28" delay={0.4} rotate={20} />
      <Bloom className="pointer-events-none absolute -top-2 right-14 w-10 sm:right-20 sm:w-12" delay={0.7} rotate={-30} bud />
      <Bloom className="pointer-events-none absolute -bottom-8 -left-3 w-16 sm:-bottom-10 sm:-left-8 sm:w-24" delay={0.9} rotate={-10} />
    </div>
  );
}

function ParentsColumn({ title, names }: { title: string; names: string[] }) {
  return (
    <div>
      <p className="text-xs text-sobre-convite/60">{title}</p>
      {names.map((n) => (
        <p key={n} className="mt-1 font-medium">
          {n}
        </p>
      ))}
    </div>
  );
}
