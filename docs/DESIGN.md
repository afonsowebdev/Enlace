# Design — Enlace

## Ideia

**Enlace** quer dizer união e também laço. Um **fio vinho** enlaça-se entre os nomes dos noivos e desce pela página, ligando cada passo do convidado; em cada secção há um nó que se acende quando o convidado lá chega.

A direção visual segue o pedido dos noivos (05-11-2026), inspirada num convite de referência em **vinho e papel creme**: elegante, clássico, com flores e um cartão de convite impresso. O Enlace não copia esse modelo — usa as suas próprias peças: o fio, a letra Lamoric Rowen, raminhos desenhados em código e fotografias impressas.

## Cores

| Nome | Claro | Escuro ("vinho à noite") | Uso |
|---|---|---|---|
| Papel | `#F7F0E7` | `#1D0D11` | Fundo |
| Tinta | `#3B1A1F` | `#F3E7E1` | Texto principal |
| Vinho | `#6B1C26` | `#E3A3AC` | O fio, botões, cartão-convite |
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

1. **Abertura**: nomes (tamanho ajustado ao comprimento), o laço desenhado, **fotografia impressa** do casal (moldura branca, inclinada, com os nomes em baixo), data, contagem decrescente e mensagem.
2. **Cartão-convite** vinho com filete dourado: pais, frase de convite, nomes, cerimónia e receção. Blocos separados por **ornamentos dourados** (linha, flor, linha); em cada evento, linhas verticais separam hora | dia da semana e dia | mês e ano.
3. **"Responder ao convite"** logo a seguir ao cartão: primeiro lê-se o convite, depois responde-se.
4. **A nossa história**: em cada momento, o ano em grande, um título, uma fotografia impressa grande (inclinada alternadamente para cada lado) e o texto; momentos separados por ornamentos.
5. **Onde e quando** (separadores Cerimónia/Receção, mapa sépia), **Vens?**, **Presentes**, **Memórias**.

## Movimento

- O conteúdo revela-se ao entrar no ecrã (sobe e ganha nitidez), uma vez.
- O fio enche-se com o scroll; os nós acendem.
- As fotografias "pousam" na página ao entrar no ecrã (descem e rodam até à inclinação final), com zoom lento e parallax leve.
- "Reduzir movimento" do sistema: sem deslocações nem escalas; o fio aparece já desenhado.

## Princípios

1. **Uma ação de cada vez**, com botões que dizem o que acontece ("Responder ao convite", "Enviar resposta", "Reservar", "Registar contribuição").
2. **Listas, não grelhas de cartões**, nos presentes.
3. **Portugal**: `12 de junho de 2027`, `16h00`, `1500 €` e `95,50 €`, IBAN em blocos de quatro.
4. **Telemóvel primeiro**; no computador, uma coluna central com os raminhos a enquadrar as margens.
