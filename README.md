# Bricks Viewers

Jogo de tijolos para live na Twitch. O streamer controla a raquete e o chat entra no jogo com uma bola cada um. Quem quebrar mais tijolos ganha mais pontos.

**Jogar:** [claytonmi.github.io/Bricks-Viewers](https://claytonmi.github.io/Bricks-Viewers/)

## Como abrir

1. Dê duplo clique no `index.html`.
2. Digite o nome do canal (ex: `hercules_sc`) e clique em **Conectar**.
3. Quando conectar, o botão **Iniciar** libera.
4. Escolha a fase e a quantidade de viewers, e clique em **Iniciar**.

Não precisa de login na Twitch. O jogo só lê o chat.

Também dá para baixar o projeto e abrir o `index.html` com um duplo clique. Não precisa instalar nada.

## Documentação

- [Usar no OBS](docs/obs.md): fonte Navegador, tela de "já volto" e som
- [Comandos no chat](docs/comandos.md)
- [Regras do jogo](docs/regras.md): pontos, poderes, itens e fases
- [Modo intervalo](docs/modo-intervalo.md): só o chat joga, enquanto o streamer está fora
- [Simulador](docs/simulador.md): testar sem a Twitch
- [Desenvolvimento](docs/desenvolvimento.md): estrutura do projeto e como criar uma fase nova

## Hospedagem

O jogo é só HTML, CSS, JS e imagens. Pode ser publicado no GitHub Pages sem servidor. Cada streamer abre a página no próprio navegador.

## Créditos

- Arte: Daru
- Desenvolvimento: Clayton M.
