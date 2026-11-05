import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Link do email de confirmação: troca o código por uma sessão e abre o painel. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/painel";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
