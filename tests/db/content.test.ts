import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asAnon, asUser, createTestDb } from "./supabase-stub";

// Conteúdo que os noivos gerem no painel: criação do casamento, pais,
// receção, fotos, música, história e ícone dos presentes.

const NOIVA = "00000000-0000-0000-0000-0000000000aa"; // conta com email
const ESTRANHO = "00000000-0000-0000-0000-0000000000bb"; // outra conta com email
const CONVIDADO = "00000000-0000-0000-0000-0000000000cc"; // sessão anónima

let db: PGlite;

async function createWedding(userId: string, anonymous = false) {
  return asUser(
    db,
    userId,
    async (tx) => {
      const r = await tx.query<{ id: number }>(
        `select public.create_wedding('ana-e-rui', 'Ana', 'Rui', '2027-09-18 16:00+01', 'Igreja de São Roque', 'Largo Trindade Coelho, Lisboa') as id`,
      );
      return r.rows[0].id;
    },
    { anonymous },
  );
}

beforeEach(async () => {
  db = await createTestDb();
  await db.exec(`
    insert into auth.users (id, is_anonymous) values
      ('${NOIVA}', false), ('${ESTRANHO}', false), ('${CONVIDADO}', true);
  `);
});

describe("criar o casamento", () => {
  it("uma conta com email cria o casamento e fica como noiva/noivo", async () => {
    const id = await createWedding(NOIVA);
    const hosts = await db.query(`select user_id from wedding_hosts where wedding_id = $1`, [id]);
    expect(hosts.rows).toEqual([{ user_id: NOIVA }]);
    const own = await asUser(db, NOIVA, (tx) => tx.query(`update weddings set venue_name = 'Sé de Lisboa' where id = $1`, [id]));
    expect(own.affectedRows).toBe(1);
  });

  it("uma sessão anónima (convidado) não cria casamentos", async () => {
    await expect(createWedding(CONVIDADO, true)).rejects.toThrow(/not_allowed/);
  });

  it("um visitante sem sessão não pode chamar a função", async () => {
    await expect(
      asAnon(db, (tx) => tx.query(`select public.create_wedding('x', 'A', 'B', now(), 'L', 'M')`)),
    ).rejects.toThrow(/permission denied/);
  });

  it("o link (slug) é único", async () => {
    await createWedding(NOIVA);
    await expect(createWedding(ESTRANHO)).rejects.toThrow(/weddings_slug_key/);
  });
});

describe("dados do casamento", () => {
  it("os noivos guardam pais, receção, foto de capa e música; todos leem", async () => {
    const id = await createWedding(NOIVA);
    await asUser(db, NOIVA, (tx) =>
      tx.query(
        `update weddings set
           partner_one_parents = array['Luís Costa', 'Marta Costa'],
           partner_two_parents = array['Jorge Lima'],
           reception_name = 'Quinta do Lago', reception_address = 'Sintra',
           reception_starts_at = '2027-09-18 19:30+01',
           reception_latitude = 38.8, reception_longitude = -9.4,
           cover_photo_path = $2, music_path = $3
         where id = $1`,
        [id, `${id}/capa.jpg`, `${id}/musica.mp3`],
      ),
    );
    const r = await asAnon(db, (tx) =>
      tx.query(`select partner_one_parents, reception_name, cover_photo_path from weddings where id = $1`, [id]),
    );
    expect(r.rows[0]).toEqual({
      partner_one_parents: ["Luís Costa", "Marta Costa"],
      reception_name: "Quinta do Lago",
      cover_photo_path: `${id}/capa.jpg`,
    });
  });

  it("a receção tem as duas coordenadas ou nenhuma", async () => {
    const id = await createWedding(NOIVA);
    await expect(
      asUser(db, NOIVA, (tx) => tx.query(`update weddings set reception_latitude = 38.8 where id = $1`, [id])),
    ).rejects.toThrow(/weddings_reception_coordinates_pair/);
  });

  it("outra conta não altera o casamento", async () => {
    const id = await createWedding(NOIVA);
    const r = await asUser(db, ESTRANHO, (tx) => tx.query(`update weddings set venue_name = 'X' where id = $1`, [id]));
    expect(r.affectedRows).toBe(0);
  });
});

describe("a nossa história", () => {
  it("os noivos criam momentos; qualquer visitante os lê por ordem", async () => {
    const id = await createWedding(NOIVA);
    await asUser(db, NOIVA, (tx) =>
      tx.query(
        `insert into story_moments (wedding_id, year, title, body, sort_order) values
           ($1, '2019', 'A primeira casa', 'Lisboa.', 2),
           ($1, '2016', 'O primeiro jantar', 'Alfama.', 1)`,
        [id],
      ),
    );
    const r = await asAnon(db, (tx) =>
      tx.query(`select year from story_moments where wedding_id = $1 order by sort_order`, [id]),
    );
    expect(r.rows).toEqual([{ year: "2016" }, { year: "2019" }]);
  });

  it("um convidado ou outra conta não escrevem na história", async () => {
    const id = await createWedding(NOIVA);
    await expect(
      asUser(db, ESTRANHO, (tx) =>
        tx.query(`insert into story_moments (wedding_id, year, title) values ($1, '2020', 'Falso')`, [id]),
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      asUser(
        db,
        CONVIDADO,
        (tx) => tx.query(`insert into story_moments (wedding_id, year, title) values ($1, '2020', 'Falso')`, [id]),
        { anonymous: true },
      ),
    ).rejects.toThrow(/row-level security/);
  });
});

describe("presentes", () => {
  it("os noivos escolhem a ilustração do presente", async () => {
    const id = await createWedding(NOIVA);
    const r = await asUser(db, NOIVA, async (tx) => {
      const g = await tx.query<{ id: number }>(
        `insert into gifts (wedding_id, name, icon) values ($1, 'Jarra', 'vase') returning id`,
        [id],
      );
      return tx.query(`update gifts set icon = 'coffee' where id = $1 returning icon`, [g.rows[0].id]);
    });
    expect(r.rows[0]).toEqual({ icon: "coffee" });
  });

  it("só aceita ilustrações conhecidas", async () => {
    const id = await createWedding(NOIVA);
    await expect(
      asUser(db, NOIVA, (tx) => tx.query(`insert into gifts (wedding_id, name, icon) values ($1, 'X', 'foguete')`, [id])),
    ).rejects.toThrow(/gifts_icon_check/);
  });
});

describe("fotos e música do casamento (Storage)", () => {
  it("só os noivos enviam ficheiros para a pasta do casamento", async () => {
    const id = await createWedding(NOIVA);
    await asUser(db, NOIVA, (tx) =>
      tx.query(`insert into storage.objects (bucket_id, name) values ('wedding-media', $1)`, [`${id}/capa.jpg`]),
    );
    await expect(
      asUser(db, ESTRANHO, (tx) =>
        tx.query(`insert into storage.objects (bucket_id, name) values ('wedding-media', $1)`, [`${id}/intruso.jpg`]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("o bucket é público para leitura das fotos do convite", async () => {
    const r = await db.query(`select public from storage.buckets where id = 'wedding-media'`);
    expect(r.rows[0]).toEqual({ public: true });
  });
});
