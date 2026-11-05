"use client";

import { MotionConfig } from "motion/react";

/** Respeita "reduzir movimento": sem deslocações nem escalas, só transições de opacidade. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
