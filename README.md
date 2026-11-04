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
| `!entrar` | antes do Pronto (no modo intervalo, a qualquer momento) | entra no jogo com uma bola |
| `!azul`, `!vermelho`, `!amarelo`, `!verde`, `!branco`, `!roxo`, `!laranja`, `!rosa`, `!ciano` | a qualquer momento da partida | troca a cor da bola (intervalo de 5 s) |
| `!#ff8800`, `!#f80`, `!cor #ff8800`, `!cor 255 136 0` | a qualquer momento da partida | troca a cor da bola por um código RGB (hex ou 3 números de 0 a 255) |
| `!speed` | durante a partida | bola fica 100% mais rápida por 5 s (precisa de 5 batidas em tijolos) |
| `!bomb` | durante a partida | explosão pequena que empurra as bolas perto da sua (precisa de 1 bomba) |
| `!gravity` | durante a partida | campo gravitacional azul na sua bola: puxa as bolas num raio de 60 px por 2 s e depois lança todas para fora (precisa de 12 batidas em tijolos) |
| `!shock` | durante a partida | sua bola fica elétrica por 1,5 s e atordoa as bolas que passarem a até 30 px dela (precisa de 13 batidas em tijolos) |

Para testes sem a Twitch: no campo do canal, digite `simulador` (ou `simulacao`, ou `dev`) e clique em **Conectar**. Pode colocar o seu nome depois (ex: `simulador Hercules_SC`): os viewers falsos entram como "Hercules_SC 1", "Hercules_SC 2" e assim por diante (sem nome, ficam "Streamer 1", "Streamer 2"...). O jogo não conecta no chat e libera o **Iniciar**. Depois do Iniciar, o painel do simulador (viewers falsos e comandos) aparece ao lado do jogo, embaixo do ranking. Conectar num canal de verdade desliga o simulador.

No painel do simulador, a parte **Bola de teste** serve para testar uma bola só:
- digite um nome e clique em **+** (ou Enter) para adicionar a bola; sem nome, ela ganha o próximo número. Durante a partida, a bola já entra jogando;
- escolha a bola na lista: embaixo aparecem os pontos dela e como estão os poderes (⚡ x/5, 💣 x/2, 🌀 x/12, 🔋 x/13) e a fila de poderes;
- digite qualquer comando do chat (ex: `!cor #ff8800`) e clique em **➤** (ou Enter), ou use os botões **!speed**, **!bomb**, **!gravity** e **!shock**;
- **Carregar poderes** enche o !speed, as 2 bombas, o !gravity e o !shock da bola escolhida, para testar sem esperar as batidas;
- **Soltar multibola** derruba um item multibola em cima da raquete.

## Regras

- Cada tijolo quebrado dá 1 ponto para a bola que quebrou.
- O streamer pode marcar "Streamer pontua no ranking". Nesse caso, a cada 7 s ganha 1 ponto se mais de 50% das bolas estiverem no ar.
- A raquete brilha quando o streamer ganha ponto.
- Um ranking com todos os jogadores aparece ao lado do jogo durante a partida (🥇🥈🥉 para os 3 primeiros que já têm ponto). No fim, o ranking completo aparece no centro.
- A bola que usa `!bomb` brilha em vermelho por um instante.
- Quando alguém usa `!speed` ou `!bomb`, aparece "Fulano usou !bomb" em cima da bola por 2 s. Em cima de cada bola, ⚡ mostra que o `!speed` está pronto e 💣 mostra quantas bombas o viewer tem.
- Do lado esquerdo do jogo fica um painel com um texto curto de apresentação e os comandos do chat.
- Itens: 20% dos tijolos da fase são sorteados a cada partida e soltam um item ao quebrar. A raquete pega o item; se ele passar da raquete, some. A tela de Informações explica os itens para o streamer.
  - **Multibola** (azul, "×2", 1 em cada 4 itens): cada bola em jogo ganha uma cópia por 8 s. A cópia quebra tijolos e os pontos vão para o dono, mas não carrega poderes. Pegar outro multibola com cópias na tela renova o tempo.
  - **Pontos** (amarelo, "+"): o streamer ganha 5 pontos. Só cai com "Streamer pontua" marcado.
