import { Backdrop } from "@/components/backdrop";
import { Hero } from "@/components/hero";
import { Invitation } from "@/components/invitation";
import { InvitationCard } from "@/components/invitation-card";
import { MusicToggle } from "@/components/music-toggle";
import { NoticePage } from "@/components/notice-page";
import { Ornament } from "@/components/ornament";
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

      <main className="relative w-full overflow-x-clip">
        <Hero
          partnerOneName={w.partner_one_name}
          partnerTwoName={w.partner_two_name}
          startsAt={w.starts_at}
          timeZone={w.time_zone}
          venueName={w.venue_name}
          coverPhoto={cover ? { src: cover, alt: `${w.partner_one_name} e ${w.partner_two_name}` } : null}
        />

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <section id="convite" aria-label="Convite" className="scroll-mt-10 pt-10 pb-8">
            <InvitationCard
              partnerOneName={w.partner_one_name}
              partnerTwoName={w.partner_two_name}
              parents={{ partnerOne: w.partner_one_parents, partnerTwo: w.partner_two_parents }}
              timeZone={w.time_zone}
              welcomeMessage={w.welcome_message}
              verse={w.verse_text ? { text: w.verse_text, reference: w.verse_reference } : null}
              events={places.map((p) => ({ label: p.label, place: p.name, startsAt: p.startsAt }))}
            />
          </section>

          <Invitation
            weddingId={w.id}
            coupleNames={`${w.partner_one_name} & ${w.partner_two_name}`}
            timeZone={w.time_zone}
            rsvpDeadline={w.rsvp_deadline}
            maxChildAge={w.max_child_age}
            places={places}
            story={story}
            gifts={gifts}
          />

          <footer className="pt-8 pb-28 text-center">
            <Ornament className="text-dourado" />
            <p className="mt-8 font-display text-[clamp(2rem,6vw,3rem)] leading-tight">
              {w.partner_one_name} <span className="brilho inline-block">&amp;</span> {w.partner_two_name}
            </p>
            <p className="mt-2 text-sm tracking-[0.2em] text-pedra uppercase">Com amor, à tua espera</p>
          </footer>
        </div>
      </main>
    </>
  );
}
