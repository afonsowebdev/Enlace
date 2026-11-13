"use client";

import { PrintPhoto } from "./print-photo";
import { Reveal } from "./reveal";

import type { StoryMoment } from "@/lib/types";

/**
 * A história do casal, por anos. No telemóvel, um momento por baixo do outro;
 * no computador, foto e texto lado a lado, alternando de lado.
 */
export function Story({ moments }: { moments: StoryMoment[] }) {
  return (
    <ol className="space-y-20 sm:space-y-28">
      {moments.map((m, i) => {
        const right = i % 2 === 1;
        return (
          <li key={m.id} className={`grid items-center gap-10 ${m.photoUrl ? "md:grid-cols-2 md:gap-16" : ""}`}>
            {m.photoUrl && (
              <PrintPhoto
                src={m.photoUrl}
                alt={m.title}
                tilt={right ? 2 : -2}
                sizes="(min-width: 768px) 28rem, 80vw"
                className={`mx-auto w-[78%] max-w-[24rem] md:w-full ${right ? "md:order-2" : ""}`}
              />
            )}

            <Reveal className={`text-center ${m.photoUrl ? (right ? "md:text-right" : "md:text-left") : ""}`} delay={0.1}>
              <p className="font-display text-[4.2rem] leading-[0.85] text-dourado sm:text-[5.5rem]">{m.year}</p>
              <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-vinho">{m.title}</h3>
              {m.text && (
                <p
                  className={`mx-auto mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed ${
                    m.photoUrl ? (right ? "md:mr-0 md:ml-auto" : "md:ml-0") : ""
                  }`}
                >
                  {m.text}
                </p>
              )}
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
