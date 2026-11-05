"use client";

import type { Gift, Place, StoryMoment } from "@/lib/types";
import { Gifts } from "./gifts";
import { Memories } from "./memories";
import { Rail } from "./rail";
import { RailSection } from "./rail-section";
import { Rsvp } from "./rsvp";
import { Story } from "./story";
import { useGuest } from "./use-guest";
import { Venue } from "./venue";

type InvitationProps = {
  weddingId: number;
  timeZone: string;
  rsvpDeadline: string | null;
  maxCompanions: number;
  places: Place[];
  story: StoryMoment[];
  gifts: Gift[];
};

/** O percurso do convidado, pendurado no fio: história, onde, responder, oferecer, partilhar. */
export function Invitation({ weddingId, timeZone, rsvpDeadline, maxCompanions, places, story, gifts }: InvitationProps) {
  const { supabase, guest, loading, respond } = useGuest(weddingId);

  return (
    <Rail>
      {story.length > 0 && (
        <RailSection id="historia" title="A nossa história">
          <Story moments={story} />
        </RailSection>
      )}

      <RailSection id="local" title="Onde e quando">
        <Venue places={places} timeZone={timeZone} />
      </RailSection>

      <RailSection id="resposta" title="Vens?">
        {loading ? (
          <p className="text-pedra">A carregar…</p>
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
      </RailSection>

      <RailSection
        id="presentes"
        title="Presentes"
        intro="Cada artigo só pode ser oferecido por uma pessoa. Nos presentes em dinheiro, todos podem contribuir."
      >
        <Gifts supabase={supabase} weddingId={weddingId} initialGifts={gifts} guestId={guest?.id ?? null} />
      </RailSection>

      <RailSection id="memorias" title="Memórias" intro="No dia e depois, partilha aqui as fotos e vídeos que tirares." last>
        <Memories supabase={supabase} weddingId={weddingId} guestId={guest?.id ?? null} />
      </RailSection>
    </Rail>
  );
}
