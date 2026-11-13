"use client";

import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Arco dourado duplo que se desenha à volta do conteúdo, como na entrada.
 * Mede o espaço que tem, para o topo ser sempre um semicírculo perfeito
 * (sem esticar), e desenha-se quando aparece no ecrã.
 */
export function ArchFrame({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const path = (i: number) => {
    const r = w / 2 - i;
    return `M${i} ${h} V${w / 2} A${r} ${r} 0 0 1 ${w - i} ${w / 2} V${h}`;
  };

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 overflow-visible text-dourado">
          {[1, 9].map((inset, i) => (
            <motion.path
              key={inset}
              d={path(inset)}
              fill="none"
              stroke="currentColor"
              strokeOpacity={i === 0 ? 0.75 : 0.35}
              strokeWidth={1}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: delay + i * 0.3 }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
