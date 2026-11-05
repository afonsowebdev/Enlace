"use client";

import { motion } from "motion/react";
import { formatWeddingTime } from "@/lib/format";
import { Sprig } from "./backdrop";
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
 * os noivos, a cerimónia e a receção. Um raminho sai pela margem direita.
 */
export function InvitationCard({ partnerOneName, partnerTwoName, parents, events, timeZone }: InvitationCardProps) {
  return (
    <div className="relative">
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-vinho px-6 py-12 text-center text-sobre-vinho shadow-[0_30px_60px_-30px_rgba(60,15,20,0.7)] sm:px-10"
        initial={{ opacity: 0, y: 40, rotate: -1.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* filete dourado interior */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-xl border border-dourado/50" />
        <span aria-hidden="true" className="grao pointer-events-none absolute inset-0" />

        <Reveal className="relative grid grid-cols-2 gap-4 text-sm">
          <ParentsColumn title={`Pais de ${partnerOneName}`} names={parents.partnerOne} />
          <ParentsColumn title={`Pais de ${partnerTwoName}`} names={parents.partnerTwo} divider />
        </Reveal>

        <Reveal className="relative mt-10" delay={0.1}>
          <p className="text-[0.95rem] leading-relaxed opacity-90">
            Têm a alegria de vos convidar
            <br />
            para o casamento dos seus filhos
          </p>
        </Reveal>

        <Reveal className="relative mt-8" delay={0.2}>
          <p className="font-display text-[clamp(2.4rem,11vw,3.6rem)] leading-none">{partnerOneName}</p>
          <p className="my-3 font-display text-3xl text-dourado">&amp;</p>
          <p className="font-display text-[clamp(2.4rem,11vw,3.6rem)] leading-none">{partnerTwoName}</p>
        </Reveal>

        <div className="relative mt-12 space-y-10">
          {events.map((ev, i) => {
            const p = dateParts(ev.startsAt, timeZone);
            return (
              <Reveal key={ev.label} delay={0.1 + i * 0.1}>
                <p className="font-display text-xl tracking-wide">{ev.label}</p>
                <p className="mt-1 opacity-85">{ev.place}</p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <p className="text-right text-sm leading-tight opacity-85">
                    <span className="block capitalize">{p.weekday}</span>
                    <span className="block">às {formatWeddingTime(ev.startsAt, timeZone)}</span>
                  </p>
                  <span aria-hidden="true" className="h-12 w-px bg-dourado/60" />
                  <p className="font-display text-5xl leading-none">{p.day}</p>
                  <span aria-hidden="true" className="h-12 w-px bg-dourado/60" />
                  <p className="text-left text-sm leading-tight opacity-85">
                    <span className="block capitalize">{p.month}</span>
                    <span className="block">{p.year}</span>
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </motion.div>

      {/* raminho a sair pela margem do cartão */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 w-44 rotate-[18deg] text-dourado opacity-90 sm:-right-16 sm:w-56">
        <Sprig variant={0} blossomColor="var(--rubor)" />
      </div>
    </div>
  );
}

function ParentsColumn({ title, names, divider = false }: { title: string; names: string[]; divider?: boolean }) {
  return (
    <div className={divider ? "border-l border-dourado/40" : ""}>
      <p className="text-xs opacity-75">{title}</p>
      {names.map((n) => (
        <p key={n} className="mt-1 font-medium">
          {n}
        </p>
      ))}
    </div>
  );
}
