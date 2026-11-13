"use client";

import { useMemo, useState } from "react";
import type { Child } from "@/lib/types";

export type GuestRow = {
  id: number;
  full_name: string;
  rsvp_status: "pending" | "attending" | "declined";
  partner_name: string | null;
  children: Child[];
  companions: number;
  message: string | null;
  responded_at: string | null;
  created_at: string;
};

const ageText = (a: number) => (a === 0 ? "menos de 1 ano" : a === 1 ? "1 ano" : `${a} anos`);
const childrenText = (cs: Child[]) => cs.map((c) => `${c.name} (${ageText(c.age)})`).join(", ");

const LABEL = { attending: "Vem", declined: "Não vem", pending: "Sem resposta" } as const;

export function GuestsTable({ guests }: { guests: GuestRow[] }) {
  const [filter, setFilter] = useState<"all" | GuestRow["rsvp_status"]>("all");
  const shown = useMemo(() => (filter === "all" ? guests : guests.filter((g) => g.rsvp_status === filter)), [guests, filter]);

  function exportCsv() {
    const rows = [["Nome", "Resposta", "Esposa / esposo", "Crianças", "Total de pessoas", "Mensagem", "Respondeu em"]];
    for (const g of guests) {
      rows.push([
        g.full_name,
        LABEL[g.rsvp_status],
        g.partner_name ?? "",
        childrenText(g.children),
        String(g.rsvp_status === "attending" ? 1 + g.companions : 0),
        g.message ?? "",
        g.responded_at ? new Date(g.responded_at).toLocaleString("pt-PT") : "",
      ]);
    }
    // Ponto e vírgula + BOM: abre bem no Excel em português.
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "convidados.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  if (guests.length === 0) {
    return <p className="mt-4 text-pedra">Ainda ninguém respondeu. Partilha o link do convite com os convidados.</p>;
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "attending", "declined", "pending"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                filter === f ? "border-transparent bg-cartao text-sobre-cartao" : "border-nevoa text-pedra hover:text-tinta"
              }`}
            >
              {f === "all" ? "Todos" : LABEL[f]}
            </button>
          ))}
        </div>
        <button type="button" onClick={exportCsv} className="rounded-full border border-nevoa px-4 py-1.5 text-sm font-medium hover:border-vinho hover:text-vinho">
          Exportar para Excel
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-nevoa">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-linho text-pedra">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Resposta</th>
              <th className="px-4 py-3 font-medium">Esposa / esposo</th>
              <th className="px-4 py-3 font-medium">Crianças</th>
              <th className="px-4 py-3 font-medium">Pessoas</th>
              <th className="px-4 py-3 font-medium">Mensagem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nevoa">
            {shown.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium">{g.full_name}</td>
                <td className="px-4 py-3">{LABEL[g.rsvp_status]}</td>
                <td className="px-4 py-3">{g.partner_name}</td>
                <td className="px-4 py-3">{childrenText(g.children)}</td>
                <td className="px-4 py-3 tabular-nums">{g.rsvp_status === "attending" ? 1 + g.companions : 0}</td>
                <td className="max-w-[24rem] px-4 py-3 text-pedra">{g.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
