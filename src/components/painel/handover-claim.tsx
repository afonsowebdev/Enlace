"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonPrimary, field } from "../ui";
import { WelcomeCard } from "./welcome-card";

function message(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  if (/handover_invalid/.test(m)) return "Este link já foi usado, foi cancelado ou expirou. Peçam um link novo a Francisco Afonso.";
  if (/already_host/.test(m)) return "Este email já gere outro casamento. Usem outro email.";
  if (/Invalid login credentials/i.test(m)) return "Já existe uma conta com este email, mas a palavra-passe não coincide.";
  if (error?.code === "weak_password" || /Password should/i.test(m)) return "A palavra-passe tem de ter pelo menos 8 caracteres.";
  if (error?.code === "email_address_invalid" || /invalid.*email|email.*invalid/i.test(m)) return "Este email não parece válido.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Sem ligação à internet. Verifiquem a rede e tentem outra vez.";
  return "Não foi possível concluir. Tentem outra vez.";
}

type Names = { partner_one_name: string; partner_two_name: string };

/**
 * Os noivos recebem o painel: escolhem o email e a palavra-passe, a conta é
 * criada e o casamento passa para eles. No fim, as boas-vindas.
 */
export function HandoverClaim({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [done, setDone] = useState<Names | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const fail = (err: { message?: string; code?: string } | null) => {
      setBusy(false);
      setError(message(err));
    };

    // Sai de qualquer sessão deste browser (de quem preparou o convite ou de um convidado).
    await supabase.auth.signOut();

    const creds = { email: email.trim(), password };
    const signUp = await supabase.auth.signUp(creds);
    let session = signUp.data.session;
    if (signUp.error) {
      if (!/already registered|already exists/i.test(signUp.error.message) && signUp.error.code !== "user_already_exists")
        return fail(signUp.error);
      // A conta já existe: entra com ela.
      const signIn = await supabase.auth.signInWithPassword(creds);
      if (signIn.error) return fail(signIn.error);
      session = signIn.data.session;
    }
    if (!session) {
      // O Supabase está a pedir confirmação do email.
      setBusy(false);
      setPendingEmail(creds.email);
      return;
    }

    const { data: weddingId, error: claimError } = await supabase.rpc("claim_wedding_handover", { p_token: token });
    if (claimError) return fail(claimError);

    const { data: names } = await supabase
      .from("weddings")
      .select("partner_one_name, partner_two_name")
      .eq("id", weddingId as number)
      .maybeSingle<Names>();
    setBusy(false);
    setDone(names ?? { partner_one_name: "", partner_two_name: "" });
  }

  if (done) {
    return (
      <WelcomeCard
        partnerOneName={done.partner_one_name || undefined}
        partnerTwoName={done.partner_two_name || undefined}
        onContinue={() => {
          router.push("/painel");
          router.refresh();
        }}
      />
    );
  }

  if (pendingEmail) {
    return (
      <section role="status" className="rounded-[1.75rem] border border-nevoa bg-papel px-7 py-10 sm:px-12">
        <h1 className="font-display text-[2rem] leading-tight">Confirmem o email</h1>
        <p className="mt-3 text-pedra">
          Enviámos um email para <strong className="text-tinta">{pendingEmail}</strong>. Abram o link para confirmar a conta e depois voltem a
          abrir este link de entrega para concluir.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-nevoa bg-papel px-7 py-10 sm:px-12">
      <p className="text-xs font-medium tracking-[0.36em] text-dourado uppercase">O vosso painel</p>
      <h1 className="mt-3 font-display text-[2.2rem] leading-tight">Escolham o vosso acesso</h1>
      <p className="mt-3 text-pedra">
        O vosso convite está pronto. Escolham o email e a palavra-passe com que vão entrar no painel: a partir daqui, só vocês terão acesso.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="entrega-email" className="block font-medium">
            O vosso email
          </label>
          <input
            id="entrega-email"
            type="email"
            autoComplete="email"
            required
            className={`mt-2 ${field}`}
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="entrega-pass" className="block font-medium">
            Palavra-passe
          </label>
          <p className="mt-0.5 text-xs text-pedra">Pelo menos 8 caracteres.</p>
          <div className="relative mt-2">
            <input
              id="entrega-pass"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              className={`${field} pr-24`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              className="absolute inset-y-0 right-2 my-auto h-9 rounded-full px-3 text-sm font-medium text-vinho hover:bg-linho"
            >
              {show ? "Esconder" : "Mostrar"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm font-medium text-vinho">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy || !email.trim() || password.length < 8} className={`mt-8 w-full sm:w-auto ${buttonPrimary}`}>
        {busy ? "A preparar o vosso painel…" : "Receber o painel"}
      </button>
    </form>
  );
}
