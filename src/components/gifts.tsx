"use client";

import { useState } from "react";
import type { DemoGift } from "@/lib/demo-data";
import { formatEuros, formatIban, formatPhone } from "@/lib/format";
import { buttonLink, buttonPrimary, buttonQuiet, field, goToRsvp, Thread } from "./ui";

type PaymentDetails = { holderName: string; iban: string | null; mbwayPhone: string | null };

type GiftsProps = {
  gifts: DemoGift[];
  payment: PaymentDetails;
  guestName: string | null;
};

export function Gifts({ gifts: initial, payment, guestName }: GiftsProps) {
  const [gifts, setGifts] = useState(initial);
  const [mine, setMine] = useState<Set<number>>(new Set());
  const [myContributions, setMyContributions] = useState<Record<number, number>>({});
  const [openId, setOpenId] = useState<number | null>(null);

  const registered = guestName !== null;

  function toggleReserve(gift: DemoGift) {
    const reserving = !mine.has(gift.id);
    setMine((prev) => {
      const next = new Set(prev);
      if (reserving) next.add(gift.id);
      else next.delete(gift.id);
      return next;
    });
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, isReserved: reserving } : g)));
  }

  function contribute(gift: DemoGift, cents: number) {
    setMyContributions((prev) => ({ ...prev, [gift.id]: (prev[gift.id] ?? 0) + cents }));
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, contributedCents: g.contributedCents + cents } : g)));
    setOpenId(null);
  }

  return (
    <div>
      {!registered && (
        <p className="mb-8 rounded-md bg-linho px-4 py-3 text-sm">
          Para reservar um presente ou contribuir, <a href="#resposta" className={buttonLink}>responde primeiro ao convite</a>.
        </p>
      )}

      <ul className="divide-y divide-nevoa border-y border-nevoa">
        {gifts.map((gift) => (
          <li key={gift.id} className="py-6">
            {gift.kind === "item" ? (
              <ItemRow
                gift={gift}
                isMine={mine.has(gift.id)}
                registered={registered}
                onToggle={() => toggleReserve(gift)}
              />
            ) : (
              <MoneyRow
                gift={gift}
                myTotal={myContributions[gift.id] ?? 0}
                registered={registered}
                open={openId === gift.id}
                onOpen={() => setOpenId(openId === gift.id ? null : gift.id)}
                payment={payment}
                onContribute={(cents) => contribute(gift, cents)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GiftText({ gift }: { gift: DemoGift }) {
  return (
    <div className="min-w-0">
      <h3 className="text-lg leading-snug">{gift.name}</h3>
      <p className="mt-1 text-pedra">{gift.description}</p>
    </div>
  );
}

function ItemRow({
  gift,
  isMine,
  registered,
  onToggle,
}: {
  gift: DemoGift;
  isMine: boolean;
  registered: boolean;
  onToggle: () => void;
}) {
  const takenByOther = gift.isReserved && !isMine;
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${takenByOther ? "opacity-55" : ""}`}>
      <GiftText gift={gift} />
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        {gift.priceCents !== null && <p className="tabular-nums">{formatEuros(gift.priceCents)}</p>}
        {takenByOther ? (
          <p className="text-sm text-pedra">Já reservado</p>
        ) : isMine ? (
          <div className="flex items-center gap-3" aria-live="polite">
            <p className="text-sm font-medium text-vinho">Reservado por ti</p>
            <button type="button" className={`text-sm ${buttonLink}`} onClick={onToggle}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className={`text-sm ${buttonQuiet}`} onClick={registered ? onToggle : goToRsvp}>
            Reservar
          </button>
        )}
      </div>
    </div>
  );
}

function MoneyRow({
  gift,
  myTotal,
  registered,
  open,
  onOpen,
  payment,
  onContribute,
}: {
  gift: DemoGift;
  myTotal: number;
  registered: boolean;
  open: boolean;
  onOpen: () => void;
  payment: PaymentDetails;
  onContribute: (cents: number) => void;
}) {
  const goal = gift.priceCents;
  const reached = goal !== null && gift.contributedCents >= goal;
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <GiftText gift={gift} />
        <button
          type="button"
          className={`shrink-0 self-start text-sm ${buttonQuiet}`}
          onClick={registered ? onOpen : goToRsvp}
          aria-expanded={registered ? open : undefined}
        >
          {open ? "Fechar" : "Contribuir"}
        </button>
      </div>

      <div className="mt-5">
        {goal !== null && <Thread value={gift.contributedCents} max={goal} label={`Angariado para ${gift.name}`} />}
        <p className="mt-2 text-sm text-pedra tabular-nums">
          {goal !== null
            ? reached
              ? `Objetivo atingido: ${formatEuros(gift.contributedCents)}`
              : `${formatEuros(gift.contributedCents)} de ${formatEuros(goal)}`
            : `${formatEuros(gift.contributedCents)} oferecidos até agora`}
          {myTotal > 0 && <span className="text-vinho"> (incluindo os teus {formatEuros(myTotal)})</span>}
        </p>
      </div>

      {open && <ContributionForm payment={payment} onContribute={onContribute} />}
    </div>
  );
}

const QUICK_AMOUNTS = [2000, 5000, 10000];

function ContributionForm({
  payment,
  onContribute,
}: {
  payment: PaymentDetails;
  onContribute: (cents: number) => void;
}) {
  const [amount, setAmount] = useState<number | null>(5000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<"bank_transfer" | "mbway">(payment.mbwayPhone ? "mbway" : "bank_transfer");
  const [copied, setCopied] = useState(false);

  const customCents = Math.round(parseFloat(custom.replace(",", ".")) * 100);
  const cents = amount ?? (Number.isFinite(customCents) ? customCents : 0);
  const valid = cents >= 100;

  const payTo = method === "mbway" ? payment.mbwayPhone : payment.iban;
  const payToText = method === "mbway" ? formatPhone(payTo ?? "") : formatIban(payTo ?? "");

  return (
    <form
      className="mt-6 space-y-6 rounded-lg bg-linho p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onContribute(cents);
      }}
    >
      <fieldset>
        <legend className="font-medium">Quanto queres oferecer?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={amount === v}
              onClick={() => {
                setAmount(v);
                setCustom("");
              }}
              className={`rounded-full border px-4 py-2 font-medium tabular-nums transition-colors ${
                amount === v ? "border-vinho bg-papel text-vinho" : "border-nevoa bg-papel hover:border-pedra"
              }`}
            >
              {formatEuros(v)}
            </button>
          ))}
          <label className="flex items-center gap-2">
            <span className="sr-only">Outro valor em euros</span>
            <input
              inputMode="decimal"
              placeholder="Outro valor"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value.replace(/[^\d,.]/g, ""));
                setAmount(null);
              }}
              className={`${field} w-32 rounded-full py-2`}
            />
            <span aria-hidden="true">€</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-medium">Como vais pagar?</legend>
        <div className="mt-3 inline-flex rounded-full border border-nevoa bg-papel p-1">
          {payment.mbwayPhone && (
            <MethodOption label="MB WAY" selected={method === "mbway"} onSelect={() => setMethod("mbway")} />
          )}
          {payment.iban && (
            <MethodOption label="Transferência" selected={method === "bank_transfer"} onSelect={() => setMethod("bank_transfer")} />
          )}
        </div>
      </fieldset>

      {payTo && (
        <div>
          <p className="text-sm text-pedra">{method === "mbway" ? "Envia para o número" : "Transfere para o IBAN"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="tracking-wide tabular-nums select-all sm:text-lg">{payToText}</p>
            <button
              type="button"
              className={`text-sm ${buttonLink}`}
              onClick={async () => {
                await navigator.clipboard?.writeText(payTo);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-1 text-sm text-pedra">Em nome de {payment.holderName}</p>
        </div>
      )}

      <div>
        <button type="submit" className={buttonPrimary} disabled={!valid}>
          Registar contribuição{valid ? ` de ${formatEuros(cents)}` : ""}
        </button>
        <p className="mt-3 max-w-[52ch] text-sm text-pedra">
          O pagamento faz-se na app do teu banco. Registar aqui ajuda os noivos a saber de quem é cada transferência.
        </p>
      </div>
    </form>
  );
}

function MethodOption({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        selected ? "bg-vinho text-sobre-vinho" : "bg-transparent text-pedra hover:text-tinta"
      }`}
    >
      {label}
    </button>
  );
}
