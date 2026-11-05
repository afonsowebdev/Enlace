import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/env";

/** Cliente Supabase para Server Components, Server Actions e Route Handlers. */
export async function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase não configurado: faltam NEXT_PUBLIC_SUPABASE_URL e a chave pública.");
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: o middleware renova a sessão.
        }
      },
    },
  });
}
