# Desempate no pódio: design

Data: 2026-11-08
Status: versão 2, aguardando revisão do Clayton

## Objetivo

Quando dois ou mais jogadores empatam em pontos e a disputa envolve as posições de 1º a 4º, eles jogam um desempate ao vivo, no fim da partida. O chat vê a disputa acontecer, e a ordem fica justa sem depender de quem entrou primeiro.

## Quando acontece

- Só no fim da partida: quando todos os tijolos (ou meteoros, na Fase 6) acabam e o ranking final aparece.
- Vale para todas as fases e para o modo intervalo (OBS). No intervalo, o desempate acontece no fim da rodada.
- Vale quando a partida tem o streamer jogando (ele entra no desempate se estiver empatado com outros que jogam).

## Quem entra no desempate

- Um grupo é formado por todos com a mesma pontuação, desde que o grupo inclua alguma posição de 1º a 4º.
- Os grupos são resolvidos do primeiro ao último: primeiro o grupo do topo, depois os outros.
- Exemplos:
  - 1º 40, 2º 30, 3º 30: jogam o 2º e o 3º. O vencedor fica em 2º, o outro em 3º.
  - 1º 40, 2º 40, 3º 30: jogam o 1º e o 2º. O vencedor fica em 1º.
  - 1º 40, 2º 30, 3º 30, 4º 30: jogam os três de 30. Os dois primeiros ganham 2º e 3º; o último fica em 4º.
- Empates que não incluem posição de 1º a 4º não jogam. Ficam com o mesmo número no ranking (ver "Ranking exibido").
- Um grupo tem no máximo 4 bolas, porque o desempate só acontece com empate no topo, que é raro.

## Ranking exibido

- As posições são contadas por pontuação diferente, sem pular número: se há dois em 4º, o próximo é 5º (e não 6º).
- Quem está empatado abaixo do 4º fica agrupado sob a mesma posição, como uma sublista (ex.: 5º: Fábio, Gabi, Hugo).
- Quando há desempate no pódio, aparece uma mensagem grande e destacada em cima do ranking, dizendo qual desempate vai acontecer (ex.: "Desempate: 2º e 3º lugar"). A mensagem fica no ranking, com uma contagem regressiva curta antes de começar.
- Sem desempate, o ranking aparece como sempre.

## Mini-jogo: tijolo perseguidor

- Os jogadores do grupo jogam na mesma tela da fase, com a raquete e as bolas.
- No topo da tela, durante o desempate, aparece um cartaz de mata-mata com os disputantes, por exemplo "Mata-mata: 2º × 3º lugar" ou "Desempate: 1º × 2º". Quando há mais de um grupo, o cartaz mostra o grupo atual e a ordem dos grupos (ex.: "Desempate 1 de 2: 1º × 2º").
- **Tempo total de 1 minuto para o grupo inteiro.** Se o tempo acabar com posições em aberto, essas posições ficam com a ordem que tinham antes do desempate.
- **Começo:** nos primeiros 10 s, o tijolo fica parado, para as bolas se posicionarem.
- **Perseguição:** depois, o tijolo foge das bolas do grupo, em trajetos aleatórios e com velocidade que muda um pouco. Ele não segue um caminho fixo (nada de círculo ou hexágono). Ele nunca fica parado depois do começo.
- **Vida do tijolo = número de bolas do grupo.** Com 2 bolas, o tijolo tem 2 de vida; com 3, tem 3; com 4, tem 4. Cada encosto de uma bola no tijolo tira 1 de vida e dá 1 ponto de desempate para essa bola.
- **Quebra e empate:** quando a vida chega a 0, o tijolo quebra e a ordem é pelos pontos de desempate. Se o topo continuar empatado nesse momento, o tijolo ganha +1 de vida e segue. Quem encostar por último, e não estiver empatado, decide a posição.
- **Pódio por etapas:** quando o primeiro lugar do grupo está decidido, as outras bolas seguem para a próxima posição com um tijolo de vida igual ao número de bolas que sobraram. Assim, um grupo de 3 vira um desempate de 3 bolas e depois um de 2.
- **Sem pontos no ranking.** Os pontos de desempate são um contador separado e não mudam o ranking. Assim, um jogador de 4º não sobe para 1º por causa de uma sorte no mini-jogo.
- **Streamer.** A bola do streamer entra na mesma regra: é atraída pelo tijolo e conta como as outras. A raquete continua parada embaixo e não interfere no mini-jogo.

## Streamer no intervalo (OBS)

- Se o desempate está pendente no ranking do fim da partida e o streamer clica em **Voltei** (ou usa `!voltei`), o intervalo para e aparece o ranking com dois botões: **Continuar ao desempate** e **Cancelar**.
- **Continuar ao desempate:** os grupos empatados jogam o mini-jogo na sequência, como descrito acima.
- **Cancelar:** o ranking final fica como está, com os empates agrupados sob a mesma posição, sem mini-jogo.
- **Trocar de cena durante o desempate ou o ranking:** tudo volta ao normal, como já funciona hoje no OBS. O jogo para e, ao voltar à cena, começa um intervalo novo (ver `js/interface/obs.js`). O desempate não é retomado.

## Streamer

- O streamer joga o desempate com a sua bola, se estiver no grupo.
- O streamer não entra em grupos abaixo do pódio: ele só joga o desempate se empatar com alguém de 1º a 4º.

## Fora do escopo

- Não muda o cálculo de pontos durante a partida nem no desempate.
- Não usa o contador de poderes usados (a regra de poderes foi descartada na conversa).

## Em aberto (confirmar)

1. **Empate com vida extra.** Proposta: se o tijolo quebra e o topo continua empatado, ele ganha +1 de vida e segue. Pode repetir, mas cada repetição exige um novo encosto, então termina rápido.
2. **Tempo de espera.** Proposta: 10 s parado antes de começar a perseguir. Pode ser maior ou menor.
3. **Tempo do grupo.** Proposta: 1 minuto para o grupo inteiro. Se o grupo do pódio for de 3, 1 minuto pode ser curto. Se preferir, o tempo pode crescer com o número de bolas.
4. **Contagem regressiva.** Proposta: 5 s de mensagem grande antes de começar.
