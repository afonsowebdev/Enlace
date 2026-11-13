"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonPrimary, buttonQuiet, field } from "../ui";
import { Card } from "./form-bits";

const fmt = (iso: string) => new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** Criar o link que entrega o casamento aos noivos. */
export function HandoverCard({ weddingId, initialExpiresAt }: { weddingId: number; initialExpiresAt: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [link, setLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    setCopied(false);
    const { data, error } = await supabase.rpc("create_wedding_handover", { p_wedding_id: weddingId });
    if (error) {
      setBusy(false);
      return setError("Não foi possível criar o link. Tenta outra vez.");
    }
    setLink(`${window.location.origin}/entregar/${data as string}`);
    const { data: exp } = await supabase.rpc("wedding_handover_expires_at", { p_wedding_id: weddingId });
    setExpiresAt((exp as string | null) ?? null);
    setBusy(false);
  }

  async function cancel() {
    setBusy(true);
    await supabase.rpc("cancel_wedding_handover", { p_wedding_id: weddingId });
    setLink(null);
    setExpiresAt(null);
    setBusy(false);
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card
      title="Entregar aos noivos"
      intro="Cria um link e envia-o aos noivos. Ao abri-lo, escolhem o email e a palavra-passe deles e o casamento passa para a conta deles. Esta conta deixa de ter acesso ao painel."
    >
      {link ? (
        <div className="space-y-3">
          <label htmlFor="link-entrega" className="block text-sm font-medium">
            Link de entrega
          </label>
          <div className="flex flex-wrap gap-2">
            <input id="link-entrega" readOnly className={`${field} min-w-0 flex-1 font-mono text-sm`} value={link} onFocus={(e) => e.target.select()} />
            <button type="button" className={buttonPrimary} onClick={copy}>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-pedra">
            Serve uma só vez{expiresAt ? ` e vale até ${fmt(expiresAt)}` : ""}. Guarda-o já: por segurança, não volta a ser mostrado.
          </p>
        </div>
      ) : expiresAt ? (
        <p className="text-sm">
          Há um link de entrega ativo até <strong>{fmt(expiresAt)}</strong>. Se o perdeste, cria um novo: o anterior deixa de funcionar.
        </p>
      ) : (
        <p className="text-sm text-pedra">Ainda não há nenhum link de entrega.</p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-vinho">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className={buttonQuiet} onClick={create} disabled={busy}>
          {busy ? "Um momento…" : expiresAt || link ? "Criar link novo" : "Criar link de entrega"}
        </button>
        {(expiresAt || link) && (
          <button type="button" className="rounded-full px-4 py-2.5 text-sm font-medium text-pedra hover:text-vinho" onClick={cancel} disabled={busy}>
            Cancelar link
          </button>
        )}
      </div>
    </Card>
  );
}
