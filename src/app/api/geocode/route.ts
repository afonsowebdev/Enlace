import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Converte uma morada em coordenadas (ADR 0004), só para os noivos.
 * Usa o Nominatim do OpenStreetMap, que exige identificação no User-Agent.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return NextResponse.json({ error: "not_allowed" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length > 300) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const contact = process.env.NOMINATIM_CONTACT_EMAIL ? ` (${process.env.NOMINATIM_CONTACT_EMAIL})` : "";
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
    { headers: { "User-Agent": `Enlace-convite/1.0${contact}`, "Accept-Language": "pt-PT" }, cache: "no-store" },
  ).catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: "unavailable" }, { status: 502 });

  const [hit] = (await res.json()) as { lat: string; lon: string }[];
  if (!hit) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ latitude: Number(hit.lat), longitude: Number(hit.lon) });
}
