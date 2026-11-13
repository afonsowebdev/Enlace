-- =====================================================================
-- Decisão dos noivos (09-11-2026): os convidados não veem quanto já foi
-- oferecido nos presentes em dinheiro.
--
-- gifts.contributed_cents deixa de ser legível pela API. A lista continua
-- pública, mas só com as colunas abaixo. Os noivos calculam os totais a
-- partir de gift_contributions, que já só eles veem por inteiro (RLS);
-- cada convidado continua a ver apenas as suas contribuições.
--
-- Atenção: uma coluna nova em gifts só fica visível se for acrescentada
-- a este grant numa migração futura.
-- =====================================================================

revoke select on public.gifts from anon, authenticated;

grant select (
  id, wedding_id, kind, icon, name, description, image_url, purchase_url,
  price_cents, sort_order, is_reserved, created_at
) on public.gifts to anon, authenticated;
