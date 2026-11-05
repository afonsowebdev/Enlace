import { Backdrop } from "@/components/backdrop";
import { Hero } from "@/components/hero";
import { Invitation } from "@/components/invitation";
import { InvitationCard } from "@/components/invitation-card";
import { MusicToggle } from "@/components/music-toggle";
import { Reveal } from "@/components/reveal";
import { demoCoverPhoto, demoGifts, demoPaymentDetails, demoStory, demoWedding } from "@/lib/demo-data";

// Protótipo de design: usa dados e fotos de demonstração.
export default function Home() {
  const w = demoWedding;
  const places = [
    {
      label: "Cerimónia",
      name: w.venueName,
      address: w.venueAddress,
      startsAt: w.startsAt,
      latitude: w.venueLatitude,
      longitude: w.venueLongitude,
    },
    {
      label: "Receção",
      name: w.reception.name,
      address: w.reception.address,
      startsAt: w.reception.startsAt,
      latitude: w.reception.latitude,
      longitude: w.reception.longitude,
    },
  ];

  return (
    <>
      <MusicToggle src={w.musicUrl} />
      <Backdrop />

      <main className="relative mx-auto w-full max-w-[38rem] px-5 pb-24 sm:px-6">
        <Hero
          partnerOneName={w.partnerOneName}
          partnerTwoName={w.partnerTwoName}
          startsAt={w.startsAt}
          timeZone={w.timeZone}
          venueName={w.venueName}
          welcomeMessage={w.welcomeMessage}
          coverPhoto={demoCoverPhoto}
        />

        <div className="border-l-[1.5px] border-vinho pt-10 pb-24 pl-7">
          <InvitationCard
            partnerOneName={w.partnerOneName}
            partnerTwoName={w.partnerTwoName}
            parents={w.parents}
            timeZone={w.timeZone}
            events={places.map((p) => ({ label: p.label, place: p.name, startsAt: p.startsAt }))}
          />

          {/* Depois de ler o convite, o convidado responde. */}
          <Reveal className="mt-12 text-center">
            <a
              href="#resposta"
              className="inline-flex items-center rounded-full bg-cartao px-8 py-3.5 font-medium text-sobre-cartao shadow-[0_12px_30px_-12px_rgba(60,15,20,0.6)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Responder ao convite
            </a>
          </Reveal>
        </div>

        <Invitation wedding={w} places={places} story={demoStory} gifts={demoGifts} payment={demoPaymentDetails} />

        <footer className="mt-20 pl-7">
          <p className="font-display text-2xl">
            {w.partnerOneName} &amp; {w.partnerTwoName}
          </p>
          <p className="mt-1 text-sm text-pedra">Com amor, à tua espera.</p>
        </footer>
      </main>
    </>
  );
}
