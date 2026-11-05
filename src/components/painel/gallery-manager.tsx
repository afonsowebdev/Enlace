"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadZip } from "client-zip";
import { createClient } from "@/lib/supabase/client";

export type GalleryItem = {
  id: number;
  storage_path: string;
  kind: "photo" | "video";
  size_bytes: number;
  original_filename: string | null;
  created_at: string;
  guests: { full_name: string } | null;
  url: string;
};

function fileName(item: GalleryItem, index: number) {
  const ext = item.storage_path.split(".").pop() ?? "jpg";
  const base = (item.guests?.full_name ?? "convidado").normalize("NFD").replace(/[^\w]+/g, "-");
  return `${String(index + 1).padStart(3, "0")}-${base}.${ext}`;
}

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [zipping, setZipping] = useState<{ done: number; total: number } | null>(null);
  const totalMb = items.reduce((s, i) => s + Number(i.size_bytes), 0) / 1024 / 1024;

  async function downloadOne(item: GalleryItem, index: number) {
    const { data } = await supabase.storage.from("memories").createSignedUrl(item.storage_path, 300, { download: fileName(item, index) });
    if (data?.signedUrl) window.location.href = data.signedUrl;
  }

  async function downloadAll() {
    setZipping({ done: 0, total: items.length });
    let done = 0;
    async function* files() {
      for (const [i, item] of items.entries()) {
        const res = await fetch(item.url);
        if (res.ok) yield { name: fileName(item, i), input: res };
        done += 1;
        setZipping({ done, total: items.length });
      }
    }
    const blob = await downloadZip(files()).blob();
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "memorias-do-casamento.zip" }).click();
    URL.revokeObjectURL(url);
    setZipping(null);
  }

  async function remove(item: GalleryItem) {
    if (!confirm("Apagar esta memória? Deixa de aparecer para todos.")) return;
    await supabase.from("memories").delete().eq("id", item.id);
    await supabase.storage.from("memories").remove([item.storage_path]);
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="mt-8 text-pedra">Ainda não há memórias. Os convidados podem enviá-las no convite, depois de responderem.</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-pedra">
          {items.length} {items.length === 1 ? "ficheiro" : "ficheiros"}, {totalMb.toFixed(0)} MB
        </p>
        <button
          type="button"
          onClick={downloadAll}
          disabled={zipping !== null}
          className="rounded-full bg-cartao px-5 py-2.5 text-sm font-medium text-sobre-cartao disabled:opacity-60"
        >
          {zipping ? `A preparar ${zipping.done} de ${zipping.total}…` : "Descarregar todas (.zip)"}
        </button>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.id} className="overflow-hidden rounded-xl border border-nevoa bg-papel">
            <div className="aspect-square bg-linho">
              {item.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <video src={item.url} className="size-full object-cover" controls preload="metadata" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3 text-sm">
              <span className="truncate text-pedra">{item.guests?.full_name ?? "Convidado"}</span>
              <span className="flex shrink-0 gap-3">
                <button type="button" onClick={() => downloadOne(item, i)} className="font-medium text-vinho hover:underline">
                  Descarregar
                </button>
                <button type="button" onClick={() => remove(item)} className="text-pedra hover:underline">
                  Apagar
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
