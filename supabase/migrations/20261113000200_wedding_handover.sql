-- =====================================================================
-- Entrega do casamento aos noivos (13-11-2026)
--
-- Quem preparou o convite cria um link de entrega no painel. Os noivos
-- abrem-no, criam a sua conta com email e palavra-passe e ficam como
-- únicos noivos do casamento; a conta de quem o preparou deixa de ter acesso.
--
-- Guarda-se só o hash do código (sha256), nunca o código. O link vale 14 dias,
-- serve uma vez e um link novo substitui o anterior.
-- =====================================================================

create table private.wedding_handovers (
  wedding_id bigint primary key references public.weddings (id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
-- Só as funções abaixo (security definer) leem e escrevem aqui.
alter table private.wedding_handovers enable row level security;
revoke all on private.wedding_handovers from public, anon, authenticated;

create or replace function private.handover_hash(p_token text)
returns text language sql immutable set search_path = '' as $$
  select encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
$$;
revoke all on function private.handover_hash(text) from public;

-- Os noivos atuais criam (ou renovam) o link de entrega. Devolve o código.
create or replace function public.create_wedding_handover(p_wedding_id bigint)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_token text;
begin
  if v_uid is null or not private.is_wedding_host(p_wedding_id) then
    raise exception 'not_allowed: só os noivos podem entregar o casamento' using errcode = '42501';
  end if;

  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  insert into private.wedding_handovers (wedding_id, token_hash, created_by, expires_at)
  values (p_wedding_id, private.handover_hash(v_token), v_uid, now() + interval '14 days')
  on conflict (wedding_id) do update
    set token_hash = excluded.token_hash,
        created_by = excluded.created_by,
        created_at = now(),
        expires_at = excluded.expires_at;

  return v_token;
end;
$$;

-- Os noivos atuais cancelam o link de entrega.
create or replace function public.cancel_wedding_handover(p_wedding_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_wedding_host(p_wedding_id) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  delete from private.wedding_handovers where wedding_id = p_wedding_id;
end;
$$;

-- Quando expira o link ativo (null se não houver), para o painel.
create or replace function public.wedding_handover_expires_at(p_wedding_id bigint)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select expires_at from private.wedding_handovers
  where wedding_id = p_wedding_id and expires_at > now()
    and private.is_wedding_host(p_wedding_id);
$$;

-- Os noivos usam o link: ficam como únicos noivos. Devolve o id do casamento.
create or replace function public.claim_wedding_handover(p_token text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_wid bigint;
begin
  if v_uid is null or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'not_allowed: é preciso uma conta com email' using errcode = '42501';
  end if;

  select wedding_id into v_wid
  from private.wedding_handovers
  where token_hash = private.handover_hash(coalesce(p_token, ''))
    and expires_at > now()
  for update;
  if v_wid is null then
    raise exception 'handover_invalid: o link já foi usado, foi cancelado ou expirou'
      using errcode = 'P0002';
  end if;

  if exists (select 1 from public.wedding_hosts where user_id = v_uid and wedding_id <> v_wid) then
    raise exception 'already_host: esta conta já gere outro casamento' using errcode = '42501';
  end if;

  delete from public.wedding_hosts where wedding_id = v_wid and user_id <> v_uid;
  insert into public.wedding_hosts (wedding_id, user_id) values (v_wid, v_uid)
  on conflict do nothing;
  delete from private.wedding_handovers where wedding_id = v_wid;

  return v_wid;
end;
$$;

revoke all on function public.create_wedding_handover(bigint)     from public, anon;
revoke all on function public.cancel_wedding_handover(bigint)     from public, anon;
revoke all on function public.wedding_handover_expires_at(bigint) from public, anon;
revoke all on function public.claim_wedding_handover(text)        from public, anon;
grant execute on function public.create_wedding_handover(bigint)     to authenticated;
grant execute on function public.cancel_wedding_handover(bigint)     to authenticated;
grant execute on function public.wedding_handover_expires_at(bigint) to authenticated;
grant execute on function public.claim_wedding_handover(text)        to authenticated;
