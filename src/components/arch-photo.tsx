"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";

type ArchPhotoProps = {
  src: string;
  alt: string;
  /** "load": abre ao carregar a página. "scroll": abre quando chega ao ecrã. */
  trigger?: "load" | "scroll";
  priority?: boolean;
  className?: string;
  sizes?: string;
};

const curtain: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0% round 999px 999px 12px 12px)" },
  shown: {
    clipPath: "inset(0% 0% 0% 0% round 999px 999px 12px 12px)",
    transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
  },
};

const zoom: Variants = {
  hidden: { scale: 1.18 },
  shown: { scale: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Foto do casal numa moldura em arco. Abre de baixo para cima como uma cortina,
 * a imagem aproxima-se devagar e, com o scroll, desliza ligeiramente (parallax).
 *
 * O "entrou no ecrã" é medido no contentor exterior: o Chrome conta o clip-path
 * do próprio elemento, e uma foto ainda fechada nunca pareceria visível.
 */
export function ArchPhoto({
  src,
  alt,
  trigger = "scroll",
  priority = false,
  className = "",
  sizes = "(min-width: 640px) 34rem, 90vw",
}: ArchPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const start =
    trigger === "load"
      ? { initial: "hidden", animate: "shown", transition: { delayChildren: 0.6 } }
      : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.3 } };

  return (
    <motion.div ref={ref} className={`relative ${className}`} {...start}>
      <motion.div variants={curtain} className="arco absolute inset-0 overflow-hidden bg-esmalte">
        <motion.div className="absolute inset-[-10%]" style={{ y }}>
          <motion.div variants={zoom} className="absolute inset-0">
            <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
          </motion.div>
        </motion.div>
        {/* filete fino, como o contorno pintado numa peça de porcelana */}
        <span aria-hidden="true" className="arco pointer-events-none absolute inset-2 border border-white/45" />
      </motion.div>
    </motion.div>
  );
}
