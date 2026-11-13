import { GiftsEditor, type ContributionView, type ReservationView } from "@/components/painel/gifts-editor";
import { requireHostWedding } from "@/lib/host";
import { GIFT_COLUMNS, type GiftRow } from "@/lib/types";

export default async function PresentesPage() {
  const { supabase, wedding } = await requireHostWedding();
  const [gifts, reservations, contributions] = await Promise.all([
    supabase.from("gifts").select(GIFT_COLUMNS).eq("wedding_id", wedding.id).order("sort_order").order("id").returns<GiftRow[]>(),
    supabase.from("gift_reservations").select("id, gift_id, created_at, guests(full_name)").eq("wedding_id", wedding.id),
    supabase
      .from("gift_contributions")
      .select("id, gift_id, amount_cents, payment_method, received_at, created_at, message, guests(full_name)")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-display text-[2.2rem] leading-tight">Presentes</h1>
      <p className="mt-1 text-pedra">
        Artigos são oferecidos por uma só pessoa. Nos presentes em dinheiro, vários convidados contribuem por IBAN ou MB WAY
        (indiquem os dados em Casamento).
      </p>
      <GiftsEditor
        weddingId={wedding.id}
        gifts={gifts.data ?? []}
        reservations={(reservations.data ?? []) as unknown as ReservationView[]}
        contributions={(contributions.data ?? []) as unknown as ContributionView[]}
      />
    </div>
  );
}
