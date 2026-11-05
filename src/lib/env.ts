import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_WEDDING_SLUG: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
});

// Falha cedo, com uma mensagem clara, se faltar alguma variável.
export const env = schema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_WEDDING_SLUG: process.env.NEXT_PUBLIC_WEDDING_SLUG,
});
