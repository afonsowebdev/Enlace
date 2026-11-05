"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DemoGift } from "@/lib/demo-data";
import { formatEuros, formatIban, formatPhone } from "@/lib/format";
import { GiftIcon } from "./gift-icon";
import { buttonLink, buttonPrimary, field, goToRsvp } from "./ui";

type PaymentDetails = { holderName: string; iban: string | null; mbwayPhone: string | null };

type GiftsProps = {
  gifts: DemoGift[];
  payment: PaymentDetails;
  guestName: string | null;
};

type Filter = "all" | "available" | "item" | "money";
type Toast = { id: number; text: string; undo?: () => void };

/**
 * Lista de presentes: os presentes em dinheiro em destaque, os artigos numa
 * grelha com ilustração, filtros e um aviso com "Anular" depois de reservar.
 */
export function Gifts({ gifts: initial, payment, guestName }: GiftsProps) {
  const [gifts, setGifts] = useState(initial);
  const [mine, setMine] = useState<Set<number>>(new Set());
  const [myContributions, setMyContributions] = useState<Record<number, number>>({});
  const [openId, setOpenId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<Toast | null>(null);

  const registered = guestName !== null;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  function setReserved(gift: DemoGift, reserving: boolean) {
    setMine((prev) => {
      const next = new Set(prev);
      if (reserving) next.add(gift.id);
      else next.delete(gift.id);
      return next;
    });
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, isReserved: reserving } : g)));
  }

  function reserve(gift: DemoGift) {
    setReserved(gift, true);
    setToast({ id: Date.now(), text: `Reservaste: ${gift.name}`, undo: () => setReserved(gift, false) });
  }

  function cancel(gift: DemoGift) {
    setReserved(gift, false);
    setToast({ id: Date.now(), text: `Reserva cancelada: ${gift.name}` });
  }

  function contribute(gift: DemoGift, cents: number) {
    setMyContributions((prev) => ({ ...prev, [gift.id]: (prev[gift.id] ?? 0) + cents }));
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, contributedCents: g.contributedCents + cents } : g)));
    setOpenId(null);
    setToast({ id: Date.now(), text: `Contribuição de ${formatEuros(cents)} registada. Obrigado!` });
  }

  const money = gifts.filter((g) => g.kind === "money");
  const items = gifts.filter((g) => g.kind === "item");
  const available = items.filter((g) => !g.isReserved);
  const raised = money.reduce((sum, g) => sum + g.contributedCents, 0);

  // Disponíveis primeiro, depois os meus, por fim os já reservados por outros.
  const rank = (g: DemoGift) => (!g.isReserved ? 0 : mine.has(g.id) ? 1 : 2);
  const shownItems = items
    .filter((g) => (filter === "available" ? !g.isReserved || mine.has(g.id) : true))
    .sort((a, b) => rank(a) - rank(b));
  const showMoney = filter === "all" || filter === "money";
  const showItems = filter !== "money";

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Todos", count: gifts.length },
    { id: "available", label: "Disponíveis", count: available.length + money.length },
    { id: "item", label: "Artigos", count: items.length },
    { id: "money", label: "Em dinheiro", count: money.length },
  ];

  return (
    <div>
      <p className="text-pedra">
        Ainda há <strong className="font-medium text-tinta">{available.length} {available.length === 1 ? "artigo disponível" : "artigos disponíveis"}</strong>
        {raised > 0 && (
          <>
            {" "}e já foram oferecidos <strong className="font-medium text-tinta">{formatEuros(raised)}</strong> em dinheiro
          </>
        )}
        .
      </p>

      {!registered && (
        <p className="mt-6 rounded-md bg-linho px-4 py-3 text-sm">
          Para reservar um presente ou contribuir, <a href="#resposta" className={buttonLink}>responde primeiro ao convite</a>.
        </p>
      )}

      <div role="group" aria-label="Filtrar presentes" className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.id ? "border-transparent bg-cartao text-sobre-cartao" : "border-nevoa bg-papel text-pedra hover:text-tinta"
            }`}
          >
            {f.label} <span className="opacity-70 tabular-nums">{f.count}</span>
          </button>
        ))}
      </div>

      {showMoney && money.length > 0 && (
        <div className="mt-8 space-y-5">
          {money.map((gift) => (
            <MoneyCard
              key={gift.id}
              gift={gift}
              myTotal={myContributions[gift.id] ?? 0}
              open={openId === gift.id}
              onToggle={() => (registered ? setOpenId(openId === gift.id ? null : gift.id) : goToRsvp())}
              payment={payment}
              onContribute={(cents) => contribute(gift, cents)}
            />
          ))}
        </div>
      )}

      {showItems && (
        <motion.ul layout className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence initial={false}>
            {shownItems.map((gift) => (
              <motion.li
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <ItemCard
                  gift={gift}
                  isMine={mine.has(gift.id)}
                  onReserve={() => (registered ? reserve(gift) : goToRsvp())}
                  onCancel={() => cancel(gift)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-full bg-cartao py-3 pr-3 pl-5 text-sm text-sobre-cartao shadow-[0_14px_40px_-12px_rgba(40,10,15,0.6)]"
          >
            <span>{toast.text}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
                className="shrink-0 rounded-full bg-sobre-cartao/15 px-4 py-1.5 font-medium hover:bg-sobre-cartao/25"
              >
                Anular
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemCard({
  gift,
  isMine,
  onReserve,
  onCancel,
}: {
  gift: DemoGift;
  isMine: boolean;
  onReserve: () => void;
  onCancel: () => void;
}) {
  const takenByOther = gift.isReserved && !isMine;
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-papel transition-colors ${
        isMine ? "border-vinho" : "border-nevoa"
      }`}
    >
      <div className={`relative grid aspect-[5/4] place-items-center bg-linho ${takenByOther ? "opacity-50" : ""}`}>
        <GiftIcon icon={gift.icon} className="size-16 text-vinho sm:size-20" />
        {gift.isReserved && (
          <span
            className={`absolute top-3 left-0 rounded-r-full px-3 py-1 text-xs font-medium ${
              isMine ? "bg-dourado text-[#2a1215]" : "bg-cartao text-sobre-cartao"
            }`}
          >
            {isMine ? "Reservado por ti" : "Reservado"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className={`leading-snug font-medium ${takenByOther ? "text-pedra" : ""}`}>{gift.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-pedra">{gift.description}</p>
        <div className="mt-auto pt-3">
          {gift.priceCents !== null && <p className="font-medium tabular-nums">{formatEuros(gift.priceCents)}</p>}
          {gift.purchaseUrl && !takenByOther && (
            <a href={gift.purchaseUrl} target="_blank" rel="noopener noreferrer" className={`mt-1 inline-block text-xs ${buttonLink}`}>
              Ver na loja
            </a>
          )}
          <div className="mt-3">
            {takenByOther ? (
              <p className="py-2 text-center text-sm text-pedra">Já reservado</p>
            ) : isMine ? (
              <button type="button" onClick={onCancel} className="w-full rounded-full border border-nevoa py-2 text-sm font-medium text-pedra hover:text-tinta">
                Cancelar reserva
              </button>
            ) : (
              <button type="button" onClick={onReserve} className="w-full rounded-full bg-cartao py-2 text-sm font-medium text-sobre-cartao transition-opacity hover:opacity-90">
                Reservar
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MoneyCard({
  gift,
  myTotal,
  open,
  onToggle,
  payment,
  onContribute,
}: {
  gift: DemoGift;
  myTotal: number;
  open: boolean;
  onToggle: () => void;
  payment: PaymentDetails;
  onContribute: (cents: number) => void;
}) {
  const goal = gift.priceCents;
  const reached = goal !== null && gift.contributedCents >= goal;
  const pct = goal ? Math.min(100, Math.round((gift.contributedCents / goal) * 100)) : null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-cartao p-5 text-sobre-cartao sm:p-6">
        <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-xl border border-dourado/40" />
        <div className="relative flex items-start gap-4">
          <GiftIcon icon={gift.icon} className="size-12 shrink-0 text-dourado" />
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight tracking-wide">{gift.name}</h3>
            <p className="mt-1 text-sm opacity-85">{gift.description}</p>
          </div>
        </div>

        <div className="relative mt-5">
          {pct !== null && (
            <div
              role="progressbar"
              aria-label={`Angariado para ${gift.name}`}
              aria-valuemin={0}
              aria-valuemax={goal ?? 0}
              aria-valuenow={Math.min(gift.contributedCents, goal ?? 0)}
              className="h-[3px] w-full rounded-full bg-sobre-cartao/20"
            >
              <motion.div
                className="h-full rounded-full bg-dourado"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm tabular-nums">
              <span className="font-display text-2xl">{formatEuros(gift.contributedCents)}</span>
              <span className="opacity-80">
                {goal !== null ? (reached ? ", objetivo atingido" : ` de ${formatEuros(goal)}`) : " oferecidos"}
              </span>
              {myTotal > 0 && <span className="block text-xs text-dourado">Incluindo os teus {formatEuros(myTotal)}</span>}
            </p>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              className="rounded-full bg-sobre-cartao px-5 py-2 text-sm font-medium text-cartao transition-transform hover:-translate-y-0.5"
            >
              {open ? "Fechar" : "Contribuir"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ContributionForm payment={payment} onContribute={onContribute} />
          </motion.div>
        )}
      </AnimatePresence>
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
      className="mt-3 space-y-6 rounded-2xl border border-nevoa bg-linho p-5"
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
        selected ? "bg-cartao text-sobre-cartao" : "bg-transparent text-pedra hover:text-tinta"
      }`}
    >
      {label}
    </button>
  );
}
