# Enlace — convite de casamento

Site de convite de casamento, feito para o telemóvel: os noivos preparam tudo num painel privado e os convidados abrem um link para ver o convite, responder, escolher um presente e partilhar as fotos do dia.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL, Auth, Storage) · Motion · Leaflet/OpenStreetMap · Vercel

---

## Funcionalidades

**Para os convidados** (sem criar conta: escrevem o nome e o site reconhece-os no mesmo telemóvel)

- Convite com os nomes dos noivos, foto, data, contagem decrescente e cartão-convite com pais, cerimónia e receção
- A nossa história, com fotos e animações ao fazer scroll
- Mapa da cerimónia e da receção, com caminho no Google Maps, Waze e Apple Maps
- Resposta ao convite com número de acompanhantes (até ao máximo definido pelos noivos)
- Lista de presentes:
  - **artigos** — cada um só pode ser reservado por uma pessoa (garantido pela base de dados)
  - **presentes em dinheiro** — vários convidados contribuem por IBAN ou MB WAY
- Memórias: enviar fotos e vídeos do casamento e ver a galeria de todos

**Para os noivos** (`/painel`, com email e palavra-passe)

- Criar o casamento e editar todos os dados: nomes, pais, cerimónia, receção, mensagem, prazo de resposta, acompanhantes, foto de capa, música, IBAN e MB WAY
- Escrever a história (anos, títulos, textos e fotos)
- Gerir presentes, ver quem reservou e confirmar as contribuições recebidas
- Ver respostas e estatísticas, exportar a lista de convidados para Excel
- Ver e descarregar as fotos e vídeos dos convidados (um a um ou tudo num `.zip`)

## Segurança

As regras importantes vivem na base de dados (Row Level Security), não só no código:

- um artigo tem no máximo uma reserva, mesmo com dois cliques ao mesmo segundo;
- cada convidado só vê e altera os seus dados; o IBAN e o MB WAY só aparecem a quem respondeu;
- só os noivos editam o casamento e veem as contribuições;
- os dados de um casamento nunca aparecem noutro.

Há **55 testes** automáticos, incluindo estas regras (correm com PGlite, sem Docker).

---

## Pôr a funcionar

### 1. Supabase

1. Criar um projeto em [supabase.com](https://supabase.com) (região Europa).
2. No **SQL Editor**, correr por ordem os ficheiros de [`supabase/migrations/`](supabase/migrations).
3. Em **Authentication → Sign In / Providers**, ativar **Email** e **Allow anonymous sign-ins**.
4. Em **Authentication → URL Configuration**, pôr em **Site URL** o endereço do site (ex.: `https://enlace.vercel.app`) e acrescentar `https://enlace.vercel.app/auth/callback` em **Redirect URLs**.

### 2. Variáveis de ambiente

Copiar [`.env.example`](.env.example) para `.env.local` (no computador) e adicionar as mesmas na Vercel (**Settings → Environment Variables**):

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (chave *anon* / *publishable*) |
| `NEXT_PUBLIC_WEDDING_SLUG` | Opcional: link do casamento a mostrar na página inicial |
| `NOMINATIM_CONTACT_EMAIL` | Opcional: email de contacto para o serviço de mapas |

Estas chaves são públicas por natureza (vão para o browser); quem protege os dados é o RLS.

### 3. Primeira utilização

1. Abrir `/painel`, criar conta e confirmar o email.
2. Criar o convite (nomes, data, local) e completar os dados em **Casamento**, **História** e **Presentes**.
3. Partilhar o link do site com os convidados.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # testes (base de dados e formatos)
npm run lint
npm run build
```

## Documentação

- [`docs/PLANO.md`](docs/PLANO.md) — âmbito, fluxos, modelo de dados e fases
- [`docs/DESIGN.md`](docs/DESIGN.md) — direção visual, cores, letras e movimento
- [`GLOSSARY.md`](GLOSSARY.md) — linguagem do domínio
- [`docs/adr/`](docs/adr) — decisões de arquitetura

## Créditos

Letra dos títulos: **Lamoric Rowen** (HansCo Studio) — confirmar a licença de uso na web antes de publicar. Texto: **Poppins** (Google Fonts). Mapas © colaboradores do OpenStreetMap.
