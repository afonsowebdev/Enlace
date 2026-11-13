-- =====================================================================
-- Conteúdo que os noivos gerem no painel (fase 2):
--  - criação do casamento por uma conta com email (create_wedding)
--  - pais, receção, foto de capa e música no casamento
--  - momentos da "nossa história"
--  - ilustração de cada presente
--  - bucket público wedding-media para fotos e música
-- =====================================================================

-- ---------------------------------------------------------------------
-- Casamento: pais, receção, capa e música
-- ---------------------------------------------------------------------
alter table public.weddings
  add column partner_one_parents text[] not null default '{}'
    check (cardinality(partner_one_parents) <= 4),
  add column partner_two_parents text[] not null default '{}'
    check (cardinality(partner_two_parents) <= 4),
  add column reception_name text check (length(btrim(reception_name)) between 1 and 120),
  add column reception_address text check (length(btrim(reception_address)) between 1 and 300),
  add column reception_starts_at timestamptz,
  add column reception_latitude double precision check (reception_latitude between -90 and 90),
  add column reception_longitude double precision check (reception_longitude between -180 and 180),
  add column cover_photo_path text check (length(cover_photo_path) <= 300),
  add column music_path text check (length(music_path) <= 300),
  add constraint weddings_reception_coordinates_pair
    check ((reception_latitude is null) = (reception_longitude is null));

-- ---------------------------------------------------------------------
-- A nossa história
-- ---------------------------------------------------------------------
create table public.story_moments (
  id         bigint generated always as identity primary key,
  wedding_id bigint not null references public.weddings (id) on delete cascade,
  year       text   not null check (length(btrim(year)) between 1 and 20),
  title      text   not null check (length(btrim(title)) between 1 and 80),
  body       text   check (length(body) <= 1000),
  photo_path text   check (length(photo_path) <= 300),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index story_moments_wedding_sort_idx on public.story_moments (wedding_id, sort_order, id);

alter table public.story_moments enable row level security;
revoke insert, update, delete on public.story_moments from anon;

create policy story_moments_select_public on public.story_moments
  for select to anon, authenticated using (true);
create policy story_moments_insert_host on public.story_moments
  for insert to authenticated with check ((select private.is_wedding_host(wedding_id)));
create policy story_moments_update_host on public.story_moments
  for update to authenticated
  using ((select private.is_wedding_host(wedding_id)))
  with check ((select private.is_wedding_host(wedding_id)));
create policy story_moments_delete_host on public.story_moments
  for delete to authenticated using ((select private.is_wedding_host(wedding_id)));

-- ---------------------------------------------------------------------
-- Presentes: ilustração
-- ---------------------------------------------------------------------
alter table public.gifts
  add column icon text not null default 'gift'
    constraint gifts_icon_check
    check (icon in ('gift', 'plane', 'envelope', 'coffee', 'bed', 'pan', 'vase', 'glasses'));

grant update (icon) on public.gifts to authenticated;

-- ---------------------------------------------------------------------
-- Criar o casamento: só contas com email (não sessões anónimas de convidados).
-- Cria o casamento e torna quem o criou noiva/noivo.
-- ---------------------------------------------------------------------
create or replace function public.create_wedding(
  p_slug text,
  p_partner_one_name text,
  p_partner_two_name text,
  p_starts_at timestamptz,
  p_venue_name text,
  p_venue_address text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id bigint;
begin
  if v_uid is null or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'not_allowed: só uma conta com email pode criar um casamento'
      using errcode = '42501';
  end if;

  insert into public.weddings (slug, partner_one_name, partner_two_name, starts_at, venue_name, venue_address)
  values (p_slug, p_partner_one_name, p_partner_two_name, p_starts_at, p_venue_name, p_venue_address)
  returning id into v_id;

  insert into public.wedding_hosts (wedding_id, user_id) values (v_id, v_uid);
  return v_id;
end;
$$;

revoke all on function public.create_wedding(text, text, text, timestamptz, text, text) from public, anon;
grant execute on function public.create_wedding(text, text, text, timestamptz, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: fotos do casal, dos presentes e música (público para leitura)
-- Caminho: {wedding_id}/{qualquer-coisa}
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  20971520, -- 20 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg']
)
on conflict (id) do nothing;

create policy wedding_media_insert_host on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wedding-media'
    and (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
  );

create policy wedding_media_update_host on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wedding-media'
    and (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
  );

create policy wedding_media_delete_host on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-media'
    and (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
  );
