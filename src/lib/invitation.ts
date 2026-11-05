import "server-only";
import { mediaUrl, supabaseConfig, weddingSlug } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { toGift, type Gift, type GiftRow, type StoryMoment, type StoryRow, type WeddingRow } from "@/lib/types";

export type InvitationData = { wedding: WeddingRow; gifts: Gift[]; story: StoryMoment[] };

export type InvitationResult =
  | { status: "no-config" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ok"; data: InvitationData };

/** Carrega o casamento da página inicial, os presentes e a história. */
export async function loadInvitation(): Promise<InvitationResult> {
  if (!supabaseConfig()) return { status: "no-config" };
  const supabase = await createClient();

  let query = supabase.from("weddings").select("*");
  query = weddingSlug ? query.eq("slug", weddingSlug) : query.order("created_at", { ascending: true });
  const { data: wedding, error } = await query.limit(1).maybeSingle<WeddingRow>();
  if (error) return { status: "error", message: error.message };
  if (!wedding) return { status: "empty" };

  const [gifts, story] = await Promise.all([
    supabase.from("gifts").select("*").eq("wedding_id", wedding.id).order("sort_order").order("id").returns<GiftRow[]>(),
    supabase.from("story_moments").select("*").eq("wedding_id", wedding.id).order("sort_order").order("id").returns<StoryRow[]>(),
  ]);

  return {
    status: "ok",
    data: {
      wedding,
      gifts: (gifts.data ?? []).map(toGift),
      story: (story.data ?? []).map((m) => ({
        id: m.id,
        year: m.year,
        title: m.title,
        text: m.body,
        photoUrl: mediaUrl(m.photo_path),
      })),
    },
  };
}
