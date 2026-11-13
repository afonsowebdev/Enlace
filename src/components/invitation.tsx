"use client";

import type { Gift, Place, StoryMoment } from "@/lib/types";
import { Gifts } from "./gifts";
import { Memories } from "./memories";
import { Rsvp } from "./rsvp";
import { Section } from "./section";
import { Story } from "./story";
import { useGuest } from "./use-guest";
import { Venue } from "./venue";

type InvitationProps = {
  weddingId: number;
  /** "Ana & Rui", para a agenda. */
  coupleNames: string;
  timeZone: string;
  rsvpDeadline: string | null;
  maxCompanions: number;
  places: Place[];
  story: StoryMoment[];
  gifts: Gift[];
};

/** O percurso do convidado: história, onde, responder, oferecer, partilhar. */
export function Invitation({ weddingId, coupleNames, timeZone, rsvpDeadline, maxCompanions, places, story, gifts }: InvitationProps) {
  const { supabase, guest, loading, respond } = useGuest(weddingId);

  return (
    <>
      {story.length > 0 && (
        <Section id="historia" title="A nossa história">
          <Story moments={story} />
        </Section>
      )}

      <Section id="local" title="Onde e quando">
        <Venue places={places} timeZone={timeZone} coupleNames={coupleNames} />
      </Section>

      <Section id="resposta" title="Vens?" intro="Diz-nos se contamos contigo. Demora menos de um minuto.">
        {loading ? (
          <p className="text-center text-pedra">A carregar…</p>
        ) : (
          <Rsvp
            key={guest?.id ?? "novo"}
            maxCompanions={maxCompanions}
            deadline={rsvpDeadline}
            response={
              guest && guest.rsvp_status !== "pending"
                ? {
                    name: guest.full_name,
                    attending: guest.rsvp_status === "attending",
                    companions: guest.companions,
                    message: guest.message ?? "",
                  }
                : null
            }
            onRespond={respond}
          />
        )}
      </Section>

      <Section
        id="presentes"
        title="Presentes"
        intro="Cada artigo só pode ser oferecido por uma pessoa. Nos presentes em dinheiro, todos podem contribuir."
      >
        <Gifts supabase={supabase} weddingId={weddingId} initialGifts={gifts} guestId={guest?.id ?? null} />
      </Section>

      <Section id="memorias" title="Memórias" intro="No dia e depois, partilha aqui as fotos e vídeos que tirares.">
        <Memories supabase={supabase} weddingId={weddingId} guestId={guest?.id ?? null} />
      </Section>
    </>
  );
}
