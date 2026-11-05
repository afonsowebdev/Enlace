-- =====================================================================
-- Decisões dos noivos (05-11-2026):
--  1. Presentes em dinheiro recebem contribuições de vários convidados,
--     pagas por transferência (IBAN) ou MB WAY (ADR 0005).
--  2. A resposta indica os acompanhantes; os noivos definem o máximo.
--  3. Todos os convidados veem a galeria; só os noivos descarregam.
--  4. Sem limite de reservas por convidado (nada a alterar).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Presentes em dinheiro e contribuições
-- ---------------------------------------------------------------------
create type public.gift_kind as enum ('item', 'money');
create type public.payment_method as enum ('bank_transfer', 'mbway');

-- item: artigo reservado por um só convidado; price_cents = valor de referência.
-- money: presente em dinheiro; price_cents = objetivo (opcional).
alter table public.gifts
  add column kind public.gift_kind not null default 'item',
  add column contributed_cents bigint not null default 0,   -- mantido por trigger
  add constraint gifts_id_wedding_kind_unique unique (id, wedding_id, kind),
  add constraint gifts_money_never_reserved check (kind = 'item' or not is_reserved);

-- Uma reserva só pode apontar para um artigo (FK inclui o tipo).
alter table public.gift_reservations
  add column gift_kind public.gift_kind not null default 'item'
    constraint gift_reservations_only_items check (gift_kind = 'item'),
  drop constraint gift_reservations_gift_fk,
  add constraint gift_reservations_gift_fk
    foreign key (gift_id, wedding_id, gift_kind)
    references public.gifts (id, wedding_id, kind) on delete cascade;

create table public.gift_contributions (
  id             bigint generated always as identity primary key,
  wedding_id     bigint not null,
  gift_id        bigint not null,
  gift_kind      public.gift_kind not null default 'money'
                 constraint gift_contributions_only_money check (gift_kind = 'money'),
  guest_id       bigint not null,
  amount_cents   integer not null check (amount_cents between 100 and 10000000), -- 1 € a 100 000 €
  payment_method public.payment_method not null,
  message        text check (length(message) <= 500),
  received_at    timestamptz,                     -- os noivos confirmam que receberam
  created_at     timestamptz not null default now(),
  constraint gift_contributions_gift_fk
    foreign key (gift_id, wedding_id, gift_kind)
    references public.gifts (id, wedding_id, kind) on delete cascade,
  constraint gift_contributions_guest_fk
    foreign key (guest_id, wedding_id)
    references public.guests (id, wedding_id) on delete cascade
);
create index gift_contributions_gift_id_idx    on public.gift_contributions (gift_id);
create index gift_contributions_guest_id_idx   on public.gift_contributions (guest_id);
create index gift_contributions_wedding_id_idx on public.gift_contributions (wedding_id);

-- Soma das contribuições visível na lista (sem revelar quem contribuiu).
create or replace function private.sync_gift_contributed_cents()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.gifts set contributed_cents = contributed_cents + new.amount_cents where id = new.gift_id;
  elsif tg_op = 'DELETE' then
    update public.gifts set contributed_cents = contributed_cents - old.amount_cents where id = old.gift_id;
  end if;
  return null;
end;
$$;

create trigger gift_contributions_sync_gift
  after insert or delete on public.gift_contributions
  for each row execute function private.sync_gift_contributed_cents();

