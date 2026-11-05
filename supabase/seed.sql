-- Dados de exemplo para desenvolvimento local (npx supabase db reset).
insert into public.weddings
  (slug, partner_one_name, partner_two_name, starts_at, venue_name, venue_address,
   venue_latitude, venue_longitude, welcome_message, rsvp_deadline)
values
  ('maria-e-joao', 'Maria', 'João', '2027-06-12 16:00:00+01',
   'Mosteiro dos Jerónimos', 'Praça do Império 1400-206 Lisboa',
   38.6979, -9.2068,
   'Vamos casar e queremos muito que estejas connosco.', '2027-05-15');

insert into public.gifts (wedding_id, name, description, price_cents, sort_order)
select w.id, g.name, g.description, g.price_cents, g.sort_order
from public.weddings w,
  (values
    ('Máquina de café expresso', 'Para os pequenos-almoços a dois.', 18000, 1),
    ('Jogo de lençóis de linho', 'Cama de casal, cor natural.', 9500, 2),
    ('Jantar no primeiro aniversário', 'Contribuição para um jantar especial.', 12000, 3),
    ('Conjunto de panelas', 'Inox, cinco peças.', 22000, 4),
    ('Voo da lua de mel', 'Contribuição para a viagem.', 25000, 5)
  ) as g(name, description, price_cents, sort_order)
where w.slug = 'maria-e-joao';
