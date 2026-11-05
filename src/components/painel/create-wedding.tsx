"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, zonedToUtc } from "@/lib/input";
import { createClient } from "@/lib/supabase/client";
import { buttonPrimary } from "../ui";
import { Field, input } from "./form-bits";

const TZ = "Europe/Lisbon";

/** Primeiro passo: criar o casamento com o essencial. O resto edita-se depois. */
export function CreateWedding() {
  const router = useRouter();
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: id, error } = await supabase.rpc("create_wedding", {
      p_slug: slugify(one, two),
      p_partner_one_name: one.trim(),
      p_partner_two_name: two.trim(),
      p_starts_at: zonedToUtc(date, time, TZ),
      p_venue_name: venue.trim(),
      p_venue_address: address.trim(),
    });
    if (error) {
      setBusy(false);
      return setError(
        /weddings_slug_key/.test(error.message)
          ? "Já existe um casamento com estes nomes. Acrescenta um apelido a um dos nomes."
          : "Não foi possível criar o casamento. Confirma os dados e tenta outra vez.",
      );
    }
    // Coordenadas do local para o mapa (se a morada for encontrada).
    const geo = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (geo) await supabase.from("weddings").update({ venue_latitude: geo.latitude, venue_longitude: geo.longitude }).eq("id", id);
    router.push("/painel/casamento");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-[2.4rem] leading-tight">Vamos criar o vosso convite</h1>
      <p className="mt-3 text-pedra">Comecem pelo essencial. Fotos, presentes, história e o resto acrescentam-se a seguir.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Nome de um dos noivos" id="one">
          <input id="one" className={input} required maxLength={80} value={one} onChange={(e) => setOne(e.target.value)} />
        </Field>
        <Field label="Nome do outro noivo" id="two">
          <input id="two" className={input} required maxLength={80} value={two} onChange={(e) => setTwo(e.target.value)} />
        </Field>
        <Field label="Data" id="date">
          <input id="date" type="date" className={input} required value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Hora da cerimónia" id="time">
          <input id="time" type="time" className={input} required value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Local da cerimónia" id="venue" hint="Ex.: Igreja de São Roque">
            <input id="venue" className={input} required maxLength={120} value={venue} onChange={(e) => setVenue(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Morada" id="address" hint="Usada para o mapa e para o caminho no Google Maps e Waze.">
            <input id="address" className={input} required maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-vinho sm:col-span-2">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "A criar…" : "Criar convite"}
          </button>
        </div>
      </form>
    </div>
  );
}