- Bola mais lenta: 240 px por segundo, para dar tempo de o chat ver a bola e mandar os comandos.
- Poucos jogadores (menos de 15): os poderes saem mais rápido, na proporção de 12 → 7 batidas: `!speed` com 3, bomba com 6, `!gravity` com 7 e `!shock` com 8.
- A cada 10 vezes que a bola encosta em tijolos (quebrando ou não), o viewer ganha 1 bomba, até no máximo 2 guardadas (com 2, os encostos não contam até ele usar uma). O `!bomb` usa a bomba e empurra as bolas num raio de 45 px. Não causa dano nem mexe nos tijolos, paredes ou raquete.
- A cada 12 vezes que a bola encosta em tijolos, o viewer ganha o `!gravity` (só 1; com ele pronto, os encostos não contam). Ao usar, a bola dele para e vira o centro de um campo azul de 60 px. As bolas dentro do campo (e as que entram nele) são puxadas e giram em volta do centro. Depois de 2 s, o campo explode e lança as bolas presas para fora, cada uma numa direção. A bola de quem usou segue com a velocidade que tinha. Em cima da bola, 🌀 mostra que o poder está pronto.
- A cada 13 vezes que a bola encosta em tijolos, o viewer ganha o `!shock` (só 1; com ele pronto, os encostos não contam). Ao usar, a bola dele fica elétrica (aura amarela) por 1,5 s e anda normal. Toda bola que chegar a até 30 px dela fica atordoada: anda a 1% da velocidade por 2 s, com faíscas amarelas, e um raio liga as duas bolas. Depois do atordoamento, a bola fica imune a outro `!shock` por 3 s. Em cima da bola, 🔋 mostra que o poder está pronto.
- Bola com um poder ativo (`!speed` por 5 s, `!bomb` na explosão, `!gravity` por 2 s, `!shock` por 1,5 s) não é afetada pelos poderes dos outros.
- Fila de poderes: um viewer só usa um poder por vez. Se mandar outro enquanto o primeiro está ativo, o novo espera na fila e sai assim que o anterior acabar (se ainda tiver a carga). O mesmo comando não entra duas vezes na fila.
- A partida acaba quando todos os tijolos forem quebrados.
- Fase 1 (chuva de tijolos): os tijolos não começam prontos, caem do céu. O total depende dos jogadores: 135 com até 15, aumentando aos poucos até 250 com 100 (no lobby a chuva já cai; no Pronto o total se ajusta). Eles se empilham nas 16 colunas, até 6 de altura, apoiados numa linha invisível (a altura da última linha de tijolos das outras fases). Cada tijolo cai até ficar em cima do de baixo; se um de baixo quebra, os de cima descem e se ajustam. Quanto mais tijolos na tela, mais devagar a chuva. A chuva já começa no lobby, enquanto o chat entra. O contador "Tijolos" mostra os da tela mais os que ainda vão cair, e a partida só acaba quando todos forem quebrados. Se um tijolo caindo encontra uma bola parada (ex: no `!gravity`), ele espera em cima dela, acima do campo inteiro. As outras fases continuam com os tijolos fixos.
- Fase 5 (esteira, fundo de fábrica): as 6 linhas de tijolos andam para os lados, cada uma num sentido e numa velocidade, e o tijolo que sai por uma borda volta pela outra. A fase começa com 80 tijolos e, durante a partida, entram mais pela borda da tela, nos buracos das esteiras (com um efeito de aparecer, nunca em cima de uma bola), até o total: 100 com até 15 jogadores, aumentando aos poucos até 150 com 100. O contador "Tijolos" mostra os da tela mais os que ainda vão entrar. Se um tijolo andando encosta numa bola, só empurra a bola (a batida conta quando a bola vai contra o tijolo). Não tem paredes. Quando sobram 5 tijolos ou menos, aparece "Tijolo chefão!": ele desce do teto e fica indo e voltando em cima das esteiras, até 3 vezes mais rápido conforme perde vida.
- Tijolo chefão (Fase 1): quando a chuva acaba e sobram 5 tijolos ou menos, aparece "Tijolo chefão!" e cai um tijolo grande e dourado (2 colunas × 2 linhas) com 20 de vida, nas colunas com menos tijolos. Quem der a última batida ganha 5 pontos. A partida só acaba depois que ele quebra.

