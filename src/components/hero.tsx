import { formatWeddingDate, formatWeddingTime } from "@/lib/format";

type HeroProps = {
  partnerOneName: string;
  partnerTwoName: string;
  startsAt: string;
  timeZone: string;
  venueName: string;
  welcomeMessage?: string | null;
};

/**
 * Abertura: os nomes dos noivos e o fio que se enlaça entre eles.
 * O fio termina na margem esquerda e continua pela página (ver RailSection).
 */
export function Hero({ partnerOneName, partnerTwoName, startsAt, timeZone, venueName, welcomeMessage }: HeroProps) {
  return (
    <header className="pt-16 sm:pt-24">
      <h1 className="font-display leading-[0.9] tracking-[0.01em]">
        <span className="block text-[clamp(4.5rem,19vw,10rem)]">{partnerOneName}</span>
        <span className="sr-only"> e </span>
        <Knot />
        <span className="block border-l-[1.5px] border-cobalto text-right text-[clamp(4.5rem,19vw,10rem)]">{partnerTwoName}</span>
      </h1>

      <div className="border-l-[1.5px] border-cobalto pt-10 pb-4 pl-7">
        <p className="text-lg leading-snug">
          {formatWeddingDate(startsAt, timeZone)},{" "}
          <span className="whitespace-nowrap">às {formatWeddingTime(startsAt, timeZone)}</span>
        </p>
        <p className="mt-1 text-pedra">{venueName}</p>
        {welcomeMessage && <p className="mt-8 max-w-[52ch] text-pretty">{welcomeMessage}</p>}
        <a
          href="#resposta"
          className="mt-8 inline-flex items-center rounded-full bg-cobalto px-6 py-3 font-medium text-sobre-cobalto transition-opacity hover:opacity-90"
        >
          Responder ao convite
        </a>
      </div>
    </header>
  );
}

/** O laço. Entra pela direita, dá uma volta sobre si e desce pela margem esquerda. */
function Knot() {
  return (
    <svg
      viewBox="0 0 340 96"
      className="-my-3 block h-auto w-full overflow-visible text-cobalto sm:-my-5"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="fio-desenhar"
        d="M340 38 H214 C192 38 184 14 163 14 C143 14 133 30 133 46 C133 64 151 74 168 66 C186 57 182 38 158 38 H26 C10 38 0.75 48 0.75 62 V96"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
