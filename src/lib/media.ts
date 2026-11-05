"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Envia um ficheiro para wedding-media/{weddingId}/... e devolve o caminho (ou null). */
export async function uploadMedia(supabase: SupabaseClient, weddingId: number, prefix: string, file: File) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${weddingId}/${prefix}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("wedding-media").upload(path, file, { contentType: file.type });
  return error ? null : path;
}

/** Apaga um ficheiro antigo do wedding-media (ignora erros). */
export async function removeMedia(supabase: SupabaseClient, path: string | null | undefined) {
  if (path) await supabase.storage.from("wedding-media").remove([path]);
}
