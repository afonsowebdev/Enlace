"use client";

import { motion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p";
};

/** Revela o conteúdo quando entra no ecrã: sobe um pouco e ganha nitidez. Só acontece uma vez. */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
