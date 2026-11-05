// Dados de demonstração para o protótipo de design (fase 1).
// Na fase 2 são substituídos pelos dados reais do Supabase, com a mesma forma.

export type GiftKind = "item" | "money";

export type DemoGift = {
  id: number;
  kind: GiftKind;
  name: string;
  description: string;
  priceCents: number | null;
  /** artigo: reservado por outro convidado */
  isReserved: boolean;
  /** presente em dinheiro: total já prometido */
  contributedCents: number;
};

export const demoWedding = {
  slug: "maria-e-joao",
  partnerOneName: "Maria",
  partnerTwoName: "João",
  startsAt: "2027-06-12T15:00:00Z",
  timeZone: "Europe/Lisbon",
  venueName: "Mosteiro dos Jerónimos",
  venueAddress: "Praça do Império, 1400-206 Lisboa",
  venueLatitude: 38.6979,
  venueLongitude: -9.2068,
  welcomeMessage:
    "Depois de nove anos, uma casa e um cão chamado Bacalhau, decidimos casar. Queremos muito que estejas connosco.",
  rsvpDeadline: "2027-05-15",
  maxCompanions: 2,
};

export const demoPaymentDetails = {
  holderName: "Maria Santos e João Pereira",
  iban: "PT50000201231234567890154",
  mbwayPhone: "+351912345678",
};

export const demoGifts: DemoGift[] = [
  {
    id: 1,
    kind: "money",
    name: "Voo da lua de mel",
    description: "Ajuda-nos a chegar aos Açores.",
    priceCents: 150000,
    isReserved: false,
    contributedCents: 62000,
  },
  {
    id: 2,
    kind: "item",
    name: "Máquina de café expresso",
    description: "Para os pequenos-almoços a dois.",
    priceCents: 18000,
    isReserved: false,
    contributedCents: 0,
  },
  {
    id: 3,
    kind: "item",
    name: "Jogo de lençóis de linho",
    description: "Cama de casal, cor natural.",
    priceCents: 9500,
    isReserved: true,
    contributedCents: 0,
  },
  {
    id: 4,
    kind: "item",
    name: "Conjunto de panelas",
    description: "Inox, cinco peças.",
    priceCents: 22000,
    isReserved: false,
    contributedCents: 0,
  },
  {
    id: 5,
    kind: "money",
    name: "Presente em dinheiro",
    description: "Contribui com o valor que quiseres.",
    priceCents: null,
    isReserved: false,
    contributedCents: 34000,
  },
];
