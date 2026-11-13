"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MUST_CHANGE_CREDENTIALS } from "@/lib/handover";
import { createClient } from "@/lib/supabase/client";
import { Bloom } from "../backdrop";
import { Ornament } from "../ornament";
import { buttonPrimary, field } from "../ui";
import { SignOutButton } from "./sign-out-button";

const ease = [0.22, 1, 0.36, 1] as const;

function message(error: { message?: string; code?: string }) {
  const m = error.message ?? "";
  if (error.code === "email_exists" || /already been registered|already registered/i.test(m))
    return "Já existe uma conta com este email. Escolham outro.";
  if (error.code === "same_password" || /different from the old password/i.test(m))
    return "A nova palavra-passe tem de ser diferente da que receberam.";
  if (error.code === "weak_password" || /Password should/i.test(m)) return "A palavra-passe tem de ter pelo menos 8 caracteres.";
  if (error.code === "email_address_invalid" || /invalid/i.test(m)) return "Este email não parece válido.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Sem ligação à internet. Verifiquem a rede e tentem outra vez.";
  return "Não foi possível guardar. Tentem outra vez.";
}

const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? full;

/**
 * Primeiro acesso dos noivos a uma conta preparada por Francisco Afonso:
 * escolhem o seu email e palavra-passe e recebem as boas-vindas.
 */
export function FirstAccess({ currentEmail, partnerOneName, partnerTwoName }: { currentEmail: string; partnerOneName?: string; partnerTwoName?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ pendingEmail: string | null } | null>(null);

  const names = partnerOneName && partnerTwoName ? `${firstName(partnerOneName)} e ${firstName(partnerTwoName)}` : null;
  const sameEmail = email.trim().toLowerCase() === currentEmail.toLowerCase();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (sameEmail) return setError("Escolham um email diferente do que receberam.");
    setBusy(true);
    setError(null);
    const { data, error } = await createClient().auth.updateUser({
      email: email.trim(),
      password,
      data: { [MUST_CHANGE_CREDENTIALS]: null },
    });
    setBusy(false);
    if (error) return setError(message(error));
    // Se o Supabase exigir confirmação do email novo, a troca fica pendente.
    const pendingEmail = data.user?.new_email ?? null;
    setDone({ pendingEmail });
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="relative w-full max-w-xl">
        {done ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            aria-live="polite"
            className="relative overflow-hidden rounded-[1.75rem] border border-dourado/40 bg-papel px-7 py-12 text-center shadow-[0_40px_80px_-40px_rgba(70,40,20,0.45)] sm:px-12"
          >
            <Bloom className="mx-auto w-20" delay={0.2} />
            <p className="mt-6 text-xs font-medium tracking-[0.36em] text-dourado uppercase">Tudo pronto</p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,8vw,3.2rem)] leading-tight text-vinho">
              {names ? `Bem-vindos, ${names}!` : "Bem-vindos!"}
            </h1>
            <div className="mx-auto mt-6 max-w-[46ch] space-y-4 text-[1.02rem] leading-relaxed text-tinta/85">
              <p>
                Muitos parabéns pelo vosso casamento e obrigado, de coração, por terem escolhido o meu trabalho para fazer parte deste momento
                tão especial.
              </p>
              <p>
                Preparei este convite com todo o cuidado, para que cada convidado sinta o carinho com que o esperam. A partir de agora, o painel
                é vosso: podem editar o convite e acompanhar as respostas, a lista de presentes e as memórias do grande dia.
              </p>
              <p>Desejo-vos um dia inesquecível e uma vida inteira cheia de amor.</p>
            </div>
            <Ornament className="mt-8 text-dourado" />
            <p className="mt-6 text-sm text-pedra">Assinado,</p>
            <p className="mt-1 font-display text-3xl text-vinho">Francisco Afonso</p>

            {done.pendingEmail && (
              <p role="status" className="mx-auto mt-8 max-w-[46ch] rounded-md bg-linho px-4 py-3 text-sm">
                A palavra-passe já foi trocada. Para concluir a troca do email, abram o link que enviámos para <strong>{done.pendingEmail}</strong>.
              </p>
            )}

            <button
              type="button"
              className={`mt-10 ${buttonPrimary}`}
              onClick={() => {
                router.push("/painel");
                router.refresh();
              }}
            >
              Entrar no painel
            </button>
          </motion.section>
        ) : (
          <motion.form
            onSubmit={save}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="rounded-[1.75rem] border border-nevoa bg-papel px-7 py-10 sm:px-12"
          >
            <p className="text-xs font-medium tracking-[0.36em] text-dourado uppercase">Primeiro acesso</p>
            <h1 className="mt-3 font-display text-[2.2rem] leading-tight">Escolham o vosso acesso</h1>
            <p className="mt-3 text-pedra">
              Esta conta foi preparada para vocês. Para que só vocês possam entrar no painel, troquem agora o email e a palavra-passe que
              receberam. Depois disto, a conta antiga deixa de funcionar.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="novo-email" className="block font-medium">
                  O vosso email
                </label>
                <input
                  id="novo-email"
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
                <label htmlFor="nova-pass" className="block font-medium">
                  Nova palavra-passe
                </label>
                <p className="mt-0.5 text-xs text-pedra">Pelo menos 8 caracteres.</p>
                <div className="relative mt-2">
                  <input
                    id="nova-pass"
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

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button type="submit" disabled={busy || !email.trim() || password.length < 8} className={buttonPrimary}>
                {busy ? "A guardar…" : "Guardar e continuar"}
              </button>
              <SignOutButton />
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
