# Bricks Viewers

Jogo de tijolos para live na Twitch. O streamer controla a raquete e o chat entra no jogo com uma bola cada um. Quem quebrar mais tijolos ganha mais pontos.

**Desenvolvimento:** Clayton M.
**Arte:** Daru

## Como abrir

1. Dê duplo clique no `index.html`.
2. Digite o nome do canal (ex: `hercules_sc`) e clique em **Conectar**.
3. Quando conectar, o botão **Iniciar** libera.
4. Escolha a fase e a quantidade de viewers, e clique em **Iniciar**.

Não precisa de login na Twitch. O jogo só lê o chat.

## Comandos no chat

| Comando | Quando | O que faz |
|---|---|---|
| `!entrar` | antes do Pronto | entra no jogo com uma bola |
| `!azul`, `!vermelho`, `!amarelo`, `!verde`, `!branco`, `!roxo`, `!laranja`, `!rosa`, `!ciano` | a qualquer momento da partida | troca a cor da bola (intervalo de 5 s) |
| `!speed` | durante a partida | bola fica 100% mais rápida por 5 s (precisa de 5 batidas em tijolos) |
| `!bomb` | durante a partida | explosão pequena que empurra as bolas perto da sua (precisa de 1 bomba) |

Para testes sem a Twitch: no campo do canal, digite `simulador` (ou `simulacao`, ou `dev`) e clique em **Conectar**. Pode colocar o seu nome depois (ex: `simulador Hercules_SC`): os viewers falsos entram como "Hercules_SC 1", "Hercules_SC 2" e assim por diante (sem nome, ficam "Streamer 1", "Streamer 2"...). O jogo não conecta no chat e libera o **Iniciar**. Depois do Iniciar, o painel do simulador (viewers falsos e comandos) aparece ao lado do jogo, embaixo do ranking. Conectar num canal de verdade desliga o simulador.

## Regras

- Cada tijolo quebrado dá 1 ponto para a bola que quebrou.
- O streamer pode marcar "Streamer pontua no ranking". Nesse caso, a cada 5 s ganha 1 ponto se mais de 50% das bolas estiverem no ar.
- A raquete brilha quando o streamer ganha ponto.
- Um ranking com todos os jogadores aparece ao lado do jogo durante a partida (🥇🥈🥉 para os 3 primeiros que já têm ponto). No fim, o ranking completo aparece no centro.
- A bola que usa `!bomb` brilha em vermelho por um instante.
- Só com "Streamer pontua" marcado: 20% dos tijolos da fase são sorteados a cada partida e soltam um item ao quebrar. Se a raquete pegar o item, o streamer ganha 5 pontos. Se o item passar da raquete, some.
- A cada 10 vezes que a bola encosta em tijolos (quebrando ou não), o viewer ganha 1 bomba. O `!bomb` usa a bomba e empurra as bolas num raio de 35 px. Não causa dano nem mexe nos tijolos, paredes ou raquete.
- A partida acaba quando todos os tijolos forem quebrados.

## Estrutura do projeto

```
Bricks-Viewers/
├── index.html        página principal
├── css/style.css     aparência
├── js/
│   ├── config.js     medidas, velocidades e tempos
│   ├── fases.js      fases: tijolos, paredes, cores e fundos
│   ├── estado.js     variáveis do jogo
│   ├── audio.js      música e botão de som
│   ├── fisica.js     bola, rebotes e colisões
│   ├── itens.js      itens que caem e bomba (!bomb)
│   ├── regras.js     pontos, comandos, fases e fim de jogo
│   ├── render.js     desenho na tela
│   ├── twitch.js     conexão com o chat
│   ├── menu.js       menu, fases e informações
│   ├── entrada.js    teclado e mouse
│   ├── ranking.js    ranking lateral e "Copiar top 3"
│   ├── simulador.js  modo simulação (testes sem a Twitch)
│   └── main.js       loop principal
└── assets/           imagens e música
```

Os arquivos em `js/` são carregados nesta ordem no `index.html`: cada um usa o que os anteriores definiram.

## Como criar uma fase nova

1. Abra `js/fases.js`.
2. Copie um bloco de fase e ajuste:
   - `fundo`: imagem da fase (ex: `assets/Fase5.png`);
   - `cores`: cores dos tijolos, ou `null` para cinza;
   - `paredes`: retângulos `{x, y, w, h}` ou segmentos `{x1, y1, x2, y2, espessura}`;
   - `padrao`: o desenho dos tijolos.

## Hospedagem

O jogo é só HTML, CSS, JS e imagens. Pode ser publicado no GitHub Pages sem servidor. Cada streamer abre a página no próprio navegador.

## Créditos

- Arte: Daru
- Desenvolvimento: Clayton M.
