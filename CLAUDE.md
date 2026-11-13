# CLAUDE.md

Convite de casamento em Next.js 15 (App Router, `src/`) + Supabase. Interface em português de Portugal (pt-PT), valores em EUR.

- Antes de mexer no domínio, ler `GLOSSARY.md` e usar exatamente esses termos; decisões em `docs/adr/`; plano e fases em `docs/PLANO.md`.
- Toda a alteração à base de dados é uma nova migração em `supabase/migrations/` (nunca editar migrações já aplicadas) com RLS e teste em `tests/db/`.
- As regras de negócio críticas (reserva única de artigos, contribuições, acompanhantes, acesso à galeria e aos dados de pagamento, isolamento por casamento) vivem na base de dados, não só no código.
- Dinheiro em cêntimos (`price_cents`). Datas em `timestamptz` com `time_zone`.
- Painel dos noivos em `src/app/painel/` (guarda em `src/lib/host.ts`); convidados entram com sessão anónima (`src/components/use-guest.ts`). Sem variáveis do Supabase, as páginas mostram instruções em vez de falhar.
- `npm test` corre os testes (PGlite simula o Supabase em `tests/db/supabase-stub.ts`). `npx tsc --noEmit` e `npm run lint` devem passar.
