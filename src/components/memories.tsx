"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buttonLink, buttonPrimary } from "./ui";

type Memory = { id: number; url: string; kind: "photo" | "video" };

const MAX_BYTES = 50 * 1024 * 1024; // limite por ficheiro (bucket memories)

type MemoriesProps = {
  supabase: SupabaseClient;
  weddingId: number;
  guestId: number | null;
};

/**
 * Memórias: os convidados enviam fotos e vídeos para o bucket privado
 * "memories" e todos os convidados veem a galeria (URLs assinados, 1 hora).
 * O download fica só para os noivos, no painel.
 */
export function Memories({ supabase, weddingId, guestId }: MemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("memories")
      .select("id, storage_path, kind")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false })
      .limit(300);
    if (!data?.length) return setMemories([]);
    const { data: signed } = await supabase.storage.from("memories").createSignedUrls(
      data.map((m) => m.storage_path),
      3600,
    );
    setMemories(
      data
        .map((m, i) => ({ id: m.id, kind: m.kind, url: signed?.[i]?.signedUrl ?? "" }))
        .filter((m) => m.url),
    );
  }, [supabase, weddingId]);

  useEffect(() => {
    if (guestId !== null) load();
  }, [guestId, load]);

  if (guestId === null) {
    return (
      <p className="rounded-md bg-linho px-4 py-3 text-sm">
        Para enviar e ver as memórias do casamento, <a href="#resposta" className={buttonLink}>responde primeiro ao convite</a>.
      </p>
    );
  }

  async function upload(files: FileList | null) {
    if (!files || guestId === null) return;
    const list = Array.from(files).filter((f) => /^(image|video)\//.test(f.type));
    const issues: string[] = [];
    setUploading({ done: 0, total: list.length });

    for (const [i, file] of list.entries()) {
      if (file.size > MAX_BYTES) {
        issues.push(`"${file.name}" tem mais de 50 MB.`);
      } else {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${weddingId}/${guestId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("memories").upload(path, file, { contentType: file.type });
        if (upErr) {
          issues.push(`"${file.name}" não foi enviado.`);
        } else {
          const { error } = await supabase.from("memories").insert({
            wedding_id: weddingId,
            guest_id: guestId,
            storage_path: path,
            kind: file.type.startsWith("video") ? "video" : "photo",
            mime_type: file.type,
            size_bytes: file.size,
            original_filename: file.name.slice(0, 255),
          });
          if (error) issues.push(`"${file.name}" não foi registado.`);
        }
      }
      setUploading({ done: i + 1, total: list.length });
    }

    setProblems(issues);
    setUploading(null);
    await load();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        id="memorias-ficheiros"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <button type="button" className={buttonPrimary} onClick={() => inputRef.current?.click()} disabled={uploading !== null}>
        {uploading ? `A enviar ${uploading.done} de ${uploading.total}…` : "Enviar fotos e vídeos"}
      </button>
      <p className="mt-3 text-sm text-pedra">Até 50 MB por ficheiro. Só os noivos podem descarregar as memórias.</p>

      {problems.length > 0 && (
        <ul role="alert" className="mt-4 space-y-1 text-sm">
          {problems.map((p) => (
            <li key={p}>{p} Experimenta uma versão mais pequena.</li>
          ))}
        </ul>
      )}

      {memories.length === 0 ? (
        <p className="mt-10 max-w-[48ch] text-pedra">
          Ainda não há memórias. As fotos e vídeos que os convidados enviarem aparecem aqui, para todos verem.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-3 gap-1.5 sm:gap-2" aria-label="Galeria de memórias">
          {memories.map((m) => (
            <li key={m.id} className="relative aspect-square overflow-hidden rounded-sm bg-linho">
              {m.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" loading="lazy" className="size-full object-cover" onContextMenu={(e) => e.preventDefault()} />
              ) : (
                <video
                  src={m.url}
                  className="size-full object-cover"
                  muted
                  playsInline
                  controls
                  controlsList="nodownload"
                  preload="metadata"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