-- Dados de pagamento dos noivos: só convidados registados e noivos os veem.
create table public.wedding_payment_details (
  wedding_id   bigint primary key references public.weddings (id) on delete cascade,
  holder_name  text not null check (length(btrim(holder_name)) between 2 and 120),
  iban         text check (iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$'),  -- sem espaços
  mbway_phone  text check (mbway_phone ~ '^\+?[0-9]{9,15}$'),
  updated_at   timestamptz not null default now(),
  constraint wedding_payment_details_has_method check (iban is not null or mbway_phone is not null)
);

create trigger wedding_payment_details_touch_updated_at
  before update on public.wedding_payment_details
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------
-- 2. Acompanhantes
-- ---------------------------------------------------------------------
alter table public.weddings
  add column max_companions smallint not null default 0
    check (max_companions between 0 and 20);

alter table public.guests
  add column companions smallint not null default 0 check (companions >= 0),
  add constraint guests_companions_only_when_attending
    check (rsvp_status = 'attending' or companions = 0);

-- Quem não confirma não traz acompanhantes; quem confirma respeita o máximo.
create or replace function private.check_guest_companions()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_max smallint;
begin
  if new.rsvp_status <> 'attending' then
    new.companions := 0;
    return new;
  end if;
  select max_companions into v_max from public.weddings where id = new.wedding_id;
  if new.companions > v_max then
    raise exception 'companions_exceed_limit: máximo de % acompanhante(s)', v_max
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger guests_check_companions
  before insert or update on public.guests
  for each row execute function private.check_guest_companions();

-- ---------------------------------------------------------------------
-- Privilégios por coluna
-- ---------------------------------------------------------------------
grant update (companions) on public.guests to authenticated;
-- kind e contributed_cents não se alteram depois de criados
-- (gifts já só tem update nas colunas editáveis, ver migração inicial).
revoke update on public.gift_contributions from anon, authenticated;
grant  update (received_at) on public.gift_contributions to authenticated;
revoke insert, update, delete on public.gift_contributions      from anon;
revoke insert, update, delete on public.wedding_payment_details from anon;
revoke select on public.wedding_payment_details from anon;

-- ---------------------------------------------------------------------
-- RLS: contribuições e dados de pagamento
-- ---------------------------------------------------------------------
alter table public.gift_contributions      enable row level security;
alter table public.wedding_payment_details enable row level security;

create policy gift_contributions_select on public.gift_contributions
  for select to authenticated
  using (guest_id = (select private.current_guest_id(wedding_id))
         or (select private.is_wedding_host(wedding_id)));
create policy gift_contributions_insert_guest on public.gift_contributions
  for insert to authenticated
  with check (guest_id = (select private.current_guest_id(wedding_id)) and received_at is null);
-- Só os noivos marcam como recebida.
create policy gift_contributions_update_host on public.gift_contributions
  for update to authenticated
  using ((select private.is_wedding_host(wedding_id)))
  with check ((select private.is_wedding_host(wedding_id)));
-- O convidado só desiste enquanto os noivos não confirmaram a receção.
create policy gift_contributions_delete on public.gift_contributions
  for delete to authenticated
  using ((guest_id = (select private.current_guest_id(wedding_id)) and received_at is null)
         or (select private.is_wedding_host(wedding_id)));

create policy wedding_payment_details_select on public.wedding_payment_details
  for select to authenticated
  using ((select private.current_guest_id(wedding_id)) is not null
         or (select private.is_wedding_host(wedding_id)));
create policy wedding_payment_details_insert_host on public.wedding_payment_details
  for insert to authenticated
  with check ((select private.is_wedding_host(wedding_id)));
create policy wedding_payment_details_update_host on public.wedding_payment_details
  for update to authenticated
  using ((select private.is_wedding_host(wedding_id)))
  with check ((select private.is_wedding_host(wedding_id)));
create policy wedding_payment_details_delete_host on public.wedding_payment_details
  for delete to authenticated
  using ((select private.is_wedding_host(wedding_id)));

-- ---------------------------------------------------------------------
-- 3. Galeria partilhada: todos os convidados do casamento veem as memórias.
-- O download (original e .zip) é só para os noivos, na interface.
-- ---------------------------------------------------------------------
drop policy memories_select on public.memories;
create policy memories_select on public.memories
  for select to authenticated
  using ((select private.current_guest_id(wedding_id)) is not null
         or (select private.is_wedding_host(wedding_id)));

drop policy memories_objects_select on storage.objects;
create policy memories_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'memories'
    and (
      (select private.current_guest_id(((storage.foldername(name))[1])::bigint)) is not null
      or (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
    )
  );

-- ---------------------------------------------------------------------
-- Estatísticas atualizadas
-- ---------------------------------------------------------------------
drop function public.wedding_stats(bigint);

create function public.wedding_stats(p_wedding_id bigint)
returns table (
  guests_total            bigint,
  guests_attending        bigint,
  guests_declined         bigint,
  guests_pending          bigint,
  people_attending        bigint,   -- confirmados + acompanhantes
  items_total             bigint,
  items_reserved          bigint,
  items_value_cents       bigint,
  items_reserved_cents    bigint,
  money_gifts_total       bigint,
  contributions_total     bigint,
  contributed_cents       bigint,
  received_cents          bigint,
  memories_total          bigint,
  memories_photos         bigint,
  memories_videos         bigint,
  memories_bytes          bigint
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
    (select coalesce(sum(1 + g.companions), 0) from public.guests g
      where g.wedding_id = p_wedding_id and g.rsvp_status = 'attending'),
    (select count(*) from public.gifts f where f.wedding_id = p_wedding_id and f.kind = 'item'),
    (select count(*) from public.gifts f where f.wedding_id = p_wedding_id and f.kind = 'item' and f.is_reserved),
    (select coalesce(sum(f.price_cents), 0) from public.gifts f where f.wedding_id = p_wedding_id and f.kind = 'item'),
    (select coalesce(sum(f.price_cents), 0) from public.gifts f
      where f.wedding_id = p_wedding_id and f.kind = 'item' and f.is_reserved),
    (select count(*) from public.gifts f where f.wedding_id = p_wedding_id and f.kind = 'money'),
    (select count(*) from public.gift_contributions c where c.wedding_id = p_wedding_id),
    (select coalesce(sum(c.amount_cents), 0) from public.gift_contributions c where c.wedding_id = p_wedding_id),
    (select coalesce(sum(c.amount_cents), 0) from public.gift_contributions c
      where c.wedding_id = p_wedding_id and c.received_at is not null),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id and m.kind = 'photo'),
    (select count(*) from public.memories m where m.wedding_id = p_wedding_id and m.kind = 'video'),
    (select coalesce(sum(m.size_bytes), 0) from public.memories m where m.wedding_id = p_wedding_id);
$$;

revoke all on function public.wedding_stats(bigint) from public, anon;
grant execute on function public.wedding_stats(bigint) to authenticated;
