"use client";

import { Ornament } from "./ornament";
import { PrintPhoto } from "./print-photo";
import { Reveal } from "./reveal";

import type { StoryMoment } from "@/lib/types";

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
          <li key={m.id}>
            {i > 0 && <Ornament className="my-16 text-dourado" />}

            <Reveal className={right ? "text-right" : ""}>
              <p className="font-display text-[4.5rem] leading-[0.85] text-vinho sm:text-[5.5rem]">{m.year}</p>
              <h3 className="mt-2 font-display text-[1.6rem] leading-tight">{m.title}</h3>
            </Reveal>

            {m.photoUrl && (
            <PrintPhoto
              src={m.photoUrl}
              alt={m.title}
              tilt={right ? 2.5 : -2.5}
              className={`mt-8 w-[76%] sm:w-[70%] ${right ? "ml-auto mr-2" : "ml-2"}`}
            />
            )}

            <Reveal className={`mt-8 ${right ? "text-right" : ""}`} delay={0.1}>
              {m.text && (
                <p className={`max-w-[42ch] text-[1.05rem] leading-relaxed ${right ? "ml-auto" : ""}`}>{m.text}</p>
              )}
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
