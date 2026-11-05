// Dados de demonstração para o protótipo de design (fase 1).
// Na fase 2 são substituídos pelos dados reais do Supabase, com a mesma forma.

export type GiftKind = "item" | "money";

export type GiftIcon = "plane" | "coffee" | "bed" | "pan" | "envelope" | "vase" | "glasses";

export type DemoGift = {
  id: number;
  kind: GiftKind;
  /** Ilustração provisória; na fase 2 os noivos podem carregar uma foto (image_url). */
  icon: GiftIcon;
  purchaseUrl?: string;
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
  // Novos campos do cartão-convite (ainda não estão na base de dados: ver docs/PLANO.md, fase 2)
  parents: {
    partnerOne: ["António Santos", "Helena Santos"],
    partnerTwo: ["Carlos Pereira", "Rosa Pereira"],
  },
  reception: {
    name: "Quinta da Regaleira",
    address: "Rua Barbosa du Bocage 5, 2710-567 Sintra",
    startsAt: "2027-06-12T18:30:00Z",
    latitude: 38.7963,
    longitude: -9.3961,
  },
  /** Música de fundo opcional (ficheiro em public/ ou URL). Sem música, o botão não aparece. */
  musicUrl: null as string | null,
};

export const demoPaymentDetails = {
  holderName: "Maria Santos e João Pereira",
  iban: "PT50000201231234567890154",
  mbwayPhone: "+351912345678",
};

export const demoGifts: DemoGift[] = [
  { id: 1, kind: "money", icon: "plane", name: "Voo da lua de mel", description: "Ajuda-nos a chegar aos Açores.", priceCents: 150000, isReserved: false, contributedCents: 62000 },
  { id: 5, kind: "money", icon: "envelope", name: "Presente em dinheiro", description: "Contribui com o valor que quiseres.", priceCents: null, isReserved: false, contributedCents: 34000 },
  { id: 2, kind: "item", icon: "coffee", name: "Máquina de café expresso", description: "Para os pequenos-almoços a dois.", priceCents: 18000, isReserved: false, contributedCents: 0, purchaseUrl: "https://www.example.com/maquina-cafe" },
  { id: 3, kind: "item", icon: "bed", name: "Jogo de lençóis de linho", description: "Cama de casal, cor natural.", priceCents: 9500, isReserved: true, contributedCents: 0 },
  { id: 4, kind: "item", icon: "pan", name: "Conjunto de panelas", description: "Inox, cinco peças.", priceCents: 22000, isReserved: false, contributedCents: 0, purchaseUrl: "https://www.example.com/panelas" },
  { id: 6, kind: "item", icon: "vase", name: "Jarra de cerâmica", description: "Feita à mão, em Caldas da Rainha.", priceCents: 4500, isReserved: false, contributedCents: 0 },
  { id: 7, kind: "item", icon: "glasses", name: "Copos de cristal", description: "Seis copos para os jantares de domingo.", priceCents: 7800, isReserved: false, contributedCents: 0 },
];

// Fotos provisórias (public/demo). Substituir pelas fotos verdadeiras do casal.
export const demoCoverPhoto = { src: "/demo/casal-1.jpg", alt: "Maria e João, abraçados" };

export const demoStory = [
  {
    year: "2016",
    title: "O primeiro jantar",
    text: "Conhecemo-nos num jantar de amigos, em Alfama. O João chegou atrasado, sentou-se ao lado da Maria e ficaram a conversar até fecharem o restaurante.",
    photo: { src: "/demo/casal-2.jpg", alt: "Maria e João no primeiro jantar" },
  },
  {
    year: "2019",
    title: "A primeira casa",
    text: "Uma casa pequena, com uma varanda virada para o rio, e o Bacalhau, que apareceu à porta numa noite de chuva e decidiu ficar.",
    photo: { src: "/demo/casal-3.jpg", alt: "Maria e João com o cão Bacalhau" },
  },
  {
    year: "2025",
    title: "O pedido",
    text: "Ao pôr do sol, numa praia da Comporta. O anel esteve escondido três semanas dentro de uma caixa de chá.",
    photo: { src: "/demo/casal-4.jpg", alt: "O pedido de casamento na praia" },
  },
  {
    year: "2027",
    title: "O sim",
    text: "Agora falta o mais importante: tu, connosco, neste dia.",
    photo: { src: "/demo/casal-5.jpg", alt: "Maria e João a sorrir" },
  },
];
