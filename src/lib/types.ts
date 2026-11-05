// Tipos dos dados do convite (forma usada pelos componentes).

export type GiftKind = "item" | "money";
export type GiftIcon = "gift" | "plane" | "envelope" | "coffee" | "bed" | "pan" | "vase" | "glasses";

export const GIFT_ICONS: { id: GiftIcon; label: string }[] = [
  { id: "gift", label: "Presente" },
  { id: "plane", label: "Viagem" },
  { id: "envelope", label: "Dinheiro" },
  { id: "coffee", label: "Café" },
  { id: "bed", label: "Quarto" },
  { id: "pan", label: "Cozinha" },
  { id: "vase", label: "Decoração" },
  { id: "glasses", label: "Mesa" },
];

export type Gift = {
  id: number;
  kind: GiftKind;
  icon: GiftIcon;
  name: string;
  description: string | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
  priceCents: number | null;
  isReserved: boolean;
  contributedCents: number;
  sortOrder: number;
};

export type StoryMoment = {
  id: number;
  year: string;
  title: string;
  text: string | null;
  photoUrl: string | null;
};

export type PaymentDetails = { holderName: string; iban: string | null; mbwayPhone: string | null };

export type Place = {
  label: string;
  name: string;
  address: string;
  startsAt: string;
  latitude: number | null;
  longitude: number | null;
};

// Linhas da base de dados (snake_case) ---------------------------------

export type WeddingRow = {
  id: number;
  slug: string;
  partner_one_name: string;
  partner_two_name: string;
  starts_at: string;
  time_zone: string;
  venue_name: string;
  venue_address: string;
  venue_latitude: number | null;
  venue_longitude: number | null;
  welcome_message: string | null;
  rsvp_deadline: string | null;
  max_companions: number;
  partner_one_parents: string[];
  partner_two_parents: string[];
  reception_name: string | null;
  reception_address: string | null;
  reception_starts_at: string | null;
  reception_latitude: number | null;
  reception_longitude: number | null;
  cover_photo_path: string | null;
  music_path: string | null;
};

export type GiftRow = {
  id: number;
  wedding_id: number;
  kind: GiftKind;
  icon: GiftIcon;
  name: string;
  description: string | null;
  image_url: string | null;
  purchase_url: string | null;
  price_cents: number | null;
  sort_order: number;
  is_reserved: boolean;
  contributed_cents: number;
};

export type StoryRow = {
  id: number;
  wedding_id: number;
  year: string;
  title: string;
  body: string | null;
  photo_path: string | null;
  sort_order: number;
};

export function toGift(r: GiftRow): Gift {
  return {
    id: r.id,
    kind: r.kind,
    icon: r.icon,
    name: r.name,
    description: r.description,
    imageUrl: r.image_url,
    purchaseUrl: r.purchase_url,
    priceCents: r.price_cents,
    isReserved: r.is_reserved,
    contributedCents: Number(r.contributed_cents),
    sortOrder: r.sort_order,
  };
}

export function placesOf(w: WeddingRow): Place[] {
  const places: Place[] = [
    {
      label: "Cerimónia",
      name: w.venue_name,
      address: w.venue_address,
      startsAt: w.starts_at,
      latitude: w.venue_latitude,
      longitude: w.venue_longitude,
    },
  ];
  if (w.reception_name && w.reception_address) {
    places.push({
      label: "Receção",
      name: w.reception_name,
      address: w.reception_address,
      startsAt: w.reception_starts_at ?? w.starts_at,
      latitude: w.reception_latitude,
      longitude: w.reception_longitude,
    });
  }
  return places;
}
