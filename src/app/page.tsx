import { Backdrop } from "@/components/backdrop";
import { Hero } from "@/components/hero";
import { Invitation } from "@/components/invitation";
import { PhotoStage, PhotoStageProvider } from "@/components/photo-stage";
import {
  demoCoverPhoto,
  demoGifts,
  demoPaymentDetails,
  demoStory,
  demoWedding,
} from "@/lib/demo-data";

// Protótipo de design: usa dados e fotos de demonstração.
export default function Home() {
  const w = demoWedding;
  return (
    <>
      <Backdrop />
      <PhotoStageProvider>
        <main className="relative mx-auto grid w-full max-w-[34rem] px-5 pb-24 sm:px-6 lg:max-w-[68rem] lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-20 lg:px-10">
          <div className="min-w-0">
            <Hero
              partnerOneName={w.partnerOneName}
              partnerTwoName={w.partnerTwoName}
              startsAt={w.startsAt}
              timeZone={w.timeZone}
              venueName={w.venueName}
              welcomeMessage={w.welcomeMessage}
              coverPhoto={demoCoverPhoto}
            />
            <Invitation
              wedding={w}
              story={demoStory}
              gifts={demoGifts}
              payment={demoPaymentDetails}
            />
            <footer className="mt-20 pl-7">
              <p className="font-display text-2xl">
                {w.partnerOneName} &amp; {w.partnerTwoName}
              </p>
              <p className="mt-1 text-sm text-pedra">Com amor, à tua espera.</p>
            </footer>
          </div>
          <PhotoStage
            photos={[
              { src: demoCoverPhoto.src, alt: demoCoverPhoto.alt },
              ...demoStory.map((m) => ({
                src: m.photo.src,
                alt: m.photo.alt,
              })),
            ]}
          />
        </main>
      </PhotoStageProvider>
    </>
  );
}
