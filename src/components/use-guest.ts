"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/lib/types";

export type Guest = {
  id: number;
  full_name: string;
  rsvp_status: "pending" | "attending" | "declined";
  partner_name: string | null;
  children: Child[];
  message: string | null;
};

const GUEST_COLUMNS = "id, full_name, rsvp_status, partner_name, children, message";

export type GuestAnswer = { name: string; attending: boolean; partnerName: string | null; children: Child[]; message: string };

/** Mensagens claras para os erros que o convidado pode encontrar. */
export function friendlyError(error: { message?: string; code?: string } | null): string {
  const m = error?.message ?? "";
  if (/anonymous sign-ins are disabled/i.test(m)) return "Os noivos ainda não ativaram as respostas. Tenta mais tarde.";
  const age = m.match(/child_too_old: .*?(\d+) anos/);
  if (age) return `Só podem vir crianças até aos ${age[1]} anos.`;
  if (/children_not_allowed/.test(m)) return "Os noivos não podem receber crianças neste casamento.";
  if (/child_invalid/.test(m)) return "Indica o nome e a idade de cada criança.";
  if (error?.code === "23505") return "Este presente acabou de ser reservado por outra pessoa.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "Sem ligação à internet. Verifica a rede e tenta outra vez.";
  return "Não foi possível guardar. Tenta outra vez.";
}

/**
 * O convidado deste telemóvel. Entra com uma sessão anónima do Supabase
 * (ADR 0003) na primeira resposta; nas visitas seguintes é reconhecido.
 */
export function useGuest(weddingId: number) {
  const supabase: SupabaseClient = useMemo(() => createClient(), []);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setGuest(null);
      return;
    }
    const { data } = await supabase
      .from("guests")
      .select(GUEST_COLUMNS)
      .eq("wedding_id", weddingId)
      .eq("user_id", session.user.id)
      .maybeSingle<Guest>();
    setGuest(data ?? null);
  }, [supabase, weddingId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  /** Grava a resposta. Devolve uma mensagem de erro, ou null se correu bem. */
  const respond = useCallback(
    async (answer: GuestAnswer): Promise<string | null> => {
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) return friendlyError(error);
        session = data.session;
      }
      if (!session) return friendlyError(null);

      const values = {
        full_name: answer.name,
        rsvp_status: answer.attending ? "attending" : "declined",
        partner_name: answer.attending ? answer.partnerName : null,
        children: answer.attending ? answer.children : [],
        message: answer.message || null,
      };
      const query = guest
        ? supabase.from("guests").update(values).eq("id", guest.id)
        : supabase.from("guests").insert({ ...values, wedding_id: weddingId, user_id: session.user.id });
      const { data, error } = await query.select(GUEST_COLUMNS).single<Guest>();
      if (error) return friendlyError(error);
      setGuest(data);
      return null;
    },
    [supabase, guest, weddingId],
  );

  return { supabase, guest, loading, respond };
}
