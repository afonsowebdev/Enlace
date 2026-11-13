-- =====================================================================
-- Versículo no convite (13-11-2026): os noivos podem mostrar um texto
-- bíblico no cartão do convite, com a sua referência (ex.: Mateus 19:5-6).
--
-- Ambos opcionais. A referência só existe com o texto. As políticas de
-- weddings (leitura pública, edição só pelos noivos) cobrem as colunas novas.
-- =====================================================================

alter table public.weddings
  add column verse_text text check (length(btrim(verse_text)) between 1 and 1000),
  add column verse_reference text check (length(btrim(verse_reference)) between 1 and 80),
  add constraint weddings_verse_reference_needs_text
    check (verse_reference is null or verse_text is not null);
