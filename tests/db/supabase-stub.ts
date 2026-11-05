import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Cria um Postgres em memória com o mínimo do Supabase que as migrações usam:
 * papéis anon/authenticated, auth.users, auth.uid() e storage.*.
 * Serve para testar o esquema e o RLS sem Docker nem conta no Supabase.
 */
export async function createTestDb() {
  const db = new PGlite();

  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    create table auth.users (
      id uuid primary key,
      is_anonymous boolean not null default false
    );
    create function auth.uid() returns uuid language sql stable as $$
      select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;

    create schema storage;
    create table storage.buckets (
      id text primary key, name text, public boolean,
      file_size_limit bigint, allowed_mime_types text[]
    );
    create table storage.objects (
      id bigint generated always as identity primary key,
      bucket_id text references storage.buckets (id),
      name text not null
    );
    create function storage.foldername(name text) returns text[] language sql immutable as $$
      select (string_to_array(name, '/'))[1 : array_length(string_to_array(name, '/'), 1) - 1]
    $$;
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon, authenticated;
    grant select, insert, delete on storage.objects to authenticated;

    -- Igual ao Supabase: as tabelas novas em public ficam acessíveis à API,
    -- e é o RLS que decide o que cada um vê.
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  `);

  const dir = join(__dirname, "../../supabase/migrations");
  for (const file of readdirSync(dir).sort()) {
    await db.exec(readFileSync(join(dir, file), "utf8"));
  }

  return db;
}

/** Executa `fn` como um utilizador com sessão (convidado anónimo ou noivo). */
export async function asUser<T>(
  db: PGlite,
  userId: string,
  fn: (tx: Pick<PGlite, "query" | "exec">) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify({ sub: userId, role: "authenticated" }),
    ]);
    await tx.exec(`set local role authenticated`);
    return fn(tx);
  });
}

/** Executa `fn` como visitante sem sessão. */
export async function asAnon<T>(
  db: PGlite,
  fn: (tx: Pick<PGlite, "query" | "exec">) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role anon`);
    return fn(tx);
  });
}
