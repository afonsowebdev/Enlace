# Convite de Casamento

Site de convite de casamento: detalhes da cerimónia com mapa, resposta dos convidados, lista de presentes com reserva única e galeria de fotos e vídeos para os noivos.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL, Auth, Storage) · Leaflet/OpenStreetMap · Vercel

## Documentação

- [`docs/PLANO.md`](docs/PLANO.md): âmbito, fluxos, rotas, modelo de dados, design, fases e configuração
- [`GLOSSARY.md`](GLOSSARY.md): linguagem do domínio
- [`docs/adr/`](docs/adr): decisões de arquitetura

## Comandos

```bash
npm install          # dependências
npm run dev          # servidor local em http://localhost:3000
npm test             # testes (inclui RLS da base de dados, sem Docker)
npm run build        # build de produção
```

Configuração do Supabase e da Vercel: ver a secção 11 do plano.
