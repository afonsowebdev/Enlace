"use client";

import { Ornament } from "./ornament";
import { PrintPhoto } from "./print-photo";
import { Reveal } from "./reveal";

export type StoryMoment = {
  year: string;
  title: string;
  text: string;
  photo: { src: string; alt: string };
};

/**
 * A história do casal, por anos. Cada momento tem o ano em grande, um título,
 * uma fotografia impressa (inclinada alternadamente) e um pequeno texto.
 */
export function Story({ moments }: { moments: StoryMoment[] }) {
  return (
    <ol>
      {moments.map((m, i) => {
        const right = i % 2 === 1;
        return (
          <li key={m.year}>
            {i > 0 && <Ornament className="my-16 text-dourado" />}

            <Reveal className={right ? "text-right" : ""}>
              <p className="font-display text-[4.5rem] leading-[0.85] text-vinho sm:text-[5.5rem]">{m.year}</p>
              <h3 className="mt-2 font-display text-[1.6rem] leading-tight">{m.title}</h3>
            </Reveal>

            <PrintPhoto
              src={m.photo.src}
              alt={m.photo.alt}
              tilt={right ? 2.5 : -2.5}
              className={`mt-8 w-[94%] ${right ? "ml-auto" : ""}`}
            />

            <Reveal className={`mt-8 ${right ? "text-right" : ""}`} delay={0.1}>
              <p className={`max-w-[42ch] text-[1.05rem] leading-relaxed ${right ? "ml-auto" : ""}`}>{m.text}</p>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
