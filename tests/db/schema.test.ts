import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asAnon, asUser, createTestDb } from "./supabase-stub";

const NOIVO = "00000000-0000-0000-0000-00000000000a";
const ANA = "00000000-0000-0000-0000-000000000001"; // convidada
const RUI = "00000000-0000-0000-0000-000000000002"; // convidado
const OUTRO_NOIVO = "00000000-0000-0000-0000-00000000000b";
const DESCONHECIDO = "00000000-0000-0000-0000-000000000009"; // sessão sem registo como convidado

let db: PGlite;
let weddingId: number;
let otherWeddingId: number;
let giftId: number;
let otherGiftId: number;
let moneyGiftId: number;

async function registerGuest(userId: string, name: string, wid = weddingId) {
  return asUser(db, userId, async (tx) => {
    const r = await tx.query<{ id: number }>(
      `insert into guests (wedding_id, user_id, full_name) values ($1, $2, $3) returning id`,
      [wid, userId, name],
    );
    return r.rows[0].id;
  });
}

beforeEach(async () => {
  db = await createTestDb();
  await db.exec(`
    insert into auth.users (id, is_anonymous) values
      ('${NOIVO}', false), ('${OUTRO_NOIVO}', false), ('${ANA}', true), ('${RUI}', true),
      ('${DESCONHECIDO}', true);
  `);
  const w = await db.query<{ id: number }>(`
    insert into weddings (slug, partner_one_name, partner_two_name, starts_at, venue_name, venue_address)
    values ('ana-e-joao', 'Maria', 'João', '2027-06-12 16:00+01', 'Quinta da Aveleda', 'Rua da Aveleda 2, Penafiel'),
           ('outro-casal', 'Sara', 'Tiago', '2027-09-01 15:00+01', 'Quinta X', 'Lisboa')
    returning id`);
  weddingId = w.rows[0].id;
  otherWeddingId = w.rows[1].id;
  await db.query(`insert into wedding_hosts (wedding_id, user_id) values ($1, $2), ($3, $4)`, [
    weddingId, NOIVO, otherWeddingId, OUTRO_NOIVO,
  ]);
  const g = await db.query<{ id: number }>(
    `insert into gifts (wedding_id, name, price_cents) values ($1, 'Máquina de café', 12000), ($1, 'Jogo de toalhas', 4500), ($2, 'Torradeira', 3000) returning id`,
    [weddingId, otherWeddingId],
  );
  giftId = g.rows[0].id;
  otherGiftId = g.rows[2].id;
  const m = await db.query<{ id: number }>(
    `insert into gifts (wedding_id, kind, name, price_cents) values ($1, 'money', 'Voo da lua de mel', 150000) returning id`,
    [weddingId],
  );
  moneyGiftId = m.rows[0].id;
  await db.query(`update weddings set max_companions = 2 where id = $1`, [weddingId]);
});

