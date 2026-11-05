import type { GiftIcon as Icon } from "@/lib/demo-data";

// Ilustrações de traço fino, no estilo dos raminhos do fundo.
const PATHS: Record<Icon, string> = {
  plane: "M8 34 L56 14 L46 46 L34 36 L28 48 L26 34 Z M26 34 L56 14 M34 36 L46 46",
  envelope: "M10 18 H54 V46 H10 Z M10 18 L32 34 L54 18 M10 46 L26 32 M54 46 L38 32 M32 24 c-3-4-9-1-6 4 l6 5 l6-5 c3-5-3-8-6-4 Z",
  coffee: "M18 22 H42 V46 a6 6 0 0 1-6 6 H24 a6 6 0 0 1-6-6 Z M42 28 h4 a5 5 0 0 1 0 10 h-4 M14 56 H48 M24 10 c-2 3 2 5 0 8 M31 8 c-2 3 2 5 0 8",
  bed: "M8 46 V22 M8 36 H56 V46 M8 30 H24 a4 4 0 0 1 4 4 v2 M30 30 H52 a4 4 0 0 1 4 4 v2 M12 46 v4 M52 46 v4",
  pan: "M10 30 H44 v8 a10 10 0 0 1-10 10 H20 a10 10 0 0 1-10-10 Z M44 33 H58 M16 24 c0-6 22-6 22 0 M27 18 v-4",
  vase: "M24 10 H40 M26 10 c0 8-8 12-8 24 c0 10 6 18 14 18 s14-8 14-18 c0-12-8-16-8-24 M20 30 H44",
  glasses: "M14 12 H28 l-2 18 a5 5 0 0 1-10 0 Z M21 35 V50 M15 52 H27 M36 12 H50 l-2 18 a5 5 0 0 1-10 0 Z M43 35 V50 M37 52 H49",
};

export function GiftIcon({ icon, className = "" }: { icon: Icon; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[icon]} />
    </svg>
  );
}
