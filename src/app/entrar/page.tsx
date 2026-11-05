import { NoticePage } from "@/components/notice-page";
import { SignInForm } from "@/components/painel/sign-in-form";
import { supabaseConfig } from "@/lib/env";

export const metadata = { title: "Entrar — Enlace" };
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (!supabaseConfig()) {
    return (
      <NoticePage title="Falta ligar ao Supabase">
        <p>Configura as variáveis de ambiente do Supabase antes de entrar no painel.</p>
      </NoticePage>
    );
  }
  const { erro } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center px-6 py-16">
      <p className="font-display text-xl tracking-wide text-dourado">Enlace</p>
      <h1 className="mt-4 font-display text-[2.4rem] leading-tight">Painel dos noivos</h1>
      <p className="mt-3 text-pedra">Entra para preparar o convite, os presentes e ver as respostas.</p>
      {erro === "link" && (
        <p role="alert" className="mt-6 rounded-md bg-linho px-4 py-3 text-sm">
          O link de confirmação expirou ou já foi usado. Entra com o teu email e palavra-passe.
        </p>
      )}
      <SignInForm />
    </main>
  );
}
