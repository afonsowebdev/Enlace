"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Child } from "@/lib/types";
import { Bloom, Sprig } from "./backdrop";
import { Paper } from "./paper";
import { buttonLink } from "./ui";

export type GuestResponse = {
  name: string;
  attending: boolean;
  /** Nome da esposa ou do esposo, quando vem em casal. */
  partnerName: string | null;
  children: Child[];
  message: string;
};

type RsvpProps = {
  /** Idade máxima das crianças; null = não são aceites crianças. */
  maxChildAge: number | null;
  deadline: string | null;
  response: GuestResponse | null;
  /** Grava a resposta; devolve uma mensagem de erro ou null. */
  onRespond: (response: GuestResponse) => Promise<string | null>;
};

const ease = [0.22, 1, 0.36, 1] as const;

const eyebrow = "text-[0.7rem] font-medium tracking-[0.32em] text-dourado uppercase";

/**
 * O cartão de resposta, como o que vem dentro de um convite impresso:
 * nome numa linha, duas escolhas grandes, se vem em casal, as crianças e uma
 * mensagem em papel pautado.
 */
export function Rsvp({ maxChildAge, deadline, response, onRespond }: RsvpProps) {
  const [editing, setEditing] = useState(response === null);
  const [name, setName] = useState(response?.name ?? "");
  const [attending, setAttending] = useState<boolean | null>(response?.attending ?? null);
  const [asCouple, setAsCouple] = useState<boolean | null>(response ? Boolean(response.partnerName) : null);
  const [partnerName, setPartnerName] = useState(response?.partnerName ?? "");
  const [children, setChildren] = useState<ChildDraft[]>(
    (response?.children ?? []).map((c) => ({ name: c.name, age: String(c.age) })),
  );
  const [message, setMessage] = useState(response?.message ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlineText = deadline
    ? new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long" }).format(new Date(`${deadline}T12:00:00Z`))
    : null;
  const missing =
    name.trim().length < 2
      ? "Escreve o teu nome para continuar."
      : attending === null
        ? "Escolhe se vens ou não."
        : !attending
          ? null
          : asCouple === null
            ? "Diz-nos se vens sozinho ou em casal."
            : asCouple && partnerName.trim().length < 2
              ? "Escreve o nome da tua esposa ou do teu esposo."
              : children.some((c) => !c.name.trim() || c.age === "")
                ? "Indica o nome e a idade de cada criança."
                : null;
  const canSend = missing === null && !saving;

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
                  partnerName: attending && asCouple ? partnerName.trim() : null,
                  children: attending ? children.map((c) => ({ name: c.name.trim(), age: Number(c.age) })) : [],
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
                {attending && (
                  <motion.div
                    key="acompanhantes"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="overflow-hidden"
                  >
                    <Couple
                      asCouple={asCouple}
                      onChoose={setAsCouple}
                      partnerName={partnerName}
                      onPartnerName={setPartnerName}
                    />
                    {maxChildAge !== null && <Children list={children} maxAge={maxChildAge} onChange={setChildren} />}
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
              {missing && !saving && <p className="mt-3 text-xs text-pedra">{missing}</p>}
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
  group = "rsvp-vem",
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  icon: React.ReactNode;
  group?: string;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3 py-6 transition-all sm:px-5 duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vinho ${
        selected
          ? "border-vinho bg-cartao text-sobre-cartao shadow-[0_18px_36px_-20px_rgba(60,15,20,0.7)]"
          : "border-dourado/40 bg-papel/50 hover:-translate-y-0.5 hover:border-dourado"
      }`}
    >
      <input type="radio" name={group} className="sr-only" checked={selected} onChange={onSelect} />
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

type ChildDraft = { name: string; age: string };

const lineInput =
  "w-full border-0 border-b border-dourado/60 bg-transparent px-2 pt-2 pb-2 text-center text-lg text-tinta transition-colors placeholder:text-pedra/50 focus:border-vinho focus:outline-none";

/** Sozinho ou em casal; em casal, o nome da esposa ou do esposo. */
function Couple({
  asCouple,
  onChoose,
  partnerName,
  onPartnerName,
}: {
  asCouple: boolean | null;
  onChoose: (v: boolean) => void;
  partnerName: string;
  onPartnerName: (v: string) => void;
}) {
  return (
    <div className="pt-10">
      <fieldset>
        <legend className={`mx-auto ${eyebrow}`}>Vens sozinho ou em casal?</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Choice group="rsvp-casal" selected={asCouple === false} onSelect={() => onChoose(false)} title="Sozinho" hint="Só eu" icon={<PersonIcon />} />
          <Choice group="rsvp-casal" selected={asCouple === true} onSelect={() => onChoose(true)} title="Em casal" hint="Eu e o meu par" icon={<CoupleIcon />} />
        </div>
      </fieldset>
      <AnimatePresence initial={false}>
        {asCouple && (
          <motion.div
            key="conjuge"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden"
          >
            <div className="pt-8">
              <label htmlFor="rsvp-conjuge" className={eyebrow}>
                Nome da esposa ou do esposo
              </label>
              <input
                id="rsvp-conjuge"
                className={`mt-1 ${lineInput} sm:text-xl`}
                placeholder="Nome e apelido"
                value={partnerName}
                onChange={(e) => onPartnerName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ageLabel(age: number) {
  return age === 0 ? "Menos de 1 ano" : age === 1 ? "1 ano" : `${age} anos`;
}

/** As crianças que vêm, com nome e idade. Só até à idade que os noivos aceitam. */
function Children({ list, maxAge, onChange }: { list: ChildDraft[]; maxAge: number; onChange: (l: ChildDraft[]) => void }) {
  const update = (i: number, patch: Partial<ChildDraft>) => onChange(list.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className="pt-10">
      <p id="rsvp-criancas" className={eyebrow}>
        Trazes crianças?
      </p>
      <p className="mx-auto mt-3 max-w-[40ch] text-sm leading-relaxed text-pedra">
        Só podem vir crianças até aos <span className="font-medium text-tinta">{maxAge} {maxAge === 1 ? "ano" : "anos"}</span>, que ainda
        precisam do apoio dos pais. Por ser num restaurante, pedimos a compreensão de todos: crianças mais velhas não poderão estar presentes.
      </p>

      <ul className="mt-5 space-y-4" aria-labelledby="rsvp-criancas">
        <AnimatePresence initial={false}>
          {list.map((c, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="flex items-end gap-3"
            >
              <label className="sr-only" htmlFor={`crianca-nome-${i}`}>
                Nome da criança {i + 1}
              </label>
              <input
                id={`crianca-nome-${i}`}
                className={`${lineInput} text-left`}
                placeholder="Nome da criança"
                value={c.name}
                maxLength={60}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <label className="sr-only" htmlFor={`crianca-idade-${i}`}>
                Idade da criança {i + 1}
              </label>
              <select
                id={`crianca-idade-${i}`}
                className="shrink-0 rounded-full border border-dourado/60 bg-papel/60 px-3 py-2 text-sm text-tinta focus:border-vinho focus:outline-none"
                value={c.age}
                onChange={(e) => update(i, { age: e.target.value })}
              >
                <option value="">Idade</option>
                {Array.from({ length: maxAge + 1 }, (_, a) => (
                  <option key={a} value={a}>
                    {ageLabel(a)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                aria-label={`Retirar ${c.name.trim() || `criança ${i + 1}`}`}
                className="grid size-9 shrink-0 place-items-center rounded-full text-xl leading-none text-pedra transition-colors hover:bg-papel/70 hover:text-vinho"
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {list.length < 10 && (
        <button
          type="button"
          onClick={() => onChange([...list, { name: "", age: "" }])}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-dourado/60 px-5 py-2.5 text-sm font-medium text-vinho transition-colors hover:border-vinho hover:bg-papel/70"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          {list.length === 0 ? "Acrescentar criança" : "Acrescentar outra criança"}
        </button>
      )}
    </div>
  );
}

/** Depois de responder: agradecimento com uma rosa a abrir e o resumo da resposta. */
function Thanks({ response, onEdit }: { response: GuestResponse; onEdit: () => void }) {
  const firstName = response.name.split(/\s+/)[0];
  const kids = response.children.length;
  const total = 1 + (response.partnerName ? 1 : 0) + kids;
  const kidsText = kids === 0 ? "" : kids === 1 ? `${response.children[0].name}` : `${kids} crianças`;
  const withWhom = [response.partnerName, kidsText].filter(Boolean).join(" e com ");
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
          ? withWhom
            ? `Contamos contigo e com ${withWhom}. Vai ser um dia inesquecível.`
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

function CoupleIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <circle cx="11.5" cy="10" r="3.6" />
      <circle cx="20.5" cy="10" r="3.6" />
      <path d="M4.5 26c0-4.4 3.1-7.6 7-7.6 2 0 3.6.7 4.5 1.8.9-1.1 2.5-1.8 4.5-1.8 3.9 0 7 3.2 7 7.6" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <circle cx="16" cy="10" r="4" />
      <path d="M8 26c0-4.6 3.5-7.8 8-7.8s8 3.2 8 7.8" />
    </svg>
  );
}
