-- =====================================================================
-- Decisão dos noivos (13-11-2026): os acompanhantes deixam de ser um
-- número livre. Quem confirma diz se vem em casal (com o nome do cônjuge)
-- e indica as crianças que traz, com nome e idade. Só são aceites
-- crianças até à idade máxima definida pelos noivos (por defeito 4 anos;
-- sem valor, não são aceites crianças).
--
-- guests.companions continua a existir, mas passa a ser calculado pela
-- base de dados (cônjuge + crianças) e o convidado deixa de o escrever.
-- weddings.max_companions deixa de fazer sentido e é removido.
-- =====================================================================

alter table public.weddings
  drop column max_companions,
  add column max_child_age smallint default 4 check (max_child_age between 0 and 17);

alter table public.guests
  add column partner_name text check (length(btrim(partner_name)) between 2 and 100),
  add column children jsonb not null default '[]'::jsonb
    constraint guests_children_is_list
    check (jsonb_typeof(children) = 'array' and jsonb_array_length(children) <= 10);

-- Quem não confirma não traz ninguém. Quem confirma: cônjuge opcional e
-- crianças [{ "name": text, "age": inteiro }] até à idade máxima.
create or replace function private.check_guest_companions()
returns trigger language plpgsql set search_path = '' as $$
declare
  v_max   smallint;
  v_child jsonb;
  v_age   numeric;
begin
  if new.rsvp_status <> 'attending' then
    new.partner_name := null;
    new.children := '[]'::jsonb;
    new.companions := 0;
    return new;
  end if;

  new.partner_name := nullif(btrim(new.partner_name), '');

  if jsonb_array_length(new.children) > 0 then
    select max_child_age into v_max from public.weddings where id = new.wedding_id;
    if v_max is null then
      raise exception 'children_not_allowed: este casamento não aceita crianças'
        using errcode = 'check_violation';
    end if;

    for v_child in select value from jsonb_array_elements(new.children) loop
      if jsonb_typeof(v_child) <> 'object'
         or coalesce(jsonb_typeof(v_child -> 'name'), '') <> 'string'
         or coalesce(jsonb_typeof(v_child -> 'age'), '') <> 'number' then
        raise exception 'child_invalid: cada criança tem nome e idade' using errcode = 'check_violation';
      end if;
      if length(btrim(v_child ->> 'name')) not between 1 and 60 then
        raise exception 'child_invalid: nome da criança em falta' using errcode = 'check_violation';
      end if;
      v_age := (v_child ->> 'age')::numeric;
      if v_age < 0 or v_age <> trunc(v_age) then
        raise exception 'child_invalid: idade inválida' using errcode = 'check_violation';
      end if;
      if v_age > v_max then
        raise exception 'child_too_old: só são aceites crianças até aos % anos', v_max
          using errcode = 'check_violation';
      end if;
    end loop;

    -- guarda só nome e idade, já limpos, pela ordem indicada
    select jsonb_agg(jsonb_build_object('name', btrim(c.value ->> 'name'), 'age', (c.value ->> 'age')::int) order by c.ord)
      into new.children
      from jsonb_array_elements(new.children) with ordinality as c(value, ord);
  end if;

  new.companions := (new.partner_name is not null)::int + jsonb_array_length(new.children);
  return new;
end;
$$;

-- O convidado escreve o cônjuge e as crianças; o número é calculado.
revoke update (companions) on public.guests from authenticated;
grant  update (partner_name, children) on public.guests to authenticated;
