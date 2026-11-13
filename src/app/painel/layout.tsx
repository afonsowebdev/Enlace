import Link from "next/link";
import { NoticePage } from "@/components/notice-page";
import { CreateWedding } from "@/components/painel/create-wedding";
import { FirstAccess } from "@/components/painel/first-access";
import { MUST_CHANGE_CREDENTIALS } from "@/lib/handover";
import { PainelNav } from "@/components/painel/painel-nav";
import { SignOutButton } from "@/components/painel/sign-out-button";
import { supabaseConfig } from "@/lib/env";
import { requireHost } from "@/lib/host";

export const metadata = { title: "Painel — Enlace" };
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfig()) {
    return (
      <NoticePage title="Falta ligar ao Supabase">
        <p>Configura as variáveis de ambiente do Supabase para usar o painel.</p>
      </NoticePage>
    );
  }
  const { user, wedding } = await requireHost();

  // Conta preparada por Francisco Afonso: os noivos trocam o email e a palavra-passe antes de tudo.
  if (user.user_metadata?.[MUST_CHANGE_CREDENTIALS]) {
    return <FirstAccess currentEmail={user.email ?? ""} partnerOneName={wedding?.partner_one_name} partnerTwoName={wedding?.partner_two_name} />;
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-nevoa bg-papel/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-display text-lg tracking-wide text-dourado">Enlace</p>
            <p className="text-sm text-pedra">
              {wedding ? `${wedding.partner_one_name} & ${wedding.partner_two_name}` : user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {wedding && (
              <Link href="/" target="_blank" className="rounded-full border border-nevoa px-4 py-2 text-sm font-medium hover:border-vinho hover:text-vinho">
                Ver convite
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
        {wedding && <PainelNav />}
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-10">{wedding ? children : <CreateWedding />}</main>
    </div>
  );
}
