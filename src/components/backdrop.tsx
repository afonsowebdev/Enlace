"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useInviteOpened } from "./envelope-intro";

/**
 * Fundo do convite: raminhos pintados a vinho, como na louça portuguesa,
 * um véu de cor suave e grão de papel. Fica fixo atrás do conteúdo e
 * mexe-se devagar com o scroll.
 */
export function Backdrop() {
  const { scrollYProgress } = useScroll();
  const yTop = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const rotTop = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const yBottom = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const rotBottom = useTransform(scrollYProgress, [0, 1], [0, -5]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 85% -10%, var(--linho), transparent 70%), radial-gradient(50rem 36rem at -10% 110%, var(--rubor), transparent 70%)",
        }}
      />

      <motion.div
        className="absolute -top-10 -right-24 w-[26rem] text-vinho opacity-[0.22] sm:-right-10 sm:w-[34rem] lg:right-[4vw]"
        style={{ y: yTop, rotate: rotTop }}
      >
        <Sprig variant={0} />
      </motion.div>

      <motion.div
        className="absolute -bottom-24 -left-28 w-[24rem] text-vinho opacity-[0.18] sm:-left-12 sm:w-[32rem] lg:left-[3vw]"
        style={{ y: yBottom, rotate: rotBottom }}
      >
        <Sprig variant={1} flip />
      </motion.div>

      <div className="grao absolute inset-0" />
    </div>
  );
}

// ---------------------------------------------------------------------
// Raminho gerado a partir de uma curva: caule, folhas alternadas e flores.
// ---------------------------------------------------------------------

type Pt = { x: number; y: number };

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function leaf(base: Pt, angle: number, length: number, width: number) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const tip = { x: base.x + dx * length, y: base.y + dy * length };
  const mid = { x: base.x + dx * length * 0.5, y: base.y + dy * length * 0.5 };
  const c1 = { x: mid.x - dy * width, y: mid.y + dx * width };
  const c2 = { x: mid.x + dy * width, y: mid.y - dx * width };
  const f = (n: number) => n.toFixed(1);
  return {
    outline: `M${f(base.x)} ${f(base.y)} Q${f(c1.x)} ${f(c1.y)} ${f(tip.x)} ${f(tip.y)} Q${f(c2.x)} ${f(c2.y)} ${f(base.x)} ${f(base.y)}`,
    vein: `M${f(base.x)} ${f(base.y)} L${f(base.x + dx * length * 0.8)} ${f(base.y + dy * length * 0.8)}`,
  };
}

function blossom(c: Pt, r: number) {
  const petals: string[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const p = { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r };
    petals.push(`M${c.x.toFixed(1)} ${c.y.toFixed(1)} Q${(p.x + Math.cos(a + 1.1) * r * 0.9).toFixed(1)} ${(p.y + Math.sin(a + 1.1) * r * 0.9).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${(p.x + Math.cos(a - 1.1) * r * 0.9).toFixed(1)} ${(p.y + Math.sin(a - 1.1) * r * 0.9).toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`);
  }
  return petals;
}

const SPRIGS = [
  { p: [{ x: 380, y: 20 }, { x: 300, y: 120 }, { x: 160, y: 140 }, { x: 40, y: 360 }], leaves: 11, blossoms: [0.12, 0.55] },
  { p: [{ x: 20, y: 380 }, { x: 120, y: 300 }, { x: 180, y: 160 }, { x: 360, y: 40 }], leaves: 10, blossoms: [0.35, 0.9] },
] as const;

function buildSprig(variant: number) {
  const { p, leaves, blossoms } = SPRIGS[variant];
  const [p0, p1, p2, p3] = p;
  const f = (n: number) => n.toFixed(1);
  const stem = `M${f(p0.x)} ${f(p0.y)} C${f(p1.x)} ${f(p1.y)} ${f(p2.x)} ${f(p2.y)} ${f(p3.x)} ${f(p3.y)}`;
  const parts: string[] = [];
  for (let i = 1; i <= leaves; i++) {
    const t = i / (leaves + 1);
    const a = bezier(p0, p1, p2, p3, t);
    const b = bezier(p0, p1, p2, p3, Math.min(1, t + 0.01));
    const tangent = Math.atan2(b.y - a.y, b.x - a.x);
    const side = i % 2 === 0 ? 1 : -1;
    const size = 1 - Math.abs(t - 0.45) * 0.9;
    const l = leaf(a, tangent + side * 0.75, 30 + 22 * size, 7 + 5 * size);
    parts.push(l.outline, l.vein);
  }
  for (const t of blossoms) {
    const c = bezier(p0, p1, p2, p3, t);
    parts.push(...blossom({ x: c.x + 18, y: c.y - 14 }, 11));
  }
  return { stem, parts };
}

const BUILT = [buildSprig(0), buildSprig(1)];

export function Sprig({
  variant,
  flip = false,
  blossomColor = "var(--dourado)",
}: {
  variant: number;
  flip?: boolean;
  blossomColor?: string;
}) {
  const { stem, parts } = BUILT[variant];
  const opened = useInviteOpened();
  return (
    <svg viewBox="0 0 400 400" className={`h-auto w-full ${flip ? "-scale-x-100" : ""}`} fill="none">
      <motion.path
        d={stem}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: opened ? 1 : 0 }}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
      />
      {parts.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={i >= parts.length - 10 ? blossomColor : "currentColor"}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={opened ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.9 + i * 0.045 }}
        />
      ))}
    </svg>
  );
}
