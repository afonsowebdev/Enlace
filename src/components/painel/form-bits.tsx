"use client";

import { field } from "../ui";

/** Campo com etiqueta e ajuda, para os formulários do painel. */
export function Field({
  label,
  hint,
  id,
  children,
}: {
  label: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-pedra">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export const input = field;

export function Card({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-nevoa bg-papel p-5 sm:p-7">
      <h2 className="font-display text-2xl leading-tight">{title}</h2>
      {intro && <p className="mt-1 max-w-[60ch] text-sm text-pedra">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Mensagem de estado depois de guardar. */
export function SaveStatus({ status }: { status: { kind: "ok" | "error"; text: string } | null }) {
  if (!status) return null;
  return (
    <p role={status.kind === "error" ? "alert" : "status"} className={`text-sm font-medium ${status.kind === "error" ? "text-vinho" : "text-pedra"}`}>
      {status.text}
    </p>
  );
}
