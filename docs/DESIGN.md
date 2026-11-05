# Design — Enlace

## Ideia

**Enlace** quer dizer união e também laço, entrelaçar. O site inteiro nasce dessa palavra: **um único fio azul-cobalto** que se enlaça entre os nomes dos noivos e depois desce pela página, ligando cada passo do convidado (vir, oferecer, partilhar memórias). É o único elemento ousado; tudo à volta é calmo e disciplinado.

A cor vem da **porcelana e do azulejo portugueses**: branco frio de louça com tinta azul-cobalto, a cor do "algo azul" das noivas. Nada de creme, dourado ou terracota.

## Revisão do plano anterior

O `PLANO.md` propunha papel creme `#F6F2EA`, serifa clássica (Cormorant) e datas como `12 · 06 · 2027`. Revisto porque:

| Antes | Problema | Agora |
|---|---|---|
| Fundo creme + serifa de alto contraste | É a combinação mais típica de páginas geradas; não diz nada deste casamento | Branco porcelana frio + tinta cobalto, ligado à louça e ao azulejo portugueses |
| Cormorant Garamond | Escolha por defeito em convites de casamento | **Italiana**: romana fina e estreita, elegante sem ser "convite genérico" |
| `12 · 06 · 2027` | Pontos médios a juntar metadados são um tique de template | Frase normal: "Sábado, 12 de junho de 2027, às 16h00" |
| Verde-sálvia como destaque | Decorativo, sem ligação ao tema | O próprio fio é o destaque: a cor só aparece onde há ligação ou ação |

## Cores

| Nome | Hex | Uso |
|---|---|---|
| Porcelana | `#F7F8FB` | Fundo |
| Tinta | `#18203A` | Texto principal (azul-tinta, não preto) |
| Cobalto | `#2348B8` | O fio, botões principais, foco |
| Pedra | `#5A6382` | Texto secundário |
| Névoa | `#DCE2EE` | Linhas, contornos de campos |
| Esmalte | `#E9EEFB` | Fundo de estados selecionados |

Modo escuro, "porcelana à noite": fundo `#0F1527`, texto `#E6EAF4`, cobalto `#8AA4FF`, pedra `#A3ABC5`, névoa `#28304A`, esmalte `#18213D`.

## Tipografia

- **Italiana** (só peso 400): nomes dos noivos e títulos de secção. Grande, com espaçamento ligeiramente aberto.
- **Hanken Grotesk** (400, 500, 600): todo o resto: datas, formulários, botões, preços.
- Escala (base 17 px, razão ~1,333): 13 · 17 · 22 · 30 · 40 · 53; nomes em `clamp(4.5rem, 19vw, 10rem)`.
- Sem maiúsculas em etiquetas, sem palavras destacadas a itálico dentro de títulos, sem "eyebrows" por cima dos títulos.

## Composição

Primeiro telemóvel (o link chega por WhatsApp). Coluna estreita (máx. 34 rem), **alinhada à esquerda**. O fio corre numa margem à esquerda e passa por um pequeno nó em cada secção; como essas secções são mesmo uma sequência (o percurso do convidado), o nó tem significado.

```
┌──────────────────────────────┐
│ Maria                        │   nomes grandes, desencontrados
│      ╭─╮                     │   o fio enlaça-se entre eles
│ ─────╰─┼──────╮       João   │
│        │                     │
│ Sábado, 12 de junho de 2027, │
│ às 16h00                     │
│ Mosteiro dos Jerónimos       │
│                              │
│ │                            │
│ ○ Onde e quando              │   mapa + Google Maps / Waze / Apple
│ │                            │
│ ○ Vens?                      │   nome → sim/não → acompanhantes
│ │                            │
│ ○ Presentes                  │   artigos (reservar) e dinheiro (contribuir)
│ │                            │
│ ○ Memórias                   │   enviar fotos e vídeos; galeria
└──────────────────────────────┘
```

## Princípios

1. **Um só momento de movimento**: ao abrir, o fio desenha o laço entre os nomes (≈1,6 s). Nada mais anima sozinho. Com "reduzir movimento", aparece já desenhado.
2. **O fio é a linguagem**: a barra de progresso dos presentes em dinheiro é o mesmo fio a encher-se; o foco do teclado é cobalto.
3. **Uma ação de cada vez**: cada passo pede só o que precisa; botões dizem o que acontece ("Enviar resposta", "Reservar", "Registar contribuição").
4. **Listas, não cartões**: presentes e convidados em linhas com espaço, não grelhas de cartões iguais com sombra.
5. **Portugal**: `12 de junho de 2027`, `16h00`, `1500 €` e `95,50 €`, IBAN em grupos de quatro.
