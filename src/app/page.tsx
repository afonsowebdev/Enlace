import { Backdrop } from "@/components/backdrop";
import { Hero } from "@/components/hero";
import { Invitation } from "@/components/invitation";
import { InvitationCard } from "@/components/invitation-card";
import { MusicToggle } from "@/components/music-toggle";
import { NoticePage } from "@/components/notice-page";
import { Reveal } from "@/components/reveal";
import { mediaUrl } from "@/lib/env";
import { loadInvitation } from "@/lib/invitation";
import { placesOf } from "@/lib/types";

// Os dados mudam sempre que os noivos editam o painel: nada de cache.
export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await loadInvitation();

  if (result.status === "no-config") {
    return (
      <NoticePage title="Falta ligar ao Supabase">
        <p>
          O site está publicado, mas ainda não sabe onde estão os dados. Na Vercel, em{" "}
          <strong className="text-tinta">Settings → Environment Variables</strong>, adiciona:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code className="text-tinta">NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code className="break-all text-tinta">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (ou <code className="break-all">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>)
          </li>
        </ul>
        <p>Encontras os dois valores no Supabase, em Project Settings → API. Depois faz um novo deploy.</p>
      </NoticePage>
    );
  }

  if (result.status === "error") {
    return (
      <NoticePage title="Não foi possível abrir o convite">
        <p>A ligação à base de dados falhou. Tenta novamente daqui a pouco.</p>
        <p className="text-sm">Detalhe técnico: {result.message}</p>
      </NoticePage>
    );
  }

  if (result.status === "empty") {
    return (
      <NoticePage title="O convite está a ser preparado" action={{ href: "/painel", label: "Sou noivo/noiva: preparar o convite" }}>
        <p>Os noivos ainda estão a escrever o convite. Volta a abrir este link daqui a uns dias.</p>
      </NoticePage>
    );
  }

  const { wedding: w, gifts, story } = result.data;
  const places = placesOf(w);
  const cover = mediaUrl(w.cover_photo_path);

  return (
    <>
      <MusicToggle src={mediaUrl(w.music_path)} />
      <Backdrop />

      <main className="relative mx-auto w-full max-w-[38rem] px-5 pb-24 sm:px-6">
        <Hero
          partnerOneName={w.partner_one_name}
          partnerTwoName={w.partner_two_name}
          startsAt={w.starts_at}
          timeZone={w.time_zone}
          venueName={w.venue_name}
          welcomeMessage={w.welcome_message}
          coverPhoto={cover ? { src: cover, alt: `${w.partner_one_name} e ${w.partner_two_name}` } : null}
        />

        <div className="border-l-[1.5px] border-vinho pt-10 pb-24 pl-7">
          <InvitationCard
            partnerOneName={w.partner_one_name}
            partnerTwoName={w.partner_two_name}
            parents={{ partnerOne: w.partner_one_parents, partnerTwo: w.partner_two_parents }}
            timeZone={w.time_zone}
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

        <Invitation
          weddingId={w.id}
          timeZone={w.time_zone}
          rsvpDeadline={w.rsvp_deadline}
          maxCompanions={w.max_companions}
          places={places}
          story={story}
          gifts={gifts}
        />

        <footer className="mt-20 pl-7">
          <p className="font-display text-2xl">
            {w.partner_one_name} &amp; {w.partner_two_name}
          </p>
          <p className="mt-1 text-sm text-pedra">Com amor, à tua espera.</p>
        </footer>
      </main>
    </>
  );
}
