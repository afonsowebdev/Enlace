"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/entrar");
        router.refresh();
      }}
      className="rounded-full px-4 py-2 text-sm font-medium text-pedra hover:text-tinta"
    >
      Sair
    </button>
  );
}
