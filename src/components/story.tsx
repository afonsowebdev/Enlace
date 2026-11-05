"use client";

import { motion } from "motion/react";
import { ArchPhoto } from "./arch-photo";
import { usePhotoStage } from "./photo-stage";
import { Reveal } from "./reveal";

export type StoryMoment = { year: string; text: string; photo: { src: string; alt: string } };

/** A história do casal, por anos. As fotos alternam de lado e abrem ao chegar ao ecrã. */
export function Story({ moments }: { moments: StoryMoment[] }) {
  const { active, show } = usePhotoStage();
  return (
    <ol className="space-y-16 lg:space-y-[28vh] lg:pb-[10vh]">
      {moments.map((m, i) => {
        const right = i % 2 === 1;
        return (
          <motion.li
            key={m.year}
            className={`flex flex-col transition-opacity duration-700 lg:items-start lg:text-left ${right ? "items-end text-right" : "items-start"} ${active === i + 1 ? "" : "lg:opacity-35"}`}
            onViewportEnter={() => show(i + 1)}
            viewport={{ margin: "-45% 0px -45% 0px" }}
          >
            <ArchPhoto
              src={m.photo.src}
              alt={m.photo.alt}
              className="aspect-[4/5] w-[78%] lg:hidden"
              sizes="(min-width: 640px) 26rem, 70vw"
            />
            <Reveal className="mt-5 max-w-[78%] lg:mt-0 lg:max-w-none" delay={0.15}>
              <p className="font-display text-2xl text-cobalto lg:text-[3.5rem] lg:leading-none">{m.year}</p>
              <p className="mt-1 lg:mt-3 lg:max-w-[34ch] lg:text-lg">{m.text}</p>
            </Reveal>
          </motion.li>
        );
      })}
    </ol>
  );
}
