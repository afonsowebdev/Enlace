// Configuração do Supabase. As variáveis NEXT_PUBLIC_* são públicas (vão para o
// browser) e o RLS da base de dados é que protege os dados.
// Se faltarem (ex.: primeiro deploy na Vercel), o site mostra uma página de
// configuração em vez de falhar.

export type SupabaseConfig = { url: string; key: string };

export function supabaseConfig(): SupabaseConfig | null {
  // Referências literais: o Next.js só inclui no browser variáveis escritas assim.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

/** Casamento mostrado na página inicial. Sem valor, mostra o primeiro criado. */
export const weddingSlug = process.env.NEXT_PUBLIC_WEDDING_SLUG || null;

/** URL público de um ficheiro do bucket wedding-media (fotos e música). */
export function mediaUrl(path: string | null | undefined) {
  const config = supabaseConfig();
  if (!path || !config) return null;
  return `${config.url}/storage/v1/object/public/wedding-media/${path}`;
}
