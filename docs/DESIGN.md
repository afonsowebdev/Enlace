# Design — Enlace

## Ideia

**Enlace** quer dizer união e também laço. Desde 09-11-2026 o convite é em **branco champanhe**, com flores e pétalas a cair, e ocupa o ecrã todo. A pedido dos noivos, **o fio vinho foi retirado**: as secções têm títulos centrados com um pequeno raminho dourado.

A direção visual segue o pedido dos noivos: elegante, clássico e profissional, com papel champanhe, tinta vinho e filetes dourados. O Enlace usa as suas próprias peças: a letra Lamoric Rowen, raminhos e rosas desenhados em código e fotografias impressas.

## Cores

| Nome | Claro | Escuro ("vinho à noite") | Uso |
|---|---|---|---|
| Papel | `#F8F1E4` | `#1D0D11` | Fundo (branco champanhe) |
| Convite | `#F6EDDC` → `#FDF9F1` | `#EFE3CC` | O cartão-convite (igual nos dois modos, texto Tinta) |
| Pétala | `#E9C9C3` | `#6E3A44` | Rosas e pétalas do fundo |
| Tinta | `#3B1A1F` | `#F3E7E1` | Texto principal |
| Vinho | `#6B1C26` | `#E3A3AC` | Botões, nomes no cartão, destaques |
| Pedra | `#7D5F61` | `#BFA3A5` | Texto secundário |
| Névoa | `#E5D6C6` | `#3A2228` | Linhas e contornos |
| Linho | `#EFE4D6` | `#2A151A` | Fundos de painéis e estados selecionados |
| Rubor | `#F1DCDC` | `#331820` | Véu de cor no fundo |
| Dourado | `#B08A4F` | `#D2AD6E` | Filetes, "&", flores, selo |

## Tipografia

- **Lamoric Rowen** (HansCo Studio): só maiúsculas, decorativa — nomes dos noivos, títulos de secção, anos da história, dia do casamento. Ficheiro em `src/fonts/` (woff2). **Confirmar licença para uso web antes de publicar.**
- **Poppins** (400, 500, 600): todo o texto normal — formulários, datas, botões, preços.

## Ritmo da página

O link abre diretamente a página (sem ecrã de entrada).

1. **Abertura em ecrã inteiro e curta**: "Vamos casar", os nomes letra a letra com o "&" dourado a brilhar, dia da semana, data, hora e local, contagem decrescente. Com foto de capa, a foto fica num **arco** com filete dourado (ao lado dos nomes no computador); sem foto, o arco desenha-se à volta dos nomes. Em baixo, "Abrir o convite".
2. **Cartão-convite** champanhe com filete dourado duplo e rosas: pais, frase de convite, nomes, mensagem dos noivos e os eventos lado a lado (dia | mês e ano, dia da semana e hora, local).
3. **"Responder ao convite"** logo a seguir ao cartão.
4. **A nossa história**: no computador, foto e texto lado a lado, alternando; no telemóvel, um por baixo do outro.
5. **Onde e quando** (morada ao lado do mapa no computador), **Vens?**, **Presentes**, **Memórias**.

Os convidados **não veem quanto já foi oferecido** nos presentes em dinheiro (só o que eles próprios deram); a base de dados não o devolve.

## Movimento

- O conteúdo revela-se ao entrar no ecrã (sobe e ganha nitidez), uma vez.
- Os nomes aparecem letra a letra; o "&" tem um brilho dourado que passa de vez em quando.
- Ramos com rosas nos quatro cantos balançam devagar; as rosas desabrocham ao aparecer; pétalas caem pelo fundo.
- As fotografias "pousam" na página ao entrar no ecrã, com zoom lento e parallax leve.
- "Reduzir movimento" do sistema: sem deslocações, sem pétalas e sem balanço.

## Princípios

1. **Uma ação de cada vez**, com botões que dizem o que acontece ("Responder ao convite", "Enviar resposta", "Reservar", "Registar contribuição").
2. **Listas, não grelhas de cartões**, nos presentes.
3. **Portugal**: `12 de junho de 2027`, `16h00`, `1500 €` e `95,50 €`, IBAN em blocos de quatro.
4. **Telemóvel primeiro**; no computador, o convite usa a largura do ecrã (até ~72rem), com formulários estreitos e listas, fotos e mapas largos.
