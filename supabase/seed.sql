-- Dados de exemplo para desenvolvimento local (npx supabase db reset).
insert into public.weddings
  (slug, partner_one_name, partner_two_name, starts_at, venue_name, venue_address,
   venue_latitude, venue_longitude, welcome_message, rsvp_deadline, max_companions)
values
  ('maria-e-joao', 'Maria', 'João', '2027-06-12 16:00:00+01',
   'Mosteiro dos Jerónimos', 'Praça do Império 1400-206 Lisboa',
   38.6979, -9.2068,
   'Vamos casar e queremos muito que estejas connosco.', '2027-05-15', 2);

-- Artigos (reservados por um só convidado) e presentes em dinheiro (vários contribuem).
-- price_cents: valor de referência do artigo, ou objetivo do presente em dinheiro (null = sem objetivo).
insert into public.gifts (wedding_id, kind, name, description, price_cents, sort_order)
select w.id, g.kind::public.gift_kind, g.name, g.description, g.price_cents, g.sort_order
from public.weddings w,
  (values
    ('money', 'Voo da lua de mel', 'Ajuda-nos a chegar ao destino da lua de mel.', 150000, 1),
    ('item',  'Máquina de café expresso', 'Para os pequenos-almoços a dois.', 18000, 2),
    ('item',  'Jogo de lençóis de linho', 'Cama de casal, cor natural.', 9500, 3),
    ('item',  'Conjunto de panelas', 'Inox, cinco peças.', 22000, 4),
    ('money', 'Presente em dinheiro', 'Contribui com o valor que quiseres.', null, 5)
  ) as g(kind, name, description, price_cents, sort_order)
where w.slug = 'maria-e-joao';

-- IBAN de exemplo (fictício).
insert into public.wedding_payment_details (wedding_id, holder_name, iban, mbway_phone)
select id, 'Maria Santos e João Pereira', 'PT50000201231234567890154', '+351912345678'
from public.weddings where slug = 'maria-e-joao';
