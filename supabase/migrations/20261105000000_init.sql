-- =====================================================================
-- Convite de Casamento — esquema inicial
-- Termos: ver GLOSSARY.md. Decisões: ver docs/adr/.
-- =====================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.rsvp_status as enum ('pending', 'attending', 'declined');
create type public.memory_kind as enum ('photo', 'video');

-- ---------------------------------------------------------------------
-- Casamento (ADR 0001: preparado para vários casamentos)
-- ---------------------------------------------------------------------
create table public.weddings (
  id               bigint generated always as identity primary key,
  slug             text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  partner_one_name text not null check (length(btrim(partner_one_name)) between 1 and 80),
  partner_two_name text not null check (length(btrim(partner_two_name)) between 1 and 80),
  starts_at        timestamptz not null,
  time_zone        text not null default 'Europe/Lisbon',
  venue_name       text not null check (length(btrim(venue_name)) between 1 and 120),
  venue_address    text not null check (length(btrim(venue_address)) between 1 and 300),
  venue_latitude   double precision check (venue_latitude between -90 and 90),
  venue_longitude  double precision check (venue_longitude between -180 and 180),
  welcome_message  text check (length(welcome_message) <= 2000),
  rsvp_deadline    date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- coordenadas existem as duas ou nenhuma (ADR 0004)
  constraint weddings_venue_coordinates_pair
    check ((venue_latitude is null) = (venue_longitude is null))
);

-- Noivos: utilizadores com conta (email) que gerem um casamento.
create table public.wedding_hosts (
  wedding_id bigint not null references public.weddings (id) on delete cascade,
  user_id    uuid   not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);
create index wedding_hosts_user_id_idx on public.wedding_hosts (user_id);

-- ---------------------------------------------------------------------
-- Convidados (ADR 0003: sessão anónima)
-- ---------------------------------------------------------------------
create table public.guests (
  id           bigint generated always as identity primary key,
  wedding_id   bigint not null references public.weddings (id) on delete cascade,
  user_id      uuid   not null references auth.users (id) on delete cascade,
  full_name    text   not null check (length(btrim(full_name)) between 2 and 100),
  rsvp_status  public.rsvp_status not null default 'pending',
  message      text check (length(message) <= 1000),
  responded_at timestamptz,
  created_at   timestamptz not null default now(),
  -- um convidado por sessão e por casamento
  constraint guests_wedding_user_unique unique (wedding_id, user_id),
  -- permite FKs compostas que garantem o mesmo casamento
  constraint guests_id_wedding_unique unique (id, wedding_id)
);
create index guests_user_id_idx on public.guests (user_id);

-- ---------------------------------------------------------------------
-- Lista de presentes
-- ---------------------------------------------------------------------
create table public.gifts (
  id           bigint generated always as identity primary key,
  wedding_id   bigint not null references public.weddings (id) on delete cascade,
  name         text   not null check (length(btrim(name)) between 1 and 120),
  description  text   check (length(description) <= 1000),
  image_url    text   check (image_url ~ '^https://'),
  purchase_url text   check (purchase_url ~ '^https://'),
  price_cents  integer check (price_cents >= 0),       -- euros × 100, nunca float
  sort_order   integer not null default 0,
  is_reserved  boolean not null default false,          -- mantido por trigger
  created_at   timestamptz not null default now(),
  constraint gifts_id_wedding_unique unique (id, wedding_id)
);
create index gifts_wedding_sort_idx on public.gifts (wedding_id, sort_order, id);

-- Reserva (ADR 0002: no máximo uma por presente, garantido aqui)
create table public.gift_reservations (
  id         bigint generated always as identity primary key,
  wedding_id bigint not null,
  gift_id    bigint not null,
  guest_id   bigint not null,
  created_at timestamptz not null default now(),
  constraint gift_reservations_gift_unique unique (gift_id),
  constraint gift_reservations_gift_fk
    foreign key (gift_id, wedding_id) references public.gifts (id, wedding_id) on delete cascade,
  constraint gift_reservations_guest_fk
    foreign key (guest_id, wedding_id) references public.guests (id, wedding_id) on delete cascade
);
create index gift_reservations_guest_id_idx   on public.gift_reservations (guest_id);
create index gift_reservations_wedding_id_idx on public.gift_reservations (wedding_id);

