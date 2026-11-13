import { GuestsTable, type GuestRow } from "@/components/painel/guests-table";
import { formatEuros, formatWeddingDate } from "@/lib/format";
import { requireHostWedding } from "@/lib/host";

type Stats = {
  guests_total: number;
  guests_attending: number;
  guests_declined: number;
  guests_pending: number;
  people_attending: number;
  items_total: number;
  items_reserved: number;
  money_gifts_total: number;
  contributed_cents: number;
  received_cents: number;
  memories_total: number;
  memories_bytes: number;
};

export default async function ResumoPage() {
  const { supabase, wedding } = await requireHostWedding();
  const [{ data: statsRows }, { data: guests }] = await Promise.all([
    supabase.rpc("wedding_stats", { p_wedding_id: wedding.id }),
    supabase
      .from("guests")
      .select("id, full_name, rsvp_status, partner_name, children, companions, message, responded_at, created_at")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .returns<GuestRow[]>(),
  ]);
  const s = ((statsRows as Stats[] | null)?.[0] ?? {}) as Partial<Stats>;
  const n = (v: number | undefined) => Number(v ?? 0);
  const days = Math.ceil((new Date(wedding.starts_at).getTime() - Date.now()) / 86_400_000);

  const cards = [
    { label: "Pessoas confirmadas", value: n(s.people_attending), note: `${n(s.guests_attending)} convidados, com cônjuges e crianças` },
    { label: "Respostas", value: n(s.guests_total), note: `${n(s.guests_declined)} não podem ir` },
    { label: "Artigos reservados", value: `${n(s.items_reserved)} de ${n(s.items_total)}`, note: `${n(s.money_gifts_total)} presentes em dinheiro` },
    {
      label: "Dinheiro prometido",
      value: formatEuros(n(s.contributed_cents)),
      note: `${formatEuros(n(s.received_cents))} já recebidos`,
    },
    { label: "Memórias", value: n(s.memories_total), note: `${(n(s.memories_bytes) / 1024 / 1024).toFixed(0)} MB de 1024 MB` },
  ];

  return (
    <div>
      <h1 className="font-display text-[2.2rem] leading-tight">Resumo</h1>
      <p className="mt-1 text-pedra">
        {formatWeddingDate(wedding.starts_at, wedding.time_zone)}
        {days > 0 ? `. Faltam ${days} dias.` : "."}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label} className="rounded-2xl border border-nevoa bg-papel p-4">
            <p className="text-sm text-pedra">{c.label}</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{c.value}</p>
            <p className="mt-1 text-xs text-pedra">{c.note}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Convidados</h2>
        <GuestsTable guests={guests ?? []} />
      </section>
    </div>
  );
}
