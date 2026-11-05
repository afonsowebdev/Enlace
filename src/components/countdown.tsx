"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

/** "Faltam 584 dias" — o número conta até ao valor certo ao aparecer. */
export function Countdown({ startsAt }: { startsAt: string }) {
  const [days, setDays] = useState<number | null>(null);
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    // Calculado no browser, para não haver diferenças entre o servidor e o telemóvel.
    const ms = new Date(startsAt).getTime() - Date.now();
    const d = Math.ceil(ms / 86_400_000);
    setDays(d);
    if (d > 0) {
      const controls = animate(value, d, { duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 1.7 });
      return () => controls.stop();
    }
  }, [startsAt, value]);

  if (days === null) return <p className="mt-4 h-7" aria-hidden="true" />;
  if (days < 0) return null;
  if (days === 0) return <p className="mt-4 font-medium text-cobalto">É hoje.</p>;

  return (
    <p className="mt-4 text-pedra" aria-label={`Faltam ${days} ${days === 1 ? "dia" : "dias"}`}>
      Faltam <motion.span className="font-display text-xl text-cobalto tabular-nums">{rounded}</motion.span>{" "}
      {days === 1 ? "dia" : "dias"}
    </p>
  );
}
