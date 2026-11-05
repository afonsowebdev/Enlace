"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatIban, formatPhone } from "@/lib/format";
import { normalizeIban, normalizePhone, splitNames, utcToZoned, zonedToUtc } from "@/lib/input";
import { removeMedia, uploadMedia } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";
import type { WeddingRow } from "@/lib/types";
import { buttonPrimary } from "../ui";
import { Card, Field, input, SaveStatus } from "./form-bits";

type Payment = { holder_name: string; iban: string | null; mbway_phone: string | null } | null;

type Props = { wedding: WeddingRow; payment: Payment; coverUrl: string | null; musicUrl: string | null };

async function geocode(address: string) {
  const r = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`).catch(() => null);
  if (!r?.ok) return null;
  return (await r.json()) as { latitude: number; longitude: number };
}

export function WeddingForm({ wedding: w, payment, coverUrl, musicUrl }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const tz = w.time_zone;
  const ceremony = utcToZoned(w.starts_at, tz);
  const reception = w.reception_starts_at ? utcToZoned(w.reception_starts_at, tz) : null;

  const [f, setF] = useState({
    one: w.partner_one_name,
    two: w.partner_two_name,
    date: ceremony.date,
    time: ceremony.time,
    venueName: w.venue_name,
    venueAddress: w.venue_address,
    hasReception: Boolean(w.reception_name),
    receptionName: w.reception_name ?? "",
    receptionAddress: w.reception_address ?? "",
    receptionTime: reception?.time ?? "19:00",
    parentsOne: w.partner_one_parents.join("\n"),
    parentsTwo: w.partner_two_parents.join("\n"),
    welcome: w.welcome_message ?? "",
    deadline: w.rsvp_deadline ?? "",
    maxCompanions: String(w.max_companions),
    holder: payment?.holder_name ?? "",
    iban: payment?.iban ? formatIban(payment.iban) : "",
    mbway: payment?.mbway_phone ? formatPhone(payment.mbway_phone) : "",
  });
  const [cover, setCover] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [music, setMusic] = useState<File | null>(null);
  const [removeMusic, setRemoveMusic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const notes: string[] = [];

    // Coordenadas: procuradas de novo quando a morada muda.
    let venueCoords = { venue_latitude: w.venue_latitude, venue_longitude: w.venue_longitude };
    if (f.venueAddress.trim() !== w.venue_address || w.venue_latitude === null) {
      const g = await geocode(f.venueAddress);
      venueCoords = { venue_latitude: g?.latitude ?? null, venue_longitude: g?.longitude ?? null };
      if (!g) notes.push("Não encontrámos a morada da cerimónia no mapa; o convite mostra só o caminho.");
    }
    let receptionCoords = { reception_latitude: w.reception_latitude, reception_longitude: w.reception_longitude };
    if (f.hasReception && (f.receptionAddress.trim() !== (w.reception_address ?? "") || w.reception_latitude === null)) {
      const g = await geocode(f.receptionAddress);
      receptionCoords = { reception_latitude: g?.latitude ?? null, reception_longitude: g?.longitude ?? null };
      if (!g) notes.push("Não encontrámos a morada da receção no mapa.");
    }

    // Ficheiros
    let coverPath = w.cover_photo_path;
    if (removeCover) {
      await removeMedia(supabase, coverPath);
      coverPath = null;
    }
    if (cover) {
      const p = await uploadMedia(supabase, w.id, "capa", cover);
      if (!p) notes.push("A foto de capa não foi enviada (máximo 20 MB, JPG, PNG ou WebP).");
      else {
        await removeMedia(supabase, w.cover_photo_path);
        coverPath = p;
      }
    }
    let musicPath = w.music_path;
    if (removeMusic) {
      await removeMedia(supabase, musicPath);
      musicPath = null;
    }
    if (music) {
      const p = await uploadMedia(supabase, w.id, "musica", music);
      if (!p) notes.push("A música não foi enviada (máximo 20 MB, MP3 ou M4A).");
      else {
        await removeMedia(supabase, w.music_path);
        musicPath = p;
      }
    }

    const { error } = await supabase
      .from("weddings")
      .update({
        partner_one_name: f.one.trim(),
        partner_two_name: f.two.trim(),
        starts_at: zonedToUtc(f.date, f.time, tz),
        venue_name: f.venueName.trim(),
        venue_address: f.venueAddress.trim(),
        ...venueCoords,
        reception_name: f.hasReception ? f.receptionName.trim() || null : null,
        reception_address: f.hasReception ? f.receptionAddress.trim() || null : null,
        reception_starts_at: f.hasReception ? zonedToUtc(f.date, f.receptionTime, tz) : null,
        ...(f.hasReception ? receptionCoords : { reception_latitude: null, reception_longitude: null }),
        partner_one_parents: splitNames(f.parentsOne),
        partner_two_parents: splitNames(f.parentsTwo),
        welcome_message: f.welcome.trim() || null,
        rsvp_deadline: f.deadline || null,
        max_companions: Math.max(0, Math.min(20, Number(f.maxCompanions) || 0)),
        cover_photo_path: coverPath,
        music_path: musicPath,
      })
      .eq("id", w.id);

    if (error) {
      setBusy(false);
      return setStatus({ kind: "error", text: "Não foi possível guardar. Confirma os campos obrigatórios e tenta outra vez." });
    }

    // Dados de pagamento
    const iban = normalizeIban(f.iban);
    const mbway = f.mbway.trim() ? normalizePhone(f.mbway) : "";
    if (f.holder.trim() && (iban || mbway)) {
      const { error: payErr } = await supabase.from("wedding_payment_details").upsert(
        { wedding_id: w.id, holder_name: f.holder.trim(), iban: iban || null, mbway_phone: mbway || null },
        { onConflict: "wedding_id" },
      );
      if (payErr) notes.push("O IBAN ou o número MB WAY não parecem válidos.");
    } else if (payment && !f.holder.trim() && !iban && !mbway) {
      await supabase.from("wedding_payment_details").delete().eq("wedding_id", w.id);
    } else if (iban || mbway) {
      notes.push("Para guardar o IBAN ou o MB WAY, indiquem também o nome do titular.");
    }

    setBusy(false);
    setCover(null);
    setMusic(null);
    setRemoveCover(false);
    setRemoveMusic(false);
    setStatus({ kind: notes.length ? "error" : "ok", text: notes.length ? `Guardado, com avisos: ${notes.join(" ")}` : "Guardado." });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-8 space-y-6">
      <Card title="Os noivos">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome" id="one">
            <input id="one" className={input} required maxLength={80} value={f.one} onChange={set("one")} />
          </Field>
          <Field label="Nome" id="two">
            <input id="two" className={input} required maxLength={80} value={f.two} onChange={set("two")} />
          </Field>
          <Field label="Pais de um dos noivos" id="parentsOne" hint="Um nome por linha. Deixem vazio para não mostrar.">
            <textarea id="parentsOne" rows={2} className={input} value={f.parentsOne} onChange={set("parentsOne")} />
          </Field>
          <Field label="Pais do outro noivo" id="parentsTwo" hint="Um nome por linha.">
            <textarea id="parentsTwo" rows={2} className={input} value={f.parentsTwo} onChange={set("parentsTwo")} />
          </Field>
        </div>
      </Card>

      <Card title="Cerimónia">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Data" id="date">
            <input id="date" type="date" className={input} required value={f.date} onChange={set("date")} />
          </Field>
          <Field label="Hora" id="time">
            <input id="time" type="time" className={input} required value={f.time} onChange={set("time")} />
          </Field>
          <Field label="Local" id="venueName">
            <input id="venueName" className={input} required maxLength={120} value={f.venueName} onChange={set("venueName")} />
          </Field>
          <Field label="Morada" id="venueAddress" hint="O mapa é atualizado quando guardarem.">
            <input id="venueAddress" className={input} required maxLength={300} value={f.venueAddress} onChange={set("venueAddress")} />
          </Field>
        </div>
      </Card>

      <Card title="Receção">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-[var(--vinho)]"
            checked={f.hasReception}
            onChange={(e) => setF((p) => ({ ...p, hasReception: e.target.checked }))}
          />
          A receção é noutro local
        </label>
        {f.hasReception && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Local" id="receptionName">
              <input id="receptionName" className={input} required maxLength={120} value={f.receptionName} onChange={set("receptionName")} />
            </Field>
            <Field label="Hora" id="receptionTime" hint="No mesmo dia da cerimónia.">
              <input id="receptionTime" type="time" className={input} required value={f.receptionTime} onChange={set("receptionTime")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Morada" id="receptionAddress">
                <input id="receptionAddress" className={input} required maxLength={300} value={f.receptionAddress} onChange={set("receptionAddress")} />
              </Field>
            </div>
          </div>
        )}
      </Card>

      <Card title="Convite" intro="A mensagem aparece na abertura do convite.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Mensagem para os convidados" id="welcome">
              <textarea id="welcome" rows={3} maxLength={2000} className={input} value={f.welcome} onChange={set("welcome")} />
            </Field>
          </div>
          <Field label="Responder até" id="deadline" hint="Opcional.">
            <input id="deadline" type="date" className={input} value={f.deadline} onChange={set("deadline")} />
          </Field>
          <Field label="Acompanhantes por convidado" id="maxCompanions" hint="0 a 20.">
            <input id="maxCompanions" type="number" min={0} max={20} className={input} value={f.maxCompanions} onChange={set("maxCompanions")} />
          </Field>
        </div>
      </Card>

      <Card title="Foto de capa e música">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Field label="Foto do casal" id="cover" hint="Vertical, até 20 MB.">
              <input id="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
            </Field>
            {coverUrl && !removeCover && (
              <div className="mt-3 flex items-end gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Foto de capa atual" className="h-28 w-auto rounded border border-nevoa object-cover" />
                <button type="button" className="text-sm text-pedra underline" onClick={() => setRemoveCover(true)}>
                  Remover
                </button>
              </div>
            )}
          </div>
          <div>
            <Field label="Música de fundo" id="music" hint="Opcional. MP3 ou M4A, até 20 MB.">
              <input id="music" type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg" className="text-sm" onChange={(e) => setMusic(e.target.files?.[0] ?? null)} />
            </Field>
            {musicUrl && !removeMusic && (
              <div className="mt-3 flex items-center gap-3">
                <audio src={musicUrl} controls className="h-10 max-w-full" />
                <button type="button" className="text-sm text-pedra underline" onClick={() => setRemoveMusic(true)}>
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Dados para presentes em dinheiro" intro="Só os convidados que responderam ao convite veem estes dados.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Titular" id="holder">
            <input id="holder" className={input} maxLength={120} value={f.holder} onChange={set("holder")} />
          </Field>
          <Field label="IBAN" id="iban">
            <input id="iban" className={input} inputMode="text" autoComplete="off" value={f.iban} onChange={set("iban")} placeholder="PT50 …" />
          </Field>
          <Field label="Número MB WAY" id="mbway">
            <input id="mbway" className={input} inputMode="tel" autoComplete="off" value={f.mbway} onChange={set("mbway")} placeholder="912 345 678" />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-full border border-nevoa bg-papel/95 px-4 py-3 shadow-lg backdrop-blur">
        <button type="submit" className={buttonPrimary} disabled={busy}>
          {busy ? "A guardar…" : "Guardar alterações"}
        </button>
        <SaveStatus status={status} />
      </div>
    </form>
  );
}
