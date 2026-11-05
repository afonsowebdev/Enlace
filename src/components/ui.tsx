// Peças pequenas partilhadas. Raio: botões em pílula, campos com 6 px.

export const buttonPrimary =
  "inline-flex items-center justify-center rounded-full bg-cobalto px-6 py-3 font-medium text-sobre-cobalto transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

export const buttonQuiet =
  "inline-flex items-center justify-center rounded-full border border-nevoa px-5 py-2.5 font-medium transition-colors hover:border-cobalto hover:text-cobalto";

export const buttonLink =
  "font-medium text-cobalto underline decoration-1 underline-offset-4 hover:decoration-2";

export const field =
  "w-full rounded-md border border-nevoa bg-porcelana px-4 py-3 text-tinta placeholder:text-pedra/70 focus:border-cobalto focus:outline-none";

/** Barra de progresso desenhada como o fio. */
export function Thread({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="relative h-[3px] w-full rounded-full bg-nevoa"
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-cobalto" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Leva o convidado ao formulário de resposta e põe o cursor no nome. */
export function goToRsvp() {
  const input = document.getElementById("rsvp-nome");
  document.getElementById("resposta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (input instanceof HTMLInputElement) setTimeout(() => input.focus({ preventScroll: true }), 400);
}
