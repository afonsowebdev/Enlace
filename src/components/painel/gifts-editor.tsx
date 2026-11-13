"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mediaUrl } from "@/lib/env";
import { formatEuros } from "@/lib/format";
import { parseEuros } from "@/lib/input";
import { uploadMedia } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";
import { GIFT_ICONS, type GiftIcon as Icon, type GiftKind, type GiftRow } from "@/lib/types";
import { GiftIcon } from "../gift-icon";
import { buttonPrimary } from "../ui";
import { Card, Field, input, SaveStatus } from "./form-bits";

export type ReservationView = { id: number; gift_id: number; created_at: string; guests: { full_name: string } | null };
export type ContributionView = {
  id: number;
  gift_id: number;
  amount_cents: number;
  payment_method: "bank_transfer" | "mbway";
  received_at: string | null;
  created_at: string;
  message: string | null;
  guests: { full_name: string } | null;
};

type Status = { kind: "ok" | "error"; text: string } | null;

export function GiftsEditor({
  weddingId,
  gifts,
  reservations,
  contributions,
}: {
  weddingId: number;
  gifts: GiftRow[];
  reservations: ReservationView[];
  contributions: ContributionView[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const reservedBy = new Map(reservations.map((r) => [r.gift_id, r]));
  const giftName = new Map(gifts.map((g) => [g.id, g.name]));
  // Só os noivos veem todas as contribuições (RLS); o total sai daqui.
  const contributedBy = new Map<number, number>();
  for (const c of contributions) contributedBy.set(c.gift_id, (contributedBy.get(c.gift_id) ?? 0) + c.amount_cents);

  async function toggleReceived(c: ContributionView) {
    await supabase
      .from("gift_contributions")
      .update({ received_at: c.received_at ? null : new Date().toISOString() })
      .eq("id", c.id);
    router.refresh();
  }

  async function removeContribution(c: ContributionView) {
    if (!confirm(`Apagar a contribuição de ${formatEuros(c.amount_cents)} de ${c.guests?.full_name ?? "convidado"}?`)) return;
    await supabase.from("gift_contributions").delete().eq("id", c.id);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10">
      <div className="space-y-4">
        {gifts.length === 0 && <p className="text-pedra">Ainda não há presentes. Acrescentem o primeiro em baixo.</p>}
        {gifts.map((g) => (
          <GiftForm
            key={g.id}
            weddingId={weddingId}
            gift={g}
            reservation={reservedBy.get(g.id)}
            contributedCents={contributedBy.get(g.id) ?? 0}
          />
        ))}
        <GiftForm key={`novo-${gifts.length}`} weddingId={weddingId} nextOrder={gifts.length} />
      </div>

      <Card title="Contribuições em dinheiro" intro="Marquem como recebida quando o dinheiro chegar à conta.">
        {contributions.length === 0 ? (
          <p className="text-sm text-pedra">Ainda não há contribuições.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-pedra">
                <tr>
                  <th className="py-2 pr-4 font-medium">Convidado</th>
                  <th className="py-2 pr-4 font-medium">Presente</th>
                  <th className="py-2 pr-4 font-medium">Valor</th>
                  <th className="py-2 pr-4 font-medium">Meio</th>
                  <th className="py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nevoa">
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium">{c.guests?.full_name ?? "Convidado"}</td>
                    <td className="py-3 pr-4">{giftName.get(c.gift_id)}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatEuros(c.amount_cents)}</td>
                    <td className="py-3 pr-4">{c.payment_method === "mbway" ? "MB WAY" : "Transferência"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleReceived(c)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            c.received_at ? "bg-cartao text-sobre-cartao" : "border border-nevoa text-pedra hover:text-tinta"
                          }`}
                        >
                          {c.received_at ? "Recebida" : "Marcar como recebida"}
                        </button>
                        <button type="button" onClick={() => removeContribution(c)} className="text-xs text-pedra underline">
                          Apagar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function GiftForm({
  weddingId,
  gift,
  reservation,
  contributedCents = 0,
  nextOrder = 0,
}: {
  weddingId: number;
  gift?: GiftRow;
  reservation?: ReservationView;
  contributedCents?: number;
  nextOrder?: number;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(!gift);
  const [kind, setKind] = useState<GiftKind>(gift?.kind ?? "item");
  const [name, setName] = useState(gift?.name ?? "");
  const [description, setDescription] = useState(gift?.description ?? "");
  const [price, setPrice] = useState(gift?.price_cents != null ? String(gift.price_cents / 100).replace(".", ",") : "");
  const [icon, setIcon] = useState<Icon>(gift?.icon ?? "gift");
  const [purchaseUrl, setPurchaseUrl] = useState(gift?.purchase_url ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const id = gift ? `g${gift.id}` : "gnovo";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const cents = price.trim() ? parseEuros(price) : null;
    if (price.trim() && cents === null) return setStatus({ kind: "error", text: "Escrevam o valor em euros, por exemplo 120 ou 95,50." });
    const url = purchaseUrl.trim();
    if (url && !/^https:\/\//.test(url)) return setStatus({ kind: "error", text: "O link da loja tem de começar por https://" });

    setBusy(true);
    setStatus(null);
    let imageUrl = gift?.image_url ?? null;
    if (image) {
      const p = await uploadMedia(supabase, weddingId, "presente", image);
      if (!p) {
        setBusy(false);
        return setStatus({ kind: "error", text: "A imagem não foi enviada (máximo 20 MB)." });
      }
      imageUrl = mediaUrl(p);
    }
    const values = {
      name: name.trim(),
      description: description.trim() || null,
      price_cents: cents,
      icon,
      purchase_url: kind === "item" ? url || null : null,
      image_url: imageUrl,
    };
    const { error } = gift
      ? await supabase.from("gifts").update(values).eq("id", gift.id)
      : await supabase.from("gifts").insert({ ...values, kind, wedding_id: weddingId, sort_order: nextOrder });
    setBusy(false);
    if (error) return setStatus({ kind: "error", text: "Não foi possível guardar o presente." });
    setImage(null);
    if (gift) setOpen(false);
    setStatus({ kind: "ok", text: gift ? "Guardado." : "Presente acrescentado." });
    router.refresh();
  }

  async function remove() {
    if (!gift) return;
    const warn = reservation || contributedCents > 0 ? " Já tem reservas ou contribuições, que também serão apagadas." : "";
    if (!confirm(`Apagar "${gift.name}"?${warn}`)) return;
    await supabase.from("gifts").delete().eq("id", gift.id);
    router.refresh();
  }

  async function freeReservation() {
    if (!reservation || !confirm(`Libertar a reserva de ${reservation.guests?.full_name ?? "convidado"}?`)) return;
    await supabase.from("gift_reservations").delete().eq("id", reservation.id);
    router.refresh();
  }

  if (gift && !open) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-nevoa bg-papel p-4">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-linho text-vinho">
          {gift.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gift.image_url} alt="" className="size-full object-cover" />
          ) : (
            <GiftIcon icon={gift.icon} className="size-9" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{gift.name}</p>
          <p className="text-sm text-pedra">
            {gift.kind === "money"
              ? `Em dinheiro: ${formatEuros(contributedCents)} oferecidos${gift.price_cents ? ` de ${formatEuros(gift.price_cents)}` : ""}`
              : `${gift.price_cents != null ? formatEuros(gift.price_cents) : "Sem valor"}. ${
                  reservation ? `Reservado por ${reservation.guests?.full_name ?? "um convidado"}` : "Disponível"
                }`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reservation && (
            <button type="button" onClick={freeReservation} className="rounded-full px-3 py-1.5 text-sm text-pedra underline">
              Libertar reserva
            </button>
          )}
          <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-nevoa px-4 py-1.5 text-sm font-medium hover:border-vinho hover:text-vinho">
            Editar
          </button>
          <button type="button" onClick={remove} className="rounded-full px-3 py-1.5 text-sm font-medium text-vinho hover:underline">
            Apagar
          </button>
        </div>
        <SaveStatus status={status} />
      </div>
    );
  }

  return (
    <Card title={gift ? `Editar: ${gift.name}` : "Acrescentar um presente"}>
      <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
        {!gift && (
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium">Tipo</legend>
            <div className="mt-2 inline-flex rounded-full border border-nevoa p-1">
              {(["item", "money"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => {
                    setKind(k);
                    if (k === "money" && icon === "gift") setIcon("envelope");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${kind === k ? "bg-cartao text-sobre-cartao" : "text-pedra"}`}
                >
                  {k === "item" ? "Artigo (uma pessoa)" : "Em dinheiro (vários)"}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <Field label="Nome" id={`${id}-name`}>
          <input id={`${id}-name`} className={input} required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={kind === "money" ? "Objetivo em euros" : "Valor de referência em euros"} id={`${id}-price`} hint="Opcional.">
          <input id={`${id}-price`} className={input} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição" id={`${id}-desc`}>
            <input id={`${id}-desc`} className={input} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Ilustração</legend>
          <p className="mt-0.5 text-xs text-pedra">Aparece quando não há imagem.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GIFT_ICONS.map((ic) => (
              <button
                key={ic.id}
                type="button"
                aria-pressed={icon === ic.id}
                aria-label={ic.label}
                title={ic.label}
                onClick={() => setIcon(ic.id)}
                className={`grid size-12 place-items-center rounded-lg border ${icon === ic.id ? "border-vinho bg-linho text-vinho" : "border-nevoa text-pedra"}`}
              >
                <GiftIcon icon={ic.id} className="size-8" />
              </button>
            ))}
          </div>
        </fieldset>
        {kind === "item" && (
          <Field label="Link da loja" id={`${id}-url`} hint="Opcional. Começa por https://">
            <input id={`${id}-url`} type="url" className={input} value={purchaseUrl} onChange={(e) => setPurchaseUrl(e.target.value)} />
          </Field>
        )}
        <Field label="Imagem" id={`${id}-img`} hint="Opcional. Até 20 MB.">
          <input id={`${id}-img`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </Field>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "A guardar…" : gift ? "Guardar" : "Acrescentar presente"}
          </button>
          {gift && (
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-pedra underline">
              Cancelar
            </button>
          )}
          <SaveStatus status={status} />
        </div>
      </form>
    </Card>
  );
}
