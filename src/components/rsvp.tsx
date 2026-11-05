"use client";

import { useState } from "react";
import { buttonLink, buttonPrimary, field } from "./ui";

export type GuestResponse = {
  name: string;
  attending: boolean;
  companions: number;
  message: string;
};

type RsvpProps = {
  maxCompanions: number;
  deadline: string;
  response: GuestResponse | null;
  onRespond: (response: GuestResponse) => void;
};

export function Rsvp({ maxCompanions, deadline, response, onRespond }: RsvpProps) {
  const [editing, setEditing] = useState(response === null);
  const [name, setName] = useState(response?.name ?? "");
  const [attending, setAttending] = useState<boolean | null>(response?.attending ?? null);
  const [companions, setCompanions] = useState(response?.companions ?? 0);
  const [message, setMessage] = useState(response?.message ?? "");

  const deadlineText = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long" }).format(
    new Date(`${deadline}T12:00:00Z`),
  );
  const canSend = name.trim().length >= 2 && attending !== null;

  if (response && !editing) {
    const people = response.companions;
    return (
      <div aria-live="polite">
        <p className="text-lg">
          {response.attending
            ? `Obrigado, ${response.name}. Contamos contigo${people > 0 ? ` e com mais ${people} ${people === 1 ? "pessoa" : "pessoas"}` : ""}.`
            : `Obrigado por avisares, ${response.name}. Vamos sentir a tua falta.`}
        </p>
        <button type="button" className={`mt-4 ${buttonLink}`} onClick={() => setEditing(true)}>
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onRespond({ name: name.trim(), attending: attending!, companions: attending ? companions : 0, message: message.trim() });
        setEditing(false);
      }}
    >
      <div>
        <label htmlFor="rsvp-nome" className="block font-medium">
          O teu nome
        </label>
        <input
          id="rsvp-nome"
          className={`mt-2 ${field}`}
          autoComplete="name"
          placeholder="Nome e apelido"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <fieldset>
        <legend className="font-medium">Vens ao casamento?</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: "Vou" },
            { value: false, label: "Não posso ir" },
          ].map((opt) => {
            const selected = attending === opt.value;
            return (
              <label
                key={opt.label}
                className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-3 text-center font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vinho ${
                  selected ? "border-vinho bg-linho text-vinho" : "border-nevoa hover:border-pedra"
                }`}
              >
                <input
                  type="radio"
                  name="rsvp-vem"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setAttending(opt.value)}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {attending && maxCompanions > 0 && (
        <div>
          <p id="rsvp-acomp" className="font-medium">
            Quantas pessoas vêm contigo?
          </p>
          <p className="mt-1 text-sm text-pedra">
            Podes trazer até {maxCompanions} {maxCompanions === 1 ? "acompanhante" : "acompanhantes"}.
          </p>
          <div className="mt-3 inline-flex items-center rounded-full border border-nevoa" role="group" aria-labelledby="rsvp-acomp">
            <button
              type="button"
              className="size-11 rounded-full text-xl text-vinho disabled:text-nevoa"
              onClick={() => setCompanions((c) => Math.max(0, c - 1))}
              disabled={companions === 0}
              aria-label="Menos uma pessoa"
            >
              −
            </button>
            <output className="w-10 text-center text-lg tabular-nums" aria-live="polite">
              {companions}
            </output>
            <button
              type="button"
              className="size-11 rounded-full text-xl text-vinho disabled:text-nevoa"
              onClick={() => setCompanions((c) => Math.min(maxCompanions, c + 1))}
              disabled={companions === maxCompanions}
              aria-label="Mais uma pessoa"
            >
              +
            </button>
          </div>
        </div>
      )}

      {attending !== null && (
        <div>
          <label htmlFor="rsvp-msg" className="block font-medium">
            Mensagem para os noivos <span className="font-normal text-pedra">(opcional)</span>
          </label>
          <textarea
            id="rsvp-msg"
            rows={3}
            maxLength={1000}
            className={`mt-2 resize-y ${field}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className={buttonPrimary} disabled={!canSend}>
          Enviar resposta
        </button>
        <p className="text-sm text-pedra">Responde até {deadlineText}.</p>
      </div>
    </form>
  );
}