-- ---------------------------------------------------------------------
-- Memórias (fotos e vídeos dos convidados)
-- Ficheiro no Storage em: memories/{wedding_id}/{guest_id}/{nome}
-- ---------------------------------------------------------------------
create table public.memories (
  id                bigint generated always as identity primary key,
  wedding_id        bigint not null,
  guest_id          bigint not null,
  storage_path      text   not null unique,
  kind              public.memory_kind not null,
  mime_type         text   not null check (mime_type ~ '^(image|video)/'),
  size_bytes        bigint not null check (size_bytes > 0),
  original_filename text   check (length(original_filename) <= 255),
  created_at        timestamptz not null default now(),
  constraint memories_guest_fk
    foreign key (guest_id, wedding_id) references public.guests (id, wedding_id) on delete cascade,
  -- o caminho tem de começar pelo casamento e pelo convidado donos do registo
  constraint memories_path_matches_owner
    check (storage_path like wedding_id::text || '/' || guest_id::text || '/%')
);
create index memories_wedding_created_idx on public.memories (wedding_id, created_at desc);
create index memories_guest_id_idx        on public.memories (guest_id);

-- ---------------------------------------------------------------------
-- Funções auxiliares (schema privado, não exposto pela API)
-- ---------------------------------------------------------------------
create or replace function private.is_wedding_host(p_wedding_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.wedding_hosts
    where wedding_id = p_wedding_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.current_guest_id(p_wedding_id bigint)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.guests
  where wedding_id = p_wedding_id
    and user_id = (select auth.uid());
$$;

revoke all on function private.is_wedding_host(bigint)  from public;
revoke all on function private.current_guest_id(bigint) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_wedding_host(bigint)  to authenticated;
grant execute on function private.current_guest_id(bigint) to authenticated;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger weddings_touch_updated_at
  before update on public.weddings
  for each row execute function private.touch_updated_at();

create or replace function private.set_responded_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.rsvp_status is distinct from old.rsvp_status then
    new.responded_at := case when new.rsvp_status = 'pending' then null else now() end;
  end if;
  return new;
end;
$$;

create trigger guests_set_responded_at
  before update on public.guests
  for each row execute function private.set_responded_at();

-- Mantém gifts.is_reserved, para a lista mostrar disponibilidade
-- sem revelar quem reservou.
create or replace function private.sync_gift_is_reserved()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.gifts set is_reserved = true  where id = new.gift_id;
  elsif tg_op = 'DELETE' then
    update public.gifts set is_reserved = false where id = old.gift_id;
  end if;
  return null;
end;
$$;

create trigger gift_reservations_sync_gift
  after insert or delete on public.gift_reservations
  for each row execute function private.sync_gift_is_reserved();

-- ---------------------------------------------------------------------
-- Privilégios por coluna (o que o RLS não controla)
-- ---------------------------------------------------------------------
-- Convidados só podem alterar o nome, a resposta e a mensagem.
revoke update on public.guests from anon, authenticated;
grant  update (full_name, rsvp_status, message) on public.guests to authenticated;
-- is_reserved é só da base de dados.
revoke update on public.gifts from anon, authenticated;
grant  update (name, description, image_url, purchase_url, price_cents, sort_order)
  on public.gifts to authenticated;
-- Reservas e memórias não se editam: criam-se ou apagam-se.
revoke update on public.gift_reservations from anon, authenticated;
revoke update on public.memories          from anon, authenticated;
-- Visitantes sem sessão só leem.
revoke insert, update, delete on all tables in schema public from anon;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.weddings          enable row level security;
alter table public.wedding_hosts     enable row level security;
alter table public.guests            enable row level security;
alter table public.gifts             enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.memories          enable row level security;

-- weddings: o convite é público; só os noivos editam.
create policy weddings_select_public on public.weddings
  for select to anon, authenticated using (true);
create policy weddings_update_hosts on public.weddings
  for update to authenticated
  using ((select private.is_wedding_host(id)))
  with check ((select private.is_wedding_host(id)));

-- wedding_hosts: cada noivo vê as suas ligações.
create policy wedding_hosts_select_own on public.wedding_hosts
  for select to authenticated using (user_id = (select auth.uid()));

-- guests
create policy guests_select_self_or_host on public.guests
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_wedding_host(wedding_id)));
create policy guests_insert_self on public.guests
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy guests_update_self on public.guests
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy guests_delete_host on public.guests
  for delete to authenticated
  using ((select private.is_wedding_host(wedding_id)));

