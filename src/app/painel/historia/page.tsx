import { StoryEditor } from "@/components/painel/story-editor";
import { mediaUrl } from "@/lib/env";
import { requireHostWedding } from "@/lib/host";
import type { StoryRow } from "@/lib/types";

export default async function HistoriaPage() {
  const { supabase, wedding } = await requireHostWedding();
  const { data } = await supabase
    .from("story_moments")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("sort_order")
    .order("id")
    .returns<StoryRow[]>();

  return (
    <div>
      <h1 className="font-display text-[2.2rem] leading-tight">A nossa história</h1>
      <p className="mt-1 text-pedra">Os momentos que vos trouxeram até aqui. Se não houver nenhum, a secção não aparece no convite.</p>
      <StoryEditor weddingId={wedding.id} moments={(data ?? []).map((m) => ({ ...m, photoUrl: mediaUrl(m.photo_path) }))} />
    </div>
  );
}
