import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asAnon, asUser, createTestDb } from "./supabase-stub";

// Entrega do casamento: quem o preparou cria um link; os noivos usam-no e
// ficam como únicos noivos.

const FRANCISCO = "00000000-0000-0000-0000-0000000000a1"; // preparou o convite
const NOIVOS = "00000000-0000-0000-0000-0000000000a2"; // conta nova dos noivos
const ESTRANHO = "00000000-0000-0000-0000-0000000000a3"; // outra conta com email
const CONVIDADO = "00000000-0000-0000-0000-0000000000a4"; // sessão anónima

let db: PGlite;
let weddingId: number;

const createLink = (userId = FRANCISCO, id = weddingId) =>
  asUser(db, userId, async (tx) => (await tx.query<{ t: string }>(`select public.create_wedding_handover($1) as t`, [id])).rows[0].t);

const claim = (userId: string, token: string, anonymous = false) =>
  asUser(db, userId, async (tx) => (await tx.query<{ id: number }>(`select public.claim_wedding_handover($1) as id`, [token])).rows[0].id, {
    anonymous,
  });

const hostsOf = async (id = weddingId) =>
  (await db.query<{ user_id: string }>(`select user_id from wedding_hosts where wedding_id = $1 order by user_id`, [id])).rows.map((r) => r.user_id);

beforeEach(async () => {
  db = await createTestDb();
  await db.exec(`
    insert into auth.users (id, is_anonymous) values
      ('${FRANCISCO}', false), ('${NOIVOS}', false), ('${ESTRANHO}', false), ('${CONVIDADO}', true);
  `);
  weddingId = await asUser(db, FRANCISCO, async (tx) =>
    (
      await tx.query<{ id: number }>(
        `select public.create_wedding('ben-e-edvalda', 'Benjamim', 'Edvalda', '2026-12-26 14:00+00', 'O Sobreiro', 'Rio Caldo') as id`,
      )
    ).rows[0].id,
  );
});

describe("link de entrega", () => {
  it("os noivos usam o link e ficam como únicos noivos; quem preparou perde o acesso", async () => {
    const token = await createLink();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(await claim(NOIVOS, token)).toBe(weddingId);
    expect(await hostsOf()).toEqual([NOIVOS]);

    const r = await asUser(db, FRANCISCO, (tx) => tx.query(`update weddings set venue_name = 'X' where id = $1`, [weddingId]));
    expect(r.affectedRows).toBe(0);
  });

  it("o link só serve uma vez", async () => {
    const token = await createLink();
    await claim(NOIVOS, token);
    await expect(claim(ESTRANHO, token)).rejects.toThrow(/handover_invalid/);
    expect(await hostsOf()).toEqual([NOIVOS]);
  });

  it("um link novo substitui o anterior", async () => {
    const first = await createLink();
    const second = await createLink();
    await expect(claim(NOIVOS, first)).rejects.toThrow(/handover_invalid/);
    expect(await claim(NOIVOS, second)).toBe(weddingId);
  });

  it("um link expirado ou cancelado não serve", async () => {
    const token = await createLink();
    await db.query(`update private.wedding_handovers set expires_at = now() - interval '1 minute'`);
    await expect(claim(NOIVOS, token)).rejects.toThrow(/handover_invalid/);

    const again = await createLink();
    await asUser(db, FRANCISCO, (tx) => tx.query(`select public.cancel_wedding_handover($1)`, [weddingId]));
    await expect(claim(NOIVOS, again)).rejects.toThrow(/handover_invalid/);
    expect(await hostsOf()).toEqual([FRANCISCO]);
  });

  it("só os noivos atuais criam o link", async () => {
    await expect(createLink(ESTRANHO)).rejects.toThrow(/not_allowed/);
  });

  it("uma sessão anónima (convidado) não pode usar o link", async () => {
    const token = await createLink();
    await expect(claim(CONVIDADO, token, true)).rejects.toThrow(/not_allowed/);
  });

  it("uma conta que já gere outro casamento não pode usar o link", async () => {
    await asUser(db, ESTRANHO, (tx) =>
      tx.query(`select public.create_wedding('outro', 'A', 'B', now(), 'L', 'M')`),
    );
    const token = await createLink();
    await expect(claim(ESTRANHO, token)).rejects.toThrow(/already_host/);
  });

  it("ninguém lê os links pela API e o código nunca é guardado", async () => {
    const token = await createLink();
    await expect(asAnon(db, (tx) => tx.query(`select * from private.wedding_handovers`))).rejects.toThrow(/permission denied/);
    await expect(asUser(db, FRANCISCO, (tx) => tx.query(`select * from private.wedding_handovers`))).rejects.toThrow(/permission denied/);
    const stored = await db.query<{ token_hash: string }>(`select token_hash from private.wedding_handovers`);
    expect(stored.rows[0].token_hash).not.toBe(token);
  });

  it("o painel vê quando o link expira; outra conta não", async () => {
    await createLink();
    const mine = await asUser(db, FRANCISCO, (tx) => tx.query<{ e: string | null }>(`select public.wedding_handover_expires_at($1) as e`, [weddingId]));
    expect(mine.rows[0].e).not.toBeNull();
    const other = await asUser(db, ESTRANHO, (tx) => tx.query<{ e: string | null }>(`select public.wedding_handover_expires_at($1) as e`, [weddingId]));
    expect(other.rows[0].e).toBeNull();
  });
});
