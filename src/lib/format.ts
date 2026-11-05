// Formatos de Portugal (pt-PT). Os espaços devolvidos são não separáveis
// (U+00A0) onde o Intl os usa, para "120 €" nunca partir em duas linhas.

const LOCALE = "pt-PT";

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase(LOCALE) + text.slice(1);
}

/** "Sábado, 12 de junho de 2027" */
export function formatWeddingDate(startsAt: string | Date, timeZone: string) {
  const text = new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(startsAt));
  return capitalize(text);
}

/** "16h00" */
export function formatWeddingTime(startsAt: string | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(new Date(startsAt));
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour}h${minute}`;
}

/** Cêntimos → "95,50 €"; valores redondos sem casas decimais: "1500 €". */
export function formatEuros(cents: number) {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/** "PT50 0002 0123 1234 5678 9015 4" */
export function formatIban(iban: string) {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** "+351 912 345 678" */
export function formatPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  const match = digits.match(/^(\+\d{3})?(\d{3})(\d{3})(\d{3})$/);
  if (!match) return phone;
  return [match[1], match[2], match[3], match[4]].filter(Boolean).join(" ");
}
