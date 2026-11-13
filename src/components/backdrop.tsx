"use client";

import { motion, useScroll, useTransform } from "motion/react";

/**
 * Fundo do convite: papel champanhe, ramos com rosas nos quatro cantos que
 * balançam devagar, pétalas a cair e grão de papel. Fica fixo atrás do
 * conteúdo e mexe-se um pouco com o scroll. Com "reduzir movimento" fica parado.
 */
export function Backdrop() {
  const { scrollYProgress } = useScroll();
  const yTop = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yBottom = useTransform(scrollYProgress, [0, 1], [60, -30]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70rem 46rem at 50% -12%, var(--convite-luz), transparent 70%), radial-gradient(48rem 34rem at 100% 0%, var(--linho), transparent 70%), radial-gradient(48rem 34rem at 0% 100%, var(--rubor), transparent 70%)",
        }}
      />

      {/* canto superior direito */}
      <motion.div className="absolute -top-16 -right-24 w-[19rem] sm:-right-12 sm:w-[28rem] lg:w-[34rem]" style={{ y: yTop }}>
        <Corner variant={0} origin="100% 0%" />
      </motion.div>

      {/* canto superior esquerdo */}
      <motion.div className="absolute -top-20 -left-28 w-[15rem] sm:-left-16 sm:w-[22rem] lg:w-[28rem]" style={{ y: yTop }}>
        <Corner variant={1} flip origin="0% 0%" delay={0.5} />
      </motion.div>

      {/* canto inferior esquerdo */}
      <motion.div className="absolute -bottom-24 -left-24 w-[18rem] sm:-left-12 sm:w-[26rem] lg:w-[32rem]" style={{ y: yBottom }}>
        <Corner variant={1} flip origin="0% 100%" delay={0.9} />
      </motion.div>

      {/* canto inferior direito */}
      <motion.div className="absolute -right-28 -bottom-28 hidden w-[24rem] sm:block lg:w-[30rem]" style={{ y: yBottom }}>
        <Corner variant={0} origin="100% 100%" delay={1.2} />
      </motion.div>

      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petala"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              "--dur": `${p.dur}s`,
              "--atraso": `${p.delay}s`,
              "--deriva": `${p.drift}px`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 24" className="h-auto w-full" style={{ opacity: p.opacity }}>
            <path d="M10 1C15 6 18 12 15 18c-2 4-8 4-10 0C2 12 5 6 10 1Z" fill={p.gold ? "var(--dourado)" : "var(--petala)"} />
            <path d="M10 4v15" stroke="var(--convite-luz)" strokeOpacity="0.5" strokeWidth="0.8" />
          </svg>
        </span>
      ))}

      <div className="grao absolute inset-0" />
    </div>
  );
}

/** Pétalas com valores fixos (iguais no servidor e no browser). */
const PETALS = [
  { left: 4, size: 14, dur: 19, delay: 0, drift: 60, opacity: 0.75, gold: false },
  { left: 13, size: 10, dur: 23, delay: 6, drift: -40, opacity: 0.6, gold: true },
  { left: 22, size: 16, dur: 21, delay: 11, drift: 50, opacity: 0.7, gold: false },
  { left: 31, size: 11, dur: 26, delay: 3, drift: 70, opacity: 0.55, gold: false },
  { left: 42, size: 13, dur: 20, delay: 14, drift: -60, opacity: 0.65, gold: true },
  { left: 51, size: 15, dur: 24, delay: 8, drift: 45, opacity: 0.7, gold: false },
  { left: 60, size: 10, dur: 22, delay: 17, drift: -35, opacity: 0.6, gold: false },
  { left: 69, size: 14, dur: 25, delay: 2, drift: 55, opacity: 0.7, gold: true },
  { left: 78, size: 12, dur: 21, delay: 10, drift: -50, opacity: 0.65, gold: false },
  { left: 86, size: 16, dur: 27, delay: 5, drift: 40, opacity: 0.7, gold: false },
  { left: 94, size: 11, dur: 23, delay: 13, drift: -45, opacity: 0.55, gold: true },
  { left: 36, size: 9, dur: 30, delay: 20, drift: 30, opacity: 0.5, gold: false },
];

