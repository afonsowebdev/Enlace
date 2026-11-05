"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";

type PrintPhotoProps = {
  src: string;
  alt: string;
  /** Inclinação final em graus (ex.: -2 ou 2.5). */
  tilt?: number;
  caption?: string;
  /** "load": entra ao carregar a página. "scroll": entra quando chega ao ecrã. */
  trigger?: "load" | "scroll";
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/**
 * Fotografia impressa: moldura de papel branco, ligeiramente inclinada.
 * Ao entrar no ecrã "pousa" na página (desce, roda até à inclinação final)
 * e a imagem aproxima-se devagar; com o scroll, a imagem desliza um pouco.
 */
export function PrintPhoto({
  src,
  alt,
  tilt = 0,
  caption,
  trigger = "scroll",
  priority = false,
  className = "",
  sizes = "(min-width: 640px) 30rem, 80vw",
}: PrintPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const place: Variants = {
    hidden: { opacity: 0, y: 70, rotate: tilt * 3 + (tilt >= 0 ? 4 : -4), scale: 0.94 },
    shown: {
      opacity: 1,
      y: 0,
      rotate: tilt,
      scale: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const zoom: Variants = {
    hidden: { scale: 1.2 },
    shown: { scale: 1, transition: { duration: 2.4, ease: [0.22, 1, 0.36, 1] } },
  };

  const start =
    trigger === "load"
      ? { initial: "hidden", animate: "shown", transition: { delay: 0.5 } }
      : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.25 } };

  return (
    <motion.figure ref={ref} className={`relative ${className}`} {...start}>
      <motion.div
        variants={place}
        className="rounded-[3px] bg-[#fffdf9] p-2.5 pb-3 shadow-[0_1px_2px_rgba(60,20,25,0.12),0_24px_50px_-22px_rgba(60,20,25,0.5)] sm:p-3.5"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-linho">
          <motion.div className="absolute inset-[-8%]" style={{ y }}>
            <motion.div variants={zoom} className="absolute inset-0">
              <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
        {caption && (
          <figcaption className="px-1 pt-3 text-center font-display text-lg tracking-wide text-[#6b1c26]">
            {caption}
          </figcaption>
        )}
      </motion.div>
    </motion.figure>
  );
}
