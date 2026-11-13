"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonLink, buttonPrimary, field } from "../ui";

function message(text: string) {
  if (/Invalid login credentials/i.test(text)) return "Email ou palavra-passe errados.";
  if (/Email not confirmed/i.test(text)) return "Ainda não confirmaste o email. Abre o link que te enviámos.";
  if (/already registered/i.test(text)) return "Já existe uma conta com este email. Entra com a tua palavra-passe.";
  if (/Password should be at least/i.test(text)) return "A palavra-passe tem de ter pelo menos 8 caracteres.";
  return "Não foi possível continuar. Tenta outra vez.";
}

/** Entrar ou criar conta (email e palavra-passe). */
export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(message(error.message));
      router.push("/painel");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/painel` },
      });
      setBusy(false);
      if (error) return setError(message(error.message));
      if (data.session) {
        router.push("/painel");
        router.refresh();
      } else setSent(true);
    }
  }

  if (sent) {
    return (
      <p role="status" className="mt-8 rounded-md bg-linho px-4 py-4">
        Enviámos um email para <strong>{email}</strong>. Abre o link para confirmar a conta e voltar ao painel.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input id="email" type="email" autoComplete="email" required className={`mt-2 ${field}`} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="block font-medium">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          className={`mt-2 ${field}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-vinho">
          {error}
        </p>
      )}
      <button type="submit" className={`${buttonPrimary} w-full`} disabled={busy}>
        {busy ? "Aguarda…" : mode === "entrar" ? "Entrar" : "Criar conta"}
      </button>
      <p className="text-center text-sm text-pedra">
        {mode === "entrar" ? "Ainda não tens conta? " : "Já tens conta? "}
        <button type="button" className={buttonLink} onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}>
          {mode === "entrar" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </form>
  );
}
