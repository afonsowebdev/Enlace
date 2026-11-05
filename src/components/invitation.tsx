"use client";

import { useState } from "react";
import type { DemoGift } from "@/lib/demo-data";
import { Gifts } from "./gifts";
import { Memories } from "./memories";
import { Rail } from "./rail";
import { RailSection } from "./rail-section";
import { Story, type StoryMoment } from "./story";
import { Rsvp, type GuestResponse } from "./rsvp";
import { Venue } from "./venue";

type InvitationProps = {
  wedding: {
    venueName: string;
    venueAddress: string;
    venueLatitude: number | null;
    venueLongitude: number | null;
    rsvpDeadline: string;
    maxCompanions: number;
  };
  story: StoryMoment[];
  gifts: DemoGift[];
  payment: { holderName: string; iban: string | null; mbwayPhone: string | null };
};

/** O percurso do convidado, pendurado no fio: onde, responder, oferecer, partilhar. */
export function Invitation({ wedding, story, gifts, payment }: InvitationProps) {
  const [response, setResponse] = useState<GuestResponse | null>(null);
  const guestName = response?.name ?? null;

  return (
    <Rail>
      <RailSection id="historia" title="A nossa história">
        <Story moments={story} />
      </RailSection>

      <RailSection id="local" title="Onde e quando">
        <Venue
          venueName={wedding.venueName}
          venueAddress={wedding.venueAddress}
          latitude={wedding.venueLatitude}
          longitude={wedding.venueLongitude}
        />
      </RailSection>

      <RailSection id="resposta" title="Vens?">
        <Rsvp
          maxCompanions={wedding.maxCompanions}
          deadline={wedding.rsvpDeadline}
          response={response}
          onRespond={setResponse}
        />
      </RailSection>

      <RailSection
        id="presentes"
        title="Presentes"
        intro="Cada artigo só pode ser oferecido por uma pessoa. Nos presentes em dinheiro, todos podem contribuir."
      >
        <Gifts gifts={gifts} payment={payment} guestName={guestName} />
      </RailSection>

      <RailSection id="memorias" title="Memórias" intro="No dia e depois, partilha aqui as fotos e vídeos que tirares." last>
        <Memories guestName={guestName} />
      </RailSection>
    </Rail>
  );
}
