# Desenvolvimento

[Voltar ao README](../README.md)

## Estrutura do projeto

```
Bricks-Viewers/
├── index.html              página principal (precisa ficar na raiz: é o endereço do link do OBS)
├── README.md
├── docs/                   manual do jogo e guia de desenvolvimento
├── assets/
│   ├── audio/              música
│   └── imagens/
│       ├── fases/          fundos das fases
│       ├── interface/      imagens do menu
│       └── sprites/        bola, raquete e tijolos
├── css/
│   ├── base.css            variáveis, página e utilitários
│   ├── layout.css          colunas, tela do jogo, camadas e rodapé
│   ├── paineis.css         Como jogar e ranking ao lado do jogo
│   ├── simulador.css       painel do simulador
│   ├── menu.css            menu do streamer
│   ├── ranking-final.css   ranking final
│   ├── informacoes.css     tela de informações
│   └── responsivo.css      telas menores (sempre o último)
└── js/
    ├── nucleo/
    │   ├── config.js       medidas, velocidades e tempos
    │   └── estado.js       variáveis do jogo
    ├── dados/
    │   ├── fases.js        fases: tijolos, paredes, cores e fundos
    │   └── arquivos.js     imagens carregadas ao abrir
    ├── servicos/
    │   ├── audio.js        música e botão de som
    │   ├── twitch.js       conexão com o chat
    │   └── contador.js     contador de acessos (GoatCounter)
    ├── jogo/
    │   ├── fisica.js       bola, rebotes e colisões
    │   ├── itens.js        itens que caem
    │   ├── poderes.js      !speed, !bomb, !gravity, !shock e fila de poderes
    │   ├── fase.js         montagem da fase
    │   ├── chuva.js        fases com chuva de tijolos
    │   ├── chefao.js       tijolo chefão
    │   ├── esteira.js      fases com esteira
    │   ├── espaco.js       fase 6: meteoros e buraco de minhoca
    │   ├── jogadores.js    entrada de viewers, pontos e avisos
    │   ├── comandos.js     comandos do chat
    │   ├── partida.js      ciclo da partida e ranking final
    │   ├── intervalo.js    modo intervalo
    │   └── eventos/        fases de evento
    ├── render/
    │   ├── imagens.js      carrega e pinta as imagens
    │   └── desenho.js      desenho na tela
    ├── interface/
    │   ├── escala.js       tamanho da tela
    │   ├── menu.js         menu, fases e informações
    │   ├── obs.js          link e cena do OBS
    │   ├── entrada.js      teclado e mouse
    │   └── ranking.js      ranking lateral e "Copiar top 3"
    ├── ferramentas/
    │   └── simulador.js    modo simulação (testes sem a Twitch)
    └── main.js             loop principal (sempre o último)
```

## Decisões de arquitetura

- **Sem etapa de build e sem instalar nada.** O jogo é só HTML, CSS, JS e imagens, publicado no GitHub Pages.
- **Scripts clássicos, sem `import`.** Módulos ES não funcionam ao abrir o `index.html` com duplo clique, então os arquivos compartilham variáveis globais.
- **A ordem de carregamento importa.** Os arquivos são carregados na ordem listada no `index.html`: o código solto de cada arquivo usa o que os anteriores definiram. Um arquivo novo precisa entrar na posição certa dessa lista. O mesmo vale para o CSS.
- **Nomes de arquivo sempre em minúsculas.** O GitHub Pages diferencia maiúsculas de minúsculas, e o Windows não: um caminho com a caixa errada funciona no seu computador e quebra no site.

## Como criar uma fase nova

1. Abra `js/dados/fases.js`.
2. Copie um bloco de fase e ajuste:
   - `fundo`: imagem da fase (ex: `assets/imagens/fases/fase-5.png`);
   - `cores`: cores dos tijolos, ou `null` para cinza;
   - `paredes`: retângulos `{x, y, w, h}` ou segmentos `{x1, y1, x2, y2, espessura}`;
   - `padrao`: o desenho dos tijolos;
   - `chuva` (opcional, ex: `{ total: 250 }`): os tijolos caem do céu em vez de começarem prontos. O `total` vale com 100 jogadores; com até 15, caem 135. A vida de cada um é sorteada entre os números do `padrao`. No fim cai o tijolo chefão.
   - `esteira` (opcional, ex: `{ vel: 40, total: 150 }`): as linhas de tijolos andam para os lados. Use sem paredes. O `total` vale com 100 jogadores (com até 15, são 100): começa com os do `padrao` e os que faltam entram pela borda durante a partida. No fim desce o tijolo chefão.
   - `chefaoIntervalo` (opcional, ex: `{ parede: 1 }`): só no modo intervalo. Quando todos os tijolos quebram, cai um chefão com 40 de vida no centro da parede indicada (posição na lista de `paredes`, começando do 0).

## Contador de acessos

O site conta as visitas com o [GoatCounter](https://www.goatcounter.com), que não usa cookies. Além das visitas, conta dois eventos: `copiou-link-obs` (clique em **Copiar link do OBS**) e `abriu-no-obs` (página aberta pelo link do OBS). Nenhum nome de canal ou de viewer vai para o contador: o endereço é enviado sem a parte depois do `?`.

Para ligar:

1. Crie uma conta em goatcounter.com e escolha o código do site (o `xxx` de `https://xxx.goatcounter.com`).
2. Em `js/servicos/contador.js`, coloque esse código em `CONTADOR_CODIGO`.

Com o código vazio, o contador fica desligado. Abrindo o jogo pelo próprio computador (`localhost`), o GoatCounter não conta.
