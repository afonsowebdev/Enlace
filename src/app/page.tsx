import { Hero } from "@/components/hero";
import { Invitation } from "@/components/invitation";
import { demoGifts, demoPaymentDetails, demoWedding } from "@/lib/demo-data";

// Protótipo de design (fase 1): usa dados de demonstração.
export default function Home() {
  const w = demoWedding;
  return (
    <main className="mx-auto w-full max-w-[34rem] px-5 pb-24 sm:px-6">
      <Hero
        partnerOneName={w.partnerOneName}
        partnerTwoName={w.partnerTwoName}
        startsAt={w.startsAt}
        timeZone={w.timeZone}
        venueName={w.venueName}
        welcomeMessage={w.welcomeMessage}
      />
      <Invitation wedding={w} gifts={demoGifts} payment={demoPaymentDetails} />
      <footer className="mt-16 pl-7 text-sm text-pedra">
        Com amor, {w.partnerOneName} e {w.partnerTwoName}
      </footer>
    </main>
  );
}
