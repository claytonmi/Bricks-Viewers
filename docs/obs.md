# Usar no OBS

[Voltar ao README](../README.md)

A página se ajusta ao tamanho da tela: "Como jogar" à esquerda, o jogo no meio e o ranking à direita, todos com a altura do jogo. No OBS, a tela inteira aumenta ou diminui junto, então fica igual em 720p, 1080p ou maior.

- **Fonte Navegador** (recomendado): cole o link do jogo. Em **Largura** e **Altura**, use o tamanho da sua transmissão: **1280×720** ou **1920×1080**. Em PC fraco, 1280×720 pesa menos. Para mexer no menu e nos botões, selecione a fonte e clique em **Interagir**.
- **Captura de janela**: abra o jogo no navegador em tela cheia (F11) para não aparecer a barra do navegador.

**Partida normal, com a raquete:** o streamer precisa do mouse ou do teclado, então o mais simples é jogar no navegador e usar a **Captura de janela**. O botão do link não serve para esse caso.

**Tela de "já volto", sem clicar em nada:** no menu, conecte o canal, marque **Modo intervalo** e escolha a fase. Com isso, o botão **Copiar link para o OBS** é liberado. O link fica assim:

```
https://claytonmi.github.io/Bricks-Viewers/?canal=seu_canal&modo=intervalo&fase=1&vagas=75
```

1. No OBS, crie uma cena de "já volto" e adicione uma fonte Navegador com esse link, no tamanho da sua transmissão (1280×720 ou 1920×1080).
2. Nas propriedades da fonte, marque **Controlar áudio via OBS** e deixe **desligadas** as opções **Desligar fonte quando não visível** e **Atualizar navegador quando a cena se tornar ativa** (com elas ligadas, a página recarrega e o ranking se perde). O som do jogo aparece no mixer do OBS, com volume e mudo como qualquer outra fonte. Para ouvir também nos seus fones, ative o monitoramento em **Propriedades avançadas de áudio**. A tela de Informações do jogo tem uma aba **Usar no OBS** com esse passo a passo.
3. Ao trocar para essa cena, o jogo conecta no chat e o intervalo começa sozinho. O chat já pode digitar `!entrar`.
4. Quando voltar, é só trocar de cena: o jogo para, guarda o ranking e não calcula nem desenha nada enquanto a cena está fora do ar. Se preferir ficar na cena, digite `!voltei` no chat para mostrar o ranking com os 10 primeiros, sem contagem (só o streamer e os moderadores podem usar).
5. Ao abrir a cena de novo, o ranking aparece com uma contagem de 30 s, e depois começa um intervalo novo: a pontuação zera e o chat digita `!entrar` de novo. Sair de cena durante a contagem cancela a contagem, e ela recomeça quando a cena voltar. Sem nenhum jogador, o jogo novo abre direto.
6. Para começar na hora, digite `!recomecar` no chat na tela do ranking (streamer ou moderador).
7. Fechar o OBS apaga tudo: a próxima live começa do zero.

Aberto por esse link, o jogo não mostra botões, porque no OBS não dá para clicar: tudo é feito pelos comandos no chat.

O streamer e os moderadores também controlam o som pelo chat, em qualquer modo: `!mudo`, `!som` e `!volume 30` (de 0 a 100). Ao fechar o OBS, o som do jogo volta ao padrão; o volume do mixer do OBS continua como estava.

Sem `&modo=intervalo`, o link só conecta no chat, e a partida começa pelo menu, com o Interagir.
