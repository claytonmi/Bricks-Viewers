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
│       ├── espaco/         meteoros da Fase 6
│       ├── fases/          fundos das fases
│       ├── interface/      imagens do menu e selo de fundador
│       ├── skins/          skins da raquete
│       └── sprites/        bola, raquete e tijolos
├── css/
│   ├── base.css            variáveis (inclusive as cores das telas), página e utilitários
│   ├── controles.css       botões, campos e chaves de ligar e desligar
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
    │   ├── contador.js     contador de acessos (GoatCounter)
    │   └── fundador.js     selo de fundador
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
    │   ├── aparencia.js    cor e skin da raquete
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

## Imagens dos meteoros (Fase 6)

Os meteoros vêm de `assets/imagens/espaco/`: `meteoro-<cor>-<número>.png`, com as cores `marrom`, `azul` e `dourado` (o primeiro terço dos meteoros da partida é marrom, o segundo azul e o último dourado) e 3 formatos de cada (`1`, `2` e `3`, sorteados para cada meteoro). As imagens carregam quando a fase é montada.

Para trocar a arte, é só editar ou substituir esses PNGs, mantendo os mesmos nomes. Cuidados:

- Imagem quadrada, com fundo transparente.
- O meteoro deve ocupar a mesma proporção das imagens atuais: nas de 128 × 128, o raio é de 60 px (um pouco de margem em volta). Se mudar essa proporção, ajuste `METEORO_IMAGEM_RAIO` em `js/jogo/espaco.js`; senão, o desenho fica maior ou menor que a área onde a bola bate.
- O meteoro gira devagar no jogo, então a imagem não precisa ter "lado de cima".
- As trincas que aparecem quando o meteoro grande perde vida são desenhadas pelo jogo por cima da imagem.

Se uma imagem faltar ou não carregar, o jogo desenha o meteoro sozinho, então ele nunca fica invisível.

A raquete da Fase 6 (disco voador) não fica nesta pasta: ela é a skin "Disco Voador" e vem do servidor, que também deixa usar o disco em outras fases. No jogo ela ocupa 150 × 36 (a imagem da partida tem o dobro, 300 × 72). A linha onde a bola rebate fica 10 px abaixo do topo da imagem, no alto da borda do disco; a cúpula sobe acima dela. Ao editar, mantenha a borda do disco nessa altura. O rastro de velocidade é desenhado pelo jogo. Sem o servidor, o jogo desenha o disco pelo código.

## Skins da raquete

As skins ficam em `assets/imagens/skins/<id>.png`, com 300 × 32 (o dobro da raquete, que no jogo tem 150 × 16), fundo transparente. Para criar uma nova:

1. Salve a imagem nessa pasta, com nome em minúsculas (ex: `gelo.png`).
2. Acrescente uma linha em `SKINS_RAQUETE`, em `js/nucleo/config.js` (ex: `{ id: 'gelo', nome: 'Gelo' }`).

Essas ficam no jogo e são de todos. Skins que não podem ficar públicas (Fundador, por tempo limitado e, no futuro, pagas) ficam só no servidor: o jogo pergunta ao conectar quais o canal pode usar e baixa as imagens de lá (`js/interface/aparencia.js`). Elas não vão para este repositório.

No modo intervalo, a skin vira a barra de baixo, no mesmo tamanho da raquete (nada estica). As pontas (33% de cada lado da imagem, com os enfeites) e o desenho do centro (40% a 60% da imagem) aparecem inteiros; o espaço entre eles é preenchido repetindo o pedaço de 33% a 40%, um normal e um espelhado. Então desenhos do centro devem caber entre 40% e 60% da largura, e o pedaço de 33% a 40% deve ser liso ou com um padrão que se repete.

## Imagens da Fase Natalina

As artes da fase de Natal vêm de `assets/imagens/natal/` e carregam quando a fase é montada:

| Arquivo | O que é | Tamanho no jogo (largura × altura) |
|---|---|---|
| `rena-treno.png` | rena puxando o trenó (olhando para a direita; o jogo espelha quando ela vai para a esquerda) | 132 × 52 |
| `papai-noel-saco.png` | chefão saco do Papai Noel (a vida aparece por cima) | 110 × 84 |
| `presente-<cor>.png` | presentinhos que caem do saco (`vermelho`, `verde`, `dourado`, `azul`, `rosa`) | 14 × 14 |

A raquete da fase (a bengala) não fica nesta pasta: ela vem do servidor, como a skin "Bengala Doce".

A imagem é encaixada nesse tamanho sem distorcer (centralizada e apoiada embaixo), então dá para desenhar maior, por exemplo no dobro. O ideal é manter a mesma proporção da tabela: uma imagem bem mais alta ou mais larga aparece menor dentro do espaço. Use PNG com fundo transparente. Se uma imagem faltar ou não carregar, o jogo usa o desenho do próprio código.

## Contador de acessos

O site conta as visitas com o [GoatCounter](https://www.goatcounter.com), que não usa cookies. Além das visitas, conta dois eventos: `copiou-link-obs` (clique em **Copiar link do OBS**) e `abriu-no-obs` (página aberta pelo link do OBS). Nenhum nome de canal ou de viewer vai para o contador: o endereço é enviado sem a parte depois do `?`.

Para ligar:

1. Crie uma conta em goatcounter.com e escolha o código do site (o `xxx` de `https://xxx.goatcounter.com`).
2. Em `js/servicos/contador.js`, coloque esse código em `CONTADOR_CODIGO`.

Com o código vazio, o contador fica desligado. Abrindo o jogo pelo próprio computador (`localhost`), o GoatCounter não conta.