-- gifts: lista pública; só os noivos gerem.
create policy gifts_select_public on public.gifts
  for select to anon, authenticated using (true);
create policy gifts_insert_host on public.gifts
  for insert to authenticated
  with check ((select private.is_wedding_host(wedding_id)));
create policy gifts_update_host on public.gifts
  for update to authenticated
  using ((select private.is_wedding_host(wedding_id)))
  with check ((select private.is_wedding_host(wedding_id)));
create policy gifts_delete_host on public.gifts
  for delete to authenticated
  using ((select private.is_wedding_host(wedding_id)));

-- gift_reservations: o convidado vê e cancela as suas; os noivos veem todas.
create policy gift_reservations_select on public.gift_reservations
  for select to authenticated
  using (guest_id = (select private.current_guest_id(wedding_id))
         or (select private.is_wedding_host(wedding_id)));
create policy gift_reservations_insert_guest on public.gift_reservations
  for insert to authenticated
  with check (guest_id = (select private.current_guest_id(wedding_id)));
create policy gift_reservations_delete on public.gift_reservations
  for delete to authenticated
  using (guest_id = (select private.current_guest_id(wedding_id))
         or (select private.is_wedding_host(wedding_id)));

-- memories: o convidado envia e vê as suas; a galeria completa é dos noivos.
create policy memories_select on public.memories
  for select to authenticated
  using (guest_id = (select private.current_guest_id(wedding_id))
         or (select private.is_wedding_host(wedding_id)));
create policy memories_insert_guest on public.memories
  for insert to authenticated
  with check (guest_id = (select private.current_guest_id(wedding_id)));
create policy memories_delete on public.memories
  for delete to authenticated
  using (guest_id = (select private.current_guest_id(wedding_id))
         or (select private.is_wedding_host(wedding_id)));

-- ---------------------------------------------------------------------
-- Estatísticas para o painel dos noivos (respeita RLS: security invoker)
-- ---------------------------------------------------------------------
create or replace function public.wedding_stats(p_wedding_id bigint)
returns table (
  guests_total          bigint,
  guests_attending      bigint,
  guests_declined       bigint,
  guests_pending        bigint,
  gifts_total           bigint,
  gifts_reserved        bigint,
  gifts_value_cents     bigint,
  gifts_reserved_cents  bigint,
  memories_total        bigint,
  memories_photos       bigint,
  memories_videos       bigint,
  memories_bytes        bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select count(*) from public.guests g where g.wedding_id = p_wedding_id),
    (select count(*) from public.guests g where g.wedding_id = p_wedding_id and g.rsvp_status = 'attending'),
    (select count(*) from public.guests g where g.wedding_id = p_wedding_id and g.rsvp_status = 'declined'),
    (select count(*) from public.guests g where g.wedding_id = p_wedding_id and g.rsvp_status = 'pending'),
    (select count(*) from public.gifts  f where f.wedding_id = p_wedding_id),
    (select count(*) from public.gifts  f where f.wedding_id = p_wedding_id and f.is_reserved),
    (select coalesce(sum(f.price_cents), 0) from public.gifts f where f.wedding_id = p_wedding_id),
    (select coalesce(sum(f.price_cents), 0) from public.gifts f where f.wedding_id = p_wedding_id and f.is_reserved),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id and m.kind = 'photo'),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id and m.kind = 'video'),
    (select coalesce(sum(m.size_bytes), 0) from public.memories m where m.wedding_id = p_wedding_id);
$$;

revoke all on function public.wedding_stats(bigint) from public, anon;
grant execute on function public.wedding_stats(bigint) to authenticated;
