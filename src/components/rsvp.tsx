"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Bloom, Sprig } from "./backdrop";
import { Paper } from "./paper";
import { buttonLink } from "./ui";

export type GuestResponse = {
  name: string;
  attending: boolean;
  companions: number;
  message: string;
};

type RsvpProps = {
  maxCompanions: number;
  deadline: string | null;
  response: GuestResponse | null;
  /** Grava a resposta; devolve uma mensagem de erro ou null. */
  onRespond: (response: GuestResponse) => Promise<string | null>;
};

const ease = [0.22, 1, 0.36, 1] as const;

const eyebrow = "text-[0.7rem] font-medium tracking-[0.32em] text-dourado uppercase";

/**
 * O cartão de resposta, como o que vem dentro de um convite impresso:
 * nome numa linha, duas escolhas grandes, acompanhantes e uma mensagem em papel pautado.
 */
export function Rsvp({ maxCompanions, deadline, response, onRespond }: RsvpProps) {
  const [editing, setEditing] = useState(response === null);
  const [name, setName] = useState(response?.name ?? "");
  const [attending, setAttending] = useState<boolean | null>(response?.attending ?? null);
  const [companions, setCompanions] = useState(response?.companions ?? 0);
  const [message, setMessage] = useState(response?.message ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlineText = deadline
    ? new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long" }).format(new Date(`${deadline}T12:00:00Z`))
    : null;
  const canSend = name.trim().length >= 2 && attending !== null && !saving;

  return (
    <Paper className="mx-auto w-full max-w-2xl">
      <div aria-hidden="true" className="pointer-events-none absolute -top-8 -left-8 w-28 text-vinho opacity-20 sm:w-36">
        <Sprig variant={0} blossomColor="var(--dourado)" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -bottom-8 w-28 rotate-180 text-vinho opacity-20 sm:w-36">
        <Sprig variant={0} blossomColor="var(--dourado)" />
      </div>

      <div className="relative px-9 py-12 sm:px-16 sm:py-16">
        <AnimatePresence mode="wait" initial={false}>
          {response && !editing ? (
            <Thanks key="obrigado" response={response} onEdit={() => setEditing(true)} />
          ) : (
            <motion.form
              key="formulario"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease }}
              className="text-center"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSend) return;
                setSaving(true);
                setError(null);
                const problem = await onRespond({
                  name: name.trim(),
                  attending: attending!,
                  companions: attending ? companions : 0,
                  message: message.trim(),
                });
                setSaving(false);
                if (problem) setError(problem);
                else setEditing(false);
              }}
            >
              <p className={eyebrow}>Cartão de resposta</p>
              <p className="mt-4 font-display text-[clamp(2.4rem,9vw,3.4rem)] leading-none text-vinho">R.S.V.P.</p>
              <p className="mx-auto mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-pedra">
                {deadlineText ? (
                  <>
                    Pedimos que nos respondas até <span className="font-medium whitespace-nowrap text-tinta">{deadlineText}</span>.
                  </>
                ) : (
                  "Pedimos que nos digas se contamos contigo."
                )}
              </p>

              {/* nome escrito numa linha, como à mão */}
              <div className="mt-10">
                <label htmlFor="rsvp-nome" className={eyebrow}>
                  O teu nome
                </label>
                <input
                  id="rsvp-nome"
                  className="mt-1 w-full border-0 border-b border-dourado/60 bg-transparent px-2 pt-2 pb-2.5 text-center text-xl text-tinta transition-colors placeholder:text-pedra/50 focus:border-vinho focus:outline-none sm:text-2xl"
                  autoComplete="name"
                  placeholder="Nome e apelido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <fieldset className="mt-10">
                <legend className={`mx-auto ${eyebrow}`}>Vens ao casamento?</legend>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Choice
                    selected={attending === true}
                    onSelect={() => setAttending(true)}
                    title="Sim, vou"
                    hint="Lá estarei"
                    icon={<HeartIcon />}
                  />
                  <Choice
                    selected={attending === false}
                    onSelect={() => setAttending(false)}
                    title="Não posso"
                    hint="Infelizmente"
                    icon={<EnvelopeIcon />}
                  />
                </div>
              </fieldset>

              <AnimatePresence initial={false}>
                {attending && maxCompanions > 0 && (
                  <motion.div
                    key="acompanhantes"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="overflow-hidden"
                  >
                    <Companions value={companions} max={maxCompanions} onChange={setCompanions} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {attending !== null && (
                  <motion.div
                    key="mensagem"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="overflow-hidden"
                  >
                    <div className="pt-10">
                      <label htmlFor="rsvp-msg" className={eyebrow}>
                        Mensagem aos noivos <span className="tracking-normal normal-case text-pedra">(opcional)</span>
                      </label>
                      <textarea
                        id="rsvp-msg"
                        rows={3}
                        maxLength={1000}
                        placeholder={attending ? "Mal podemos esperar…" : "Desejo-vos um dia maravilhoso…"}
                        className="mt-3 block w-full resize-none border-0 bg-transparent px-2 text-left text-[1.05rem] leading-8 text-tinta placeholder:text-pedra/50 focus:outline-none"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(to bottom, transparent 0, transparent calc(2rem - 1px), color-mix(in srgb, var(--dourado) 45%, transparent) calc(2rem - 1px), color-mix(in srgb, var(--dourado) 45%, transparent) 2rem)",
                          backgroundAttachment: "local",
                        }}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={!canSend}
                className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-cartao px-8 py-4 text-sm font-medium tracking-[0.2em] text-sobre-cartao uppercase shadow-[0_14px_34px_-14px_rgba(60,15,20,0.6)] transition-[transform,opacity] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto sm:min-w-64"
              >
                {saving ? "A enviar…" : "Enviar resposta"}
              </button>
              {!canSend && !saving && (
                <p className="mt-3 text-xs text-pedra">
                  {name.trim().length < 2 ? "Escreve o teu nome para continuar." : "Escolhe se vens ou não."}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-4 text-sm font-medium text-vinho">
                  {error}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Paper>
  );
}

/** Uma das duas respostas: um cartão grande com ícone, que fica vinho quando escolhido. */
function Choice({
  selected,
  onSelect,
  title,
  hint,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3 py-6 transition-all sm:px-5 duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vinho ${
        selected
          ? "border-vinho bg-cartao text-sobre-cartao shadow-[0_18px_36px_-20px_rgba(60,15,20,0.7)]"
          : "border-dourado/40 bg-papel/50 hover:-translate-y-0.5 hover:border-dourado"
      }`}
    >
      <input type="radio" name="rsvp-vem" className="sr-only" checked={selected} onChange={onSelect} />
      <span className={`size-8 transition-colors ${selected ? "text-dourado" : "text-vinho/70 group-hover:text-vinho"}`}>{icon}</span>
      <span className="font-display text-[1.15rem] leading-tight whitespace-nowrap sm:text-[1.45rem]">{title}</span>
      <span className={`text-xs sm:text-sm ${selected ? "text-sobre-cartao/75" : "text-pedra"}`}>{hint}</span>
      {selected && (
        <motion.span
          aria-hidden="true"
          className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-dourado text-cartao"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </motion.span>
      )}
    </label>
  );
}

/** Quantos vêm com o convidado: botões redondos e uma fila de pessoas. */
function Companions({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  const round =
    "grid size-12 place-items-center rounded-full border border-dourado/60 text-2xl leading-none text-vinho transition-colors hover:border-vinho hover:bg-papel/70 disabled:border-dourado/20 disabled:text-dourado/30 disabled:hover:bg-transparent";
  return (
    <div className="pt-10">
      <p id="rsvp-acomp" className={eyebrow}>
        Quem vem contigo?
      </p>
      <p className="mt-2 text-sm text-pedra">
        Podes trazer até {max} {max === 1 ? "acompanhante" : "acompanhantes"}.
      </p>
      <div className="mt-5 flex items-center justify-center gap-6" role="group" aria-labelledby="rsvp-acomp">
        <button type="button" className={round} onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label="Menos uma pessoa">
          −
        </button>
        <output aria-live="polite" className="w-14 font-display text-[2.6rem] leading-none text-vinho tabular-nums">
          {value}
        </output>
        <button type="button" className={round} onClick={() => onChange(Math.min(max, value + 1))} disabled={value === max} aria-label="Mais uma pessoa">
          +
        </button>
      </div>
      <div aria-hidden="true" className="mt-5 flex items-end justify-center gap-1.5">
        {Array.from({ length: max + 1 }, (_, i) => (
          <span
            key={i}
            className={`transition-all duration-300 ${i <= value ? "text-vinho" : "text-dourado/25"} ${i === 0 ? "size-7" : "size-6"}`}
          >
            <PersonIcon />
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm text-pedra">
        {value === 0 ? "Só tu" : `Tu e mais ${value} — ${value + 1} pessoas`}
      </p>
    </div>
  );
}

/** Depois de responder: agradecimento com uma rosa a abrir e o resumo da resposta. */
function Thanks({ response, onEdit }: { response: GuestResponse; onEdit: () => void }) {
  const firstName = response.name.split(/\s+/)[0];
  const total = response.companions + 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease }}
      aria-live="polite"
      className="text-center"
    >
      <Bloom className="mx-auto w-20" delay={0.15} />
      <p className={`mt-6 ${eyebrow}`}>Resposta recebida</p>
      <p className="mt-4 font-display text-[clamp(2.2rem,8vw,3.2rem)] leading-tight text-vinho">Obrigado, {firstName}!</p>
      <p className="mx-auto mt-4 max-w-[36ch] text-[1.05rem] leading-relaxed">
        {response.attending
          ? total > 1
            ? `Contamos contigo e com mais ${response.companions} ${response.companions === 1 ? "pessoa" : "pessoas"}. Vai ser um dia inesquecível.`
            : "Contamos contigo. Vai ser um dia inesquecível."
          : "Obrigado por avisares. Vamos sentir a tua falta."}
      </p>

      <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 divide-x divide-dourado/40 border-y border-dourado/40 py-4">
        <div>
          <dt className={eyebrow}>Resposta</dt>
          <dd className="mt-1.5 font-medium">{response.attending ? "Vou" : "Não vou"}</dd>
        </div>
        <div>
          <dt className={eyebrow}>Pessoas</dt>
          <dd className="mt-1.5 font-medium tabular-nums">{response.attending ? total : 0}</dd>
        </div>
      </dl>

      {response.message && (
        <blockquote className="mx-auto mt-8 max-w-[40ch] text-pedra italic">“{response.message}”</blockquote>
      )}

      <button type="button" className={`mt-8 text-sm ${buttonLink}`} onClick={onEdit}>
        Alterar resposta
      </button>
    </motion.div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M16 27s-10-6.2-10-13.4A5.6 5.6 0 0 1 16 10a5.6 5.6 0 0 1 10 3.6C26 20.8 16 27 16 27z" />
      <path d="M11 13.5a2.6 2.6 0 0 1 2.4-2" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <rect x="5" y="8.5" width="22" height="15" rx="2" />
      <path d="M5.5 9.5 16 17.5l10.5-8" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z" />
    </svg>
  );
}
