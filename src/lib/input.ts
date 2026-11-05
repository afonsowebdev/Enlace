// Conversões do que os noivos escrevem nos formulários para o formato da base de dados.

/** Diferença (ms) entre a hora local no fuso e UTC, num dado instante. */
function tzOffsetMs(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - instant.getTime();
}

/** "2027-06-12" + "16:00" em Europe/Lisbon → ISO em UTC. */
export function zonedToUtc(date: string, time: string, timeZone: string) {
  const naive = new Date(`${date}T${time}:00Z`);
  let utc = naive.getTime() - tzOffsetMs(naive, timeZone);
  // segunda passagem para acertar nas mudanças de hora
  utc = naive.getTime() - tzOffsetMs(new Date(utc), timeZone);
  return new Date(utc).toISOString();
}

/** ISO em UTC → { date: "2027-06-12", time: "16:00" } no fuso indicado. */
export function utcToZoned(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** "Conceição", "João" → "conceicao-e-joao" */
export function slugify(partnerOne: string, partnerTwo: string) {
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `${clean(partnerOne)}-e-${clean(partnerTwo)}`.slice(0, 60).replace(/-+$/g, "");
}

/** "1.500,00" → 150000 cêntimos; texto vazio ou inválido → null. */
export function parseEuros(text: string): number | null {
  const t = text.trim().replace(/\s|€/g, "");
  if (!t) return null;
  let normalized = t;
  if (t.includes(",")) normalized = t.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

export function normalizeIban(text: string) {
  return text.replace(/\s+/g, "").toUpperCase();
}

/** Números portugueses sem indicativo ganham +351. */
export function normalizePhone(text: string) {
  const digits = text.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 9) return `+351${digits}`;
  return digits;
}

/** Um nome por linha → lista sem linhas vazias. */
export function splitNames(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}