describe("convite público", () => {
  it("um visitante sem sessão vê o casamento e a lista de presentes", async () => {
    const rows = await asAnon(db, async (tx) => {
      const w = await tx.query(`select partner_one_name from weddings where id = $1`, [weddingId]);
      const g = await tx.query(`select name, is_reserved from gifts where wedding_id = $1`, [weddingId]);
      return { w: w.rows, g: g.rows };
    });
    expect(rows.w).toHaveLength(1);
    expect(rows.g).toHaveLength(3); // 2 artigos + 1 presente em dinheiro
  });

  it("um visitante sem sessão não consegue registar-se nem alterar nada", async () => {
    await expect(
      asAnon(db, (tx) =>
        tx.query(`insert into guests (wedding_id, user_id, full_name) values ($1, $2, 'Hacker')`, [weddingId, ANA]),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asAnon(db, (tx) => tx.query(`update weddings set venue_name = 'X'`)),
    ).rejects.toThrow(/permission denied/);
  });

  it("só os noivos alteram os dados do casamento", async () => {
    await registerGuest(ANA, "Ana Silva");
    const byGuest = await asUser(db, ANA, (tx) =>
      tx.query(`update weddings set venue_name = 'Hackeado' where id = $1`, [weddingId]),
    );
    expect(byGuest.affectedRows).toBe(0);
    const byHost = await asUser(db, NOIVO, (tx) =>
      tx.query(`update weddings set venue_name = 'Quinta Nova' where id = $1`, [weddingId]),
    );
    expect(byHost.affectedRows).toBe(1);
  });
});

describe("convidados e resposta", () => {
  it("o convidado regista-se com o seu nome, mas não em nome de outra pessoa", async () => {
    await registerGuest(ANA, "Ana Silva");
    await expect(
      asUser(db, RUI, (tx) =>
        tx.query(`insert into guests (wedding_id, user_id, full_name) values ($1, $2, 'Falso')`, [weddingId, ANA]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("a mesma sessão não se regista duas vezes no mesmo casamento", async () => {
    await registerGuest(ANA, "Ana Silva");
    await expect(registerGuest(ANA, "Ana outra vez")).rejects.toThrow(/guests_wedding_user_unique/);
  });

  it("confirmar a presença regista a data da resposta", async () => {
    await registerGuest(ANA, "Ana Silva");
    const r = await asUser(db, ANA, (tx) =>
      tx.query<{ responded_at: Date | null }>(
        `update guests set rsvp_status = 'attending' where user_id = $1 returning responded_at`,
        [ANA],
      ),
    );
    expect(r.rows[0].responded_at).not.toBeNull();
  });

  it("o convidado não muda de casamento nem de dono", async () => {
    await registerGuest(ANA, "Ana Silva");
    await expect(
      asUser(db, ANA, (tx) => tx.query(`update guests set wedding_id = $1`, [otherWeddingId])),
    ).rejects.toThrow(/permission denied/);
  });

  it("cada convidado só se vê a si próprio; os noivos veem todos", async () => {
    await registerGuest(ANA, "Ana Silva");
    await registerGuest(RUI, "Rui Costa");
    const seenByAna = await asUser(db, ANA, (tx) => tx.query(`select full_name from guests`));
    const seenByHost = await asUser(db, NOIVO, (tx) => tx.query(`select full_name from guests`));
    const seenByOtherHost = await asUser(db, OUTRO_NOIVO, (tx) => tx.query(`select full_name from guests`));
    expect(seenByAna.rows).toEqual([{ full_name: "Ana Silva" }]);
    expect(seenByHost.rows).toHaveLength(2);
    expect(seenByOtherHost.rows).toHaveLength(0);
  });
});

describe("reserva de presentes", () => {
  async function reserve(userId: string, guestId: number, gift = giftId, wid = weddingId) {
    return asUser(db, userId, (tx) =>
      tx.query(`insert into gift_reservations (wedding_id, gift_id, guest_id) values ($1, $2, $3)`, [wid, gift, guestId]),
    );
  }

  it("um presente não pode ser reservado duas vezes", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await reserve(ANA, ana);
    await expect(reserve(RUI, rui)).rejects.toThrow(/gift_reservations_gift_unique/);
  });

  it("a lista mostra o presente como reservado sem revelar quem reservou", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await reserve(ANA, ana);
    const asRui = await asUser(db, RUI, async (tx) => ({
      gift: (await tx.query(`select is_reserved from gifts where id = $1`, [giftId])).rows[0],
      reservations: (await tx.query(`select * from gift_reservations`)).rows,
    }));
    expect(asRui.gift).toEqual({ is_reserved: true });
    expect(asRui.reservations).toHaveLength(0);
  });

  it("cancelar a reserva liberta o presente", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await reserve(ANA, ana);
    await asUser(db, ANA, (tx) => tx.query(`delete from gift_reservations where gift_id = $1`, [giftId]));
    const r = await db.query(`select is_reserved from gifts where id = $1`, [giftId]);
    expect(r.rows[0]).toEqual({ is_reserved: false });
  });

  it("um convidado não reserva em nome de outro", async () => {
    await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await expect(reserve(ANA, rui)).rejects.toThrow(/row-level security/);
  });

  it("não é possível reservar um presente de outro casamento", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await expect(reserve(ANA, ana, otherGiftId)).rejects.toThrow(/gift_reservations_gift_fk/);
  });

  it("o convidado não consegue marcar um presente como reservado à mão", async () => {
    await registerGuest(ANA, "Ana Silva");
    await expect(
      asUser(db, ANA, (tx) => tx.query(`update gifts set is_reserved = true where id = $1`, [giftId])),
    ).rejects.toThrow(/permission denied/);
  });

  it("os noivos veem quem reservou cada presente", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await reserve(ANA, ana);
    const r = await asUser(db, NOIVO, (tx) =>
      tx.query(`select g.name, gu.full_name from gift_reservations r
                join gifts g on g.id = r.gift_id join guests gu on gu.id = r.guest_id`),
    );
    expect(r.rows).toEqual([{ name: "Máquina de café", full_name: "Ana Silva" }]);
  });
});

describe("memórias", () => {
  async function addMemory(userId: string, guestId: number, path: string) {
    return asUser(db, userId, async (tx) => {
      await tx.query(`insert into storage.objects (bucket_id, name) values ('memories', $1)`, [path]);
      await tx.query(
        `insert into memories (wedding_id, guest_id, storage_path, kind, mime_type, size_bytes)
         values ($1, $2, $3, 'photo', 'image/jpeg', 2048)`,
        [weddingId, guestId, path],
      );
    });
  }

  it("todos os convidados do casamento veem a galeria; quem não é convidado não vê", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await addMemory(ANA, ana, `${weddingId}/${ana}/foto1.jpg`);
    await addMemory(RUI, rui, `${weddingId}/${rui}/foto2.jpg`);

    const count = (userId: string) =>
      asUser(db, userId, async (tx) => ({
        rows: (await tx.query(`select 1 from memories`)).rows.length,
        files: (await tx.query(`select 1 from storage.objects`)).rows.length,
      }));
    expect(await count(ANA)).toEqual({ rows: 2, files: 2 });
    expect(await count(NOIVO)).toEqual({ rows: 2, files: 2 });
    expect(await count(OUTRO_NOIVO)).toEqual({ rows: 0, files: 0 });
    expect(await count(DESCONHECIDO)).toEqual({ rows: 0, files: 0 });
  });

  it("um convidado não apaga as memórias de outro; os noivos podem", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await registerGuest(RUI, "Rui Costa");
    await addMemory(ANA, ana, `${weddingId}/${ana}/foto1.jpg`);
    const byRui = await asUser(db, RUI, (tx) => tx.query(`delete from memories`));
    expect(byRui.affectedRows).toBe(0);
    const byHost = await asUser(db, NOIVO, (tx) => tx.query(`delete from memories`));
    expect(byHost.affectedRows).toBe(1);
  });

  it("o convidado não envia ficheiros para a pasta de outro convidado", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await expect(addMemory(ANA, ana, `${weddingId}/${rui}/intruso.jpg`)).rejects.toThrow(/row-level security/);
  });
});

