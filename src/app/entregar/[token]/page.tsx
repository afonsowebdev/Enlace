import { NoticePage } from "@/components/notice-page";
import { HandoverClaim } from "@/components/painel/handover-claim";
import { supabaseConfig } from "@/lib/env";

export const metadata = { title: "O vosso painel — Enlace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Link de entrega: os noivos criam a sua conta e recebem o casamento. */
export default async function EntregarPage({ params }: { params: Promise<{ token: string }> }) {
  if (!supabaseConfig()) {
    return (
      <NoticePage title="Falta ligar ao Supabase">
        <p>Configura as variáveis de ambiente do Supabase antes de usar este link.</p>
      </NoticePage>
    );
  }
  const { token } = await params;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-12">
      <p className="mb-6 text-center font-display text-xl tracking-wide text-dourado">Enlace</p>
      <HandoverClaim token={token} />
    </main>
  );
}
