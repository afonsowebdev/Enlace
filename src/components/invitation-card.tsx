"use client";

import { motion } from "motion/react";
import { formatWeddingTime } from "@/lib/format";
import { Sprig } from "./backdrop";
import { Ornament } from "./ornament";
import { Reveal } from "./reveal";

type Event = { label: string; place: string; startsAt: string };

type InvitationCardProps = {
  partnerOneName: string;
  partnerTwoName: string;
  parents: { partnerOne: string[]; partnerTwo: string[] };
  events: Event[];
  timeZone: string;
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
 * O cartão-convite: vinho, como papel de convite impresso, com os pais,
 * os noivos, a cerimónia e a receção, separados por ornamentos dourados.
 */
export function InvitationCard({ partnerOneName, partnerTwoName, parents, events, timeZone }: InvitationCardProps) {
  const hasParents = parents.partnerOne.length > 0 || parents.partnerTwo.length > 0;
  return (
    <div className="relative">
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-cartao px-6 py-12 text-center text-sobre-cartao shadow-[0_30px_60px_-30px_rgba(60,15,20,0.7)] sm:px-10"
        initial={{ opacity: 0, y: 40, rotate: -1.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* filete dourado interior */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-xl border border-dourado/50" />
        <span aria-hidden="true" className="grao pointer-events-none absolute inset-0" />

        <Reveal className="relative">
          <p className="font-display text-[0.95rem] tracking-[0.06em] text-dourado sm:text-lg">Convite de casamento</p>
        </Reveal>

        {hasParents && (
          <>
            <Reveal className="relative mt-6 grid grid-cols-[1fr_auto_1fr] items-stretch gap-4 text-sm" delay={0.05}>
              <ParentsColumn title={`Pais de ${partnerOneName}`} names={parents.partnerOne} />
              <span aria-hidden="true" className="w-px bg-dourado/60" />
              <ParentsColumn title={`Pais de ${partnerTwoName}`} names={parents.partnerTwo} />
            </Reveal>
            <Ornament className="relative mt-9 text-dourado" />
          </>
        )}

        <Reveal className={`relative ${hasParents ? "mt-8" : "mt-6"}`} delay={0.1}>
          <p className="text-[0.95rem] leading-relaxed opacity-90">
            {hasParents ? (
              <>
                Têm a alegria de vos convidar
                <br />
                para o casamento dos seus filhos
              </>
            ) : (
              <>
                Temos a alegria de te convidar
                <br />
                para o nosso casamento
              </>
            )}
          </p>
        </Reveal>

        <Reveal className="relative mt-8" delay={0.2}>
          <p className="font-display text-[clamp(2.4rem,11vw,3.6rem)] leading-none">{partnerOneName}</p>
          <p className="my-3 font-display text-3xl text-dourado">&amp;</p>
          <p className="font-display text-[clamp(2.4rem,11vw,3.6rem)] leading-none">{partnerTwoName}</p>
        </Reveal>

        {events.map((ev, i) => {
          const p = dateParts(ev.startsAt, timeZone);
          return (
            <div key={ev.label} className="relative">
              <Ornament className="mt-10 text-dourado" />
              <Reveal className="mt-8" delay={0.1 + i * 0.1}>
                <p className="font-display text-2xl tracking-wide">{ev.label}</p>
                <p className="mt-1 opacity-85">{ev.place}</p>

                {/* hora | dia da semana */}
                <div className="mt-5 flex items-center justify-center gap-5 text-sm opacity-90">
                  <span>às {formatWeddingTime(ev.startsAt, timeZone)}</span>
                  <span aria-hidden="true" className="h-4 w-px bg-dourado/60" />
                  <span className="capitalize">{p.weekday}</span>
                </div>

                {/* dia | mês e ano */}
                <div className="mt-4 flex items-center justify-center gap-5">
                  <p className="font-display text-6xl leading-none">{p.day}</p>
                  <span aria-hidden="true" className="h-14 w-px bg-dourado/70" />
                  <p className="text-left leading-tight">
                    <span className="block font-medium capitalize">{p.month}</span>
                    <span className="block opacity-85">{p.year}</span>
                  </p>
                </div>
              </Reveal>
            </div>
          );
        })}
      </motion.div>

      {/* raminho a sair pela margem do cartão */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-14 -right-8 w-28 rotate-[30deg] text-dourado opacity-80 sm:-top-20 sm:-right-20 sm:w-44">
        <Sprig variant={0} blossomColor="var(--rubor)" />
      </div>
    </div>
  );
}

function ParentsColumn({ title, names }: { title: string; names: string[] }) {
  return (
    <div>
      <p className="text-xs opacity-75">{title}</p>
      {names.map((n) => (
        <p key={n} className="mt-1 font-medium">
          {n}
        </p>
      ))}
    </div>
  );
}
