"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/**
 * O fio ao longo das secções: uma linha clara por baixo e a linha vinho
 * por cima, que se vai preenchendo à medida que o convidado desce.
 */
export function Rail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 55%", "end 75%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="relative">
      <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-[1.5px] bg-nevoa" />
      <motion.span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-[1.5px] origin-top bg-vinho"
        style={{ scaleY }}
      />
      {children}
    </div>
  );
}
