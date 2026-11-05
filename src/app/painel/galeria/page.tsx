import { GalleryManager, type GalleryItem } from "@/components/painel/gallery-manager";
import { requireHostWedding } from "@/lib/host";

export default async function GaleriaPage() {
  const { supabase, wedding } = await requireHostWedding();
  const { data } = await supabase
    .from("memories")
    .select("id, storage_path, kind, size_bytes, original_filename, created_at, guests(full_name)")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Omit<GalleryItem, "url">[];
  const { data: signed } = rows.length
    ? await supabase.storage.from("memories").createSignedUrls(rows.map((r) => r.storage_path), 3600)
    : { data: [] };

  const items: GalleryItem[] = rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? "" }));

  return (
    <div>
      <h1 className="font-display text-[2.2rem] leading-tight">Galeria</h1>
      <p className="mt-1 text-pedra">As fotos e vídeos que os convidados enviaram. Só vocês podem descarregar.</p>
      <GalleryManager items={items} />
    </div>
  );
}
