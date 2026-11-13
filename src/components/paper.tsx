/**
 * Papel branco champanhe com filete dourado duplo e grão, como um cartão impresso.
 * Usa sempre as cores claras (classe "papel-claro"), também no modo escuro:
 * o papel não muda de cor à noite.
 */
export function Paper({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`papel-claro relative overflow-hidden rounded-[1.75rem] text-tinta shadow-[0_40px_80px_-40px_rgba(70,40,20,0.45),0_2px_6px_rgba(70,40,20,0.06)] ${className}`}
      style={{ background: "linear-gradient(160deg, var(--convite-luz), var(--convite) 55%, var(--convite-luz))" }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-dourado/60 sm:inset-4" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[1.15rem] rounded-[1.1rem] border border-dourado/25 sm:inset-[1.45rem]" />
      <span aria-hidden="true" className="grao pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
