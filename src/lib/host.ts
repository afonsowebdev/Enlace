import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { WeddingRow } from "@/lib/types";

/**
 * Para as páginas do painel: exige uma conta com email (não anónima).
 * Devolve o cliente, o utilizador e o casamento que gere (ou null se ainda não criou).
 */
export async function requireHost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) redirect("/entrar");

  const { data } = await supabase
    .from("wedding_hosts")
    .select("weddings(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<{ weddings: WeddingRow }>();

  return { supabase, user, wedding: data?.weddings ?? null };
}

/** Como requireHost, mas manda para o início do painel se ainda não houver casamento. */
export async function requireHostWedding() {
  const ctx = await requireHost();
  if (!ctx.wedding) redirect("/painel");
  return { ...ctx, wedding: ctx.wedding };
}
