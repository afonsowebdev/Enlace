# CLAUDE.md

Convite de casamento em Next.js 15 (App Router, `src/`) + Supabase. Interface em português de Portugal (pt-PT), valores em EUR.

- Antes de mexer no domínio, ler `GLOSSARY.md` e usar exatamente esses termos; decisões em `docs/adr/`; plano e fases em `docs/PLANO.md`.
- Toda a alteração à base de dados é uma nova migração em `supabase/migrations/` (nunca editar migrações já aplicadas) com RLS e teste em `tests/db/`.
- As regras de negócio críticas (reserva única, privacidade da galeria, isolamento por casamento) vivem na base de dados, não só no código.
- Dinheiro em cêntimos (`price_cents`). Datas em `timestamptz` com `time_zone`.
- `npm test` corre os testes (PGlite simula o Supabase em `tests/db/supabase-stub.ts`). `npx tsc --noEmit` e `npm run lint` devem passar.