/** Um canto florido: ramo, duas rosas e um botão, a balançar. */
function Corner({
  variant,
  flip = false,
  origin,
  delay = 0,
}: {
  variant: number;
  flip?: boolean;
  origin: string;
  delay?: number;
}) {
  return (
    <div className="balancar relative" style={{ "--origem": origin, animationDelay: `${-delay * 4}s` } as React.CSSProperties}>
      <div className="text-vinho opacity-[0.2]">
        <Sprig variant={variant} flip={flip} delay={delay} />
      </div>
      <div className={`absolute inset-0 ${flip ? "-scale-x-100" : ""}`}>
        <Bloom className="absolute top-[4%] left-[78%] w-[22%]" delay={delay + 1.4} />
        <Bloom className="absolute top-[30%] left-[56%] w-[15%]" delay={delay + 1.7} rotate={40} />
        <Bloom className="absolute top-[64%] left-[10%] w-[11%]" delay={delay + 2} rotate={-20} bud />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Rosa: camadas de pétalas preenchidas a rubor, com contorno dourado.
// ---------------------------------------------------------------------

function petalRing(n: number, r: number, width: number, offset: number) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = offset + (i / n) * Math.PI * 2;
    const tip = { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
    const side = (s: number) => ({
      x: 50 + Math.cos(a + s * width) * r * 0.8,
      y: 50 + Math.sin(a + s * width) * r * 0.8,
    });
    const l = side(-1);
    const rr = side(1);
    const f = (v: number) => v.toFixed(1);
    out.push(`M50 50 Q${f(l.x)} ${f(l.y)} ${f(tip.x)} ${f(tip.y)} Q${f(rr.x)} ${f(rr.y)} 50 50Z`);
  }
  return out;
}

const ROSE = [
  { d: petalRing(6, 46, 0.62, 0), opacity: 0.55 },
  { d: petalRing(5, 34, 0.7, 0.4), opacity: 0.7 },
  { d: petalRing(4, 22, 0.8, 1.1), opacity: 0.85 },
];
const BUD = [
  { d: petalRing(4, 40, 0.55, 0.6), opacity: 0.6 },
  { d: petalRing(3, 24, 0.7, 1.4), opacity: 0.85 },
];

export function Bloom({
  className = "",
  delay = 0,
  rotate = 0,
  bud = false,
}: {
  className?: string;
  delay?: number;
  rotate?: number;
  bud?: boolean;
}) {
  const layers = bud ? BUD : ROSE;
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ scale: 0, opacity: 0, rotate: rotate - 60 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {layers.map((layer, i) => (
        <g key={i}>
          {layer.d.map((d, j) => (
            <path
              key={j}
              d={d}
              fill="var(--petala)"
              fillOpacity={layer.opacity}
              stroke="var(--dourado)"
              strokeOpacity={0.55}
              strokeWidth={0.8}
            />
          ))}
        </g>
      ))}
      <circle cx="50" cy="50" r={bud ? 4 : 5} fill="var(--dourado)" fillOpacity={0.7} />
    </motion.svg>
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
  { p: [{ x: 380, y: 20 }, { x: 300, y: 120 }, { x: 160, y: 140 }, { x: 40, y: 360 }], leaves: 13, blossoms: [0.12, 0.4, 0.75] },
  { p: [{ x: 20, y: 380 }, { x: 120, y: 300 }, { x: 180, y: 160 }, { x: 360, y: 40 }], leaves: 12, blossoms: [0.3, 0.6, 0.9] },
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
  const flowers: string[] = [];
  for (const t of blossoms) {
    const c = bezier(p0, p1, p2, p3, t);
    flowers.push(...blossom({ x: c.x + 18, y: c.y - 14 }, 11));
  }
  return { stem, parts, flowers };
}

const BUILT = [buildSprig(0), buildSprig(1)];

export function Sprig({
  variant,
  flip = false,
  blossomColor = "var(--dourado)",
  delay = 0,
}: {
  variant: number;
  flip?: boolean;
  blossomColor?: string;
  delay?: number;
}) {
  const { stem, parts, flowers } = BUILT[variant];
  return (
    <svg viewBox="0 0 400 400" className={`h-auto w-full ${flip ? "-scale-x-100" : ""}`} fill="none">
      <motion.path
        d={stem}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], delay: 0.4 + delay }}
      />
      {[...parts, ...flowers].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={i >= parts.length ? blossomColor : "currentColor"}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.9 + delay + i * 0.04 }}
        />
      ))}
    </svg>
  );
}