describe("dados de exemplo", () => {
  it("o seed.sql carrega sem erros", async () => {
    const fresh = await createTestDb();
    const { readFileSync } = await import("node:fs");
    await fresh.exec(readFileSync(new URL("../../supabase/seed.sql", import.meta.url), "utf8"));
    const r = await fresh.query(`select count(*)::int as n from gifts`);
    expect(r.rows[0]).toEqual({ n: 5 });
    const p = await fresh.query(`select count(*)::int as n from wedding_payment_details`);
    expect(p.rows[0]).toEqual({ n: 1 });
  });
});

describe("presentes em dinheiro", () => {
  async function contribute(userId: string, guestId: number, amount: number, gift = moneyGiftId) {
    return asUser(db, userId, (tx) =>
      tx.query(
        `insert into gift_contributions (wedding_id, gift_id, guest_id, amount_cents, payment_method)
         values ($1, $2, $3, $4, 'mbway')`,
        [weddingId, gift, guestId, amount],
      ),
    );
  }

  it("vários convidados contribuem para o mesmo presente e a lista mostra o total", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await contribute(ANA, ana, 5000);
    await contribute(RUI, rui, 7500);
    await contribute(ANA, ana, 2500);
    const r = await asAnon(db, (tx) =>
      tx.query(`select contributed_cents from gifts where id = $1`, [moneyGiftId]),
    );
    expect(r.rows[0]).toEqual({ contributed_cents: 15000 });
  });

  it("cada convidado vê só as suas contribuições; os noivos veem todas", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await contribute(ANA, ana, 5000);
    await contribute(RUI, rui, 7500);
    const seen = (u: string) => asUser(db, u, (tx) => tx.query(`select amount_cents from gift_contributions`));
    expect((await seen(ANA)).rows).toEqual([{ amount_cents: 5000 }]);
    expect((await seen(NOIVO)).rows).toHaveLength(2);
  });

  it("um presente em dinheiro não se reserva, e um artigo não recebe contribuições", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await expect(
      asUser(db, ANA, (tx) =>
        tx.query(`insert into gift_reservations (wedding_id, gift_id, guest_id) values ($1, $2, $3)`, [weddingId, moneyGiftId, ana]),
      ),
    ).rejects.toThrow(/gift_reservations_gift_fk/);
    await expect(contribute(ANA, ana, 5000, giftId)).rejects.toThrow(/gift_contributions_gift_fk/);
  });

  it("só os noivos confirmam a receção; depois disso o convidado já não desiste", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await contribute(ANA, ana, 5000);
    const byGuest = await asUser(db, ANA, (tx) => tx.query(`update gift_contributions set received_at = now()`));
    expect(byGuest.affectedRows).toBe(0);
    const byHost = await asUser(db, NOIVO, (tx) => tx.query(`update gift_contributions set received_at = now()`));
    expect(byHost.affectedRows).toBe(1);
    const cancel = await asUser(db, ANA, (tx) => tx.query(`delete from gift_contributions`));
    expect(cancel.affectedRows).toBe(0);
  });

  it("o convidado não altera o valor depois de contribuir", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    await contribute(ANA, ana, 5000);
    await expect(
      asUser(db, ANA, (tx) => tx.query(`update gift_contributions set amount_cents = 1`)),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("dados de pagamento dos noivos", () => {
  beforeEach(async () => {
    await asUser(db, NOIVO, (tx) =>
      tx.query(
        `insert into wedding_payment_details (wedding_id, holder_name, iban, mbway_phone)
         values ($1, 'Maria e João', 'PT50000201231234567890154', '+351912345678')`,
        [weddingId],
      ),
    );
  });

  it("só os convidados registados e os noivos veem o IBAN e o MB WAY", async () => {
    await registerGuest(ANA, "Ana Silva");
    const read = (u: string) => asUser(db, u, (tx) => tx.query(`select iban from wedding_payment_details`));
    expect((await read(ANA)).rows).toHaveLength(1);
    expect((await read(NOIVO)).rows).toHaveLength(1);
    expect((await read(DESCONHECIDO)).rows).toHaveLength(0);
    await expect(
      asAnon(db, (tx) => tx.query(`select iban from wedding_payment_details`)),
    ).rejects.toThrow(/permission denied/);
  });

  it("um convidado não altera os dados de pagamento", async () => {
    await registerGuest(ANA, "Ana Silva");
    const r = await asUser(db, ANA, (tx) =>
      tx.query(`update wedding_payment_details set iban = 'PT50999999999999999999999'`),
    );
    expect(r.affectedRows).toBe(0);
  });
});

describe("acompanhantes", () => {
  it("o convidado confirma com acompanhantes até ao máximo definido pelos noivos", async () => {
    await registerGuest(ANA, "Ana Silva");
    const r = await asUser(db, ANA, (tx) =>
      tx.query(`update guests set rsvp_status = 'attending', companions = 2 returning companions`),
    );
    expect(r.rows[0]).toEqual({ companions: 2 });
  });

  it("não é possível trazer mais acompanhantes do que o máximo", async () => {
    await registerGuest(ANA, "Ana Silva");
    await expect(
      asUser(db, ANA, (tx) => tx.query(`update guests set rsvp_status = 'attending', companions = 3`)),
    ).rejects.toThrow(/companions_exceed_limit/);
  });

  it("ao recusar o convite, os acompanhantes passam a zero", async () => {
    await registerGuest(ANA, "Ana Silva");
    await asUser(db, ANA, (tx) => tx.query(`update guests set rsvp_status = 'attending', companions = 2`));
    const r = await asUser(db, ANA, (tx) =>
      tx.query(`update guests set rsvp_status = 'declined' returning companions`),
    );
    expect(r.rows[0]).toEqual({ companions: 0 });
  });
});

describe("estatísticas do painel", () => {
  it("os noivos veem os totais de respostas, pessoas, presentes, contribuições e memórias", async () => {
    const ana = await registerGuest(ANA, "Ana Silva");
    const rui = await registerGuest(RUI, "Rui Costa");
    await asUser(db, ANA, (tx) =>
      tx.query(`update guests set rsvp_status = 'attending', companions = 1 where user_id = $1`, [ANA]),
    );
    await asUser(db, ANA, (tx) =>
      tx.query(`insert into gift_reservations (wedding_id, gift_id, guest_id) values ($1, $2, $3)`, [weddingId, giftId, ana]),
    );
    await asUser(db, RUI, (tx) =>
      tx.query(
        `insert into gift_contributions (wedding_id, gift_id, guest_id, amount_cents, payment_method)
         values ($1, $2, $3, 10000, 'bank_transfer')`,
        [weddingId, moneyGiftId, rui],
      ),
    );
    const s = await asUser(db, NOIVO, (tx) => tx.query(`select * from wedding_stats($1)`, [weddingId]));
    expect(s.rows[0]).toMatchObject({
      guests_total: 2, guests_attending: 1, guests_pending: 1, guests_declined: 0,
      people_attending: 2,
      items_total: 2, items_reserved: 1, items_value_cents: 16500, items_reserved_cents: 12000,
      money_gifts_total: 1, contributions_total: 1, contributed_cents: 10000, received_cents: 0,
      memories_total: 0,
    });
  });
});
