"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/painel", label: "Resumo" },
  { href: "/painel/casamento", label: "Casamento" },
  { href: "/painel/historia", label: "História" },
  { href: "/painel/presentes", label: "Presentes" },
  { href: "/painel/galeria", label: "Galeria" },
];

export function PainelNav() {
  const path = usePathname();
  return (
    <nav aria-label="Painel" className="mx-auto w-full max-w-5xl overflow-x-auto px-5">
      <ul className="flex gap-1">
        {LINKS.map((l) => {
          const active = l.href === "/painel" ? path === "/painel" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "border-vinho text-vinho" : "border-transparent text-pedra hover:text-tinta"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
