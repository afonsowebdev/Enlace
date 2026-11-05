"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { removeMedia, uploadMedia } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";
import type { StoryRow } from "@/lib/types";
import { buttonPrimary, buttonQuiet } from "../ui";
import { Card, Field, input, SaveStatus } from "./form-bits";

type Moment = StoryRow & { photoUrl: string | null };
type Status = { kind: "ok" | "error"; text: string } | null;

export function StoryEditor({ weddingId, moments }: { weddingId: number; moments: Moment[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function move(index: number, dir: -1 | 1) {
    const a = moments[index];
    const b = moments[index + dir];
    if (!a || !b) return;
    // Reescreve a ordem de todos para evitar empates.
    const order = moments.map((m) => m.id);
    order.splice(index, 1);
    order.splice(index + dir, 0, a.id);
    await Promise.all(order.map((id, i) => supabase.from("story_moments").update({ sort_order: i }).eq("id", id)));
    router.refresh();
  }

  async function remove(m: Moment) {
    if (!confirm(`Apagar o momento "${m.title}"?`)) return;
    await supabase.from("story_moments").delete().eq("id", m.id);
    await removeMedia(supabase, m.photo_path);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      {moments.map((m, i) => (
        <MomentForm
          key={m.id}
          weddingId={weddingId}
          moment={m}
          actions={
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`text-sm ${buttonQuiet}`} onClick={() => move(i, -1)} disabled={i === 0}>
                Subir
              </button>
              <button type="button" className={`text-sm ${buttonQuiet}`} onClick={() => move(i, 1)} disabled={i === moments.length - 1}>
                Descer
              </button>
              <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-vinho hover:underline" onClick={() => remove(m)}>
                Apagar
              </button>
            </div>
          }
        />
      ))}
      <MomentForm key={`novo-${moments.length}`} weddingId={weddingId} nextOrder={moments.length} />
    </div>
  );
}

function MomentForm({
  weddingId,
  moment,
  nextOrder = 0,
  actions,
}: {
  weddingId: number;
  moment?: Moment;
  nextOrder?: number;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [year, setYear] = useState(moment?.year ?? "");
  const [title, setTitle] = useState(moment?.title ?? "");
  const [body, setBody] = useState(moment?.body ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const id = moment ? `m${moment.id}` : "novo";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    let photoPath = moment?.photo_path ?? null;
    if (photo) {
      const p = await uploadMedia(supabase, weddingId, "historia", photo);
      if (!p) {
        setBusy(false);
        return setStatus({ kind: "error", text: "A foto não foi enviada (máximo 20 MB, JPG, PNG ou WebP)." });
      }
      await removeMedia(supabase, moment?.photo_path);
      photoPath = p;
    }
    const values = { year: year.trim(), title: title.trim(), body: body.trim() || null, photo_path: photoPath };
    const { error } = moment
      ? await supabase.from("story_moments").update(values).eq("id", moment.id)
      : await supabase.from("story_moments").insert({ ...values, wedding_id: weddingId, sort_order: nextOrder });
    setBusy(false);
    if (error) return setStatus({ kind: "error", text: "Não foi possível guardar. Confirma o ano e o título." });
    setPhoto(null);
    setStatus({ kind: "ok", text: moment ? "Guardado." : "Momento acrescentado." });
    router.refresh();
  }

  return (
    <Card title={moment ? `${moment.year}: ${moment.title}` : "Acrescentar um momento"}>
      <form onSubmit={save} className="grid gap-5 sm:grid-cols-[1fr_2fr_auto]">
        <div className="grid gap-5 sm:col-span-2 sm:grid-cols-[8rem_1fr]">
          <Field label="Ano" id={`${id}-year`}>
            <input id={`${id}-year`} className={input} required maxLength={20} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2019" />
          </Field>
          <Field label="Título" id={`${id}-title`}>
            <input id={`${id}-title`} className={input} required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A primeira casa" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Texto" id={`${id}-body`} hint="Duas ou três frases chegam.">
              <textarea id={`${id}-body`} rows={3} maxLength={1000} className={input} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={moment?.photoUrl ? "Trocar a foto" : "Foto"} id={`${id}-photo`} hint="Vertical fica melhor. Até 20 MB.">
              <input id={`${id}-photo`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </Field>
          </div>
        </div>
        {moment?.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={moment.photoUrl} alt="" className="h-40 w-32 rounded border border-nevoa object-cover sm:row-span-2" />
        )}
        <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "A guardar…" : moment ? "Guardar" : "Acrescentar"}
          </button>
          {actions}
          <SaveStatus status={status} />
        </div>
      </form>
    </Card>
  );
}