## Modo intervalo (só o chat joga)

Para quando o streamer sai da live por um tempo. No menu, marque **Modo intervalo**, escolha a fase inicial e clique em **Iniciar**.

- Não tem raquete. O chão vira uma parede branca (na altura da raquete): as bolas quicam nos 4 lados e nunca caem.
- O streamer entra como uma bola (com o nome do canal, em azul-claro). Ela só ajuda a quebrar tijolos: fica fora do ranking e da regra do ausente.
- Não tem botão Pronto: a partida começa sozinha 20 s depois do Iniciar. As bolas esperam em linhas de 20, logo acima do chão.
- `!entrar` funciona a qualquer momento. No meio da fase, a bola nasce no chão e já sai jogando. Não tem lançar nem mirar: as bolas saem sozinhas.
- Fases em carrossel a partir da escolhida (ex: 3 → 4 → 5 → 1 → 2 → 3...). Quando os tijolos de uma fase acabam, aparece o ranking (10 primeiros, com 🥇🥈🥉) por 15 s, com a contagem para a próxima fase em cima. Ninguém precisa entrar de novo: as bolas passam de fase e os pontos somam.
- Fase 3 no intervalo: quando todos os tijolos quebram, cai um tijolo chefão com 30 de vida em cima da parede branca do meio. No modo normal, a Fase 3 continua sem chefão.
- Não cai item nenhum (nem pontos, nem multibola).
- Regra do ausente: no fim de cada fase, quem tinha um poder pronto havia mais de 20 s e não usou nenhum na fase perde os pontos que fez naquela fase (a bola continua no jogo). Quem não ganhou poder nenhum passa sem perder nada. Os ausentes aparecem embaixo do ranking.
- Quando alguém usa um poder, aparece "Fulano usou !bomb" em cima da bola. Quem entra no meio da fase aparece como "Fulano entrou".
- Botão **Voltei!** (embaixo do jogo): para o intervalo e mostra o ranking com os pontos de todas as fases.

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
│   ├── itens.js      itens que caem e poderes (!bomb, !gravity, !shock)
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
   - `padrao`: o desenho dos tijolos;
   - `chuva` (opcional, ex: `{ total: 250 }`): os tijolos caem do céu em vez de começarem prontos. O `total` vale com 100 jogadores; com até 15, caem 135. A vida de cada um é sorteada entre os números do `padrao`. No fim cai o tijolo chefão.
   - `esteira` (opcional, ex: `{ vel: 40, total: 150 }`): as linhas de tijolos andam para os lados. Use sem paredes. O `total` vale com 100 jogadores (com até 15, são 100): começa com os do `padrao` e os que faltam entram pela borda durante a partida. No fim desce o tijolo chefão.
   - `chefaoIntervalo` (opcional, ex: `{ parede: 1 }`): só no modo intervalo. Quando todos os tijolos quebram, cai um chefão com 30 de vida no centro da parede indicada (posição na lista de `paredes`, começando do 0).
## Hospedagem

O jogo é só HTML, CSS, JS e imagens. Pode ser publicado no GitHub Pages sem servidor. Cada streamer abre a página no próprio navegador.

## Créditos

- Arte: Daru
- Desenvolvimento: Clayton M.
