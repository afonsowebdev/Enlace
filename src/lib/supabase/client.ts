import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/env";

/** Cliente Supabase para componentes que correm no browser. */
export function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase não configurado: faltam NEXT_PUBLIC_SUPABASE_URL e a chave pública.");
  return createBrowserClient(config.url, config.key);
}
