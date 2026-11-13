import { HandoverCard } from "@/components/painel/handover-card";
import { WeddingForm } from "@/components/painel/wedding-form";
import { mediaUrl } from "@/lib/env";
import { requireHostWedding } from "@/lib/host";

export default async function CasamentoPage() {
  const { supabase, wedding } = await requireHostWedding();
  const [{ data: payment }, { data: handoverExpiresAt }] = await Promise.all([
    supabase.from("wedding_payment_details").select("holder_name, iban, mbway_phone").eq("wedding_id", wedding.id).maybeSingle(),
    supabase.rpc("wedding_handover_expires_at", { p_wedding_id: wedding.id }),
  ]);

  return (
    <div>
      <h1 className="font-display text-[2.2rem] leading-tight">Casamento</h1>
      <p className="mt-1 text-pedra">Tudo o que aparece no convite. Guardem no fim da página.</p>
      <WeddingForm
        wedding={wedding}
        payment={payment ?? null}
        coverUrl={mediaUrl(wedding.cover_photo_path)}
        musicUrl={mediaUrl(wedding.music_path)}
      />
      <div className="mt-10">
        <HandoverCard weddingId={wedding.id} initialExpiresAt={(handoverExpiresAt as string | null) ?? null} />
      </div>
    </div>
  );
}
