"use client";

import Image from "next/image";
import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type StagePhoto = { src: string; alt: string; caption?: string };

type Stage = { active: number; show: (index: number) => void };

const StageContext = createContext<Stage>({ active: 0, show: () => {} });

/** Partilha qual a foto em palco entre a abertura, a história e a coluna das fotos. */
export function PhotoStageProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  return <StageContext.Provider value={{ active, show: setActive }}>{children}</StageContext.Provider>;
}

export function usePhotoStage() {
  return useContext(StageContext);
}

/**
 * Coluna das fotos (só em ecrãs grandes): fica fixa enquanto se faz scroll.
 * Quando muda de foto, a nova abre por cima da anterior, como uma cortina.
 */
export function PhotoStage({ photos }: { photos: StagePhoto[] }) {
  const { active } = usePhotoStage();
  const photo = photos[Math.min(active, photos.length - 1)];

  return (
    <aside aria-hidden="true" className="hidden lg:block">
      <div className="sticky top-[10vh] pt-20">
        <motion.div
          className="arco relative mx-auto aspect-[4/5] max-h-[72vh] w-full overflow-hidden bg-esmalte"
          initial={{ clipPath: "inset(100% 0% 0% 0% round 999px 999px 12px 12px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 999px 999px 12px 12px)" }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={photo.src}
              className="absolute inset-0"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, transition: { delay: 1.1, duration: 0.2 } }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={photo.src} alt="" fill sizes="30rem" className="object-cover" priority={active === 0} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <span className="arco pointer-events-none absolute inset-2.5 z-10 border border-white/45" />
        </motion.div>

        <div className="mt-5 h-6 text-center text-sm text-pedra">
          <AnimatePresence mode="wait">
            {photo.caption && (
              <motion.p
                key={photo.caption}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
              >
                {photo.caption}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
