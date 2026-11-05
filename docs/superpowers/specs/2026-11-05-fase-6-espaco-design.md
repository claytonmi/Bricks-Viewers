# Fase 6: Espaço

Documento de desenho. Os caminhos de arquivo seguem a estrutura nova de pastas (`docs/desenvolvimento.md`).

Marcação usada:
- **[Clayton]**: decidido pelo Clayton.
- **[Sugestão aceita]**: proposta na conversa, que o Clayton confirmou ou não contestou ao pedir este documento.
- **[A ajustar]**: valor inicial, para acertar jogando.

## Por que esta fase existe

Uma fase nova com cara própria, que fique boa de assistir na live e no modo intervalo. O interesse vem de dois pontos: as bolas somem em uma espiral e reaparecem em outro lugar, e os meteoros se partem e vão sendo repostos, com a cor avisando quanto falta para acabar.

## Objetivos

- Tijolos no formato de meteoros redondos e irregulares, com colisão redonda de verdade.
- Um buraco de minhoca de sentido único, que aparece, some e volta em outro lugar.
- Funcionar igual na partida normal e no modo intervalo, com até 100 bolas.

## Fora do escopo

- Chefão: esta fase não tem. **[Clayton]**
- Mudar a colisão ou o visual das outras fases.
- Comandos novos no chat. O jogo continua só lendo o chat.
- Dano dobrado na primeira batida depois de sair do buraco: foi sugerido na conversa e não entrou. Pode voltar depois de testar a fase.

## O que não pode acontecer

- Uma bola se perder dentro do buraco. **[Clayton]**
- Um meteoro passar por dentro de um buraco. **[Clayton]** (Passar por trás de outro meteoro é permitido: mudança pedida pelo Clayton em 2026-11-05, para os meteoros se espalharem pela tela e não ficarem só na borda.)
- A bola bater "no nada" em volta de um meteoro. **[Clayton]**
- A bola sair do buraco perto da raquete, sem dar tempo de reagir. **[Clayton]**

## Mapa

- Os meteoros ficam espalhados, sem formar linhas, com tamanhos variados, na parte de cima da tela. A parte de baixo fica livre para as bolas. **[Clayton]**
- A área dos meteoros e dos buracos vai de `y` 70 a `y` 400, numa tela de 1200×680. Assim, ela fica acima das bolas no lobby, que ficam de `y` 450 para baixo. **[A ajustar]**
- O mapa já nasce com áreas vazias, para os buracos terem onde abrir. **[Clayton]**
- Cerca de 20 meteoros na tela ao mesmo tempo, número que depois se mantém com a reposição. O desenho do Clayton mostra 15. **[A ajustar]**

## Meteoros

### Formato e colisão

- Pedra arredondada, irregular e lascada, cada uma um pouco diferente. Racha mais conforme perde vida e gira devagar, só no visual. **[Sugestão aceita]**
- A colisão é um círculo um pouco menor que o desenho. O rebote da bola segue a curva do círculo. **[Sugestão aceita]**
- Depois de parado, o meteoro fica no lugar. **[Sugestão aceita]**
- Pode ser desenhado por código no canvas, para ficar leve e variar a forma e a cor sem precisar de muitas imagens. A escolha fica com quem programar, desde que o resultado tenha esse visual.

### Tamanhos, vida e pontos

| | Raio | Batidas | Ponto ao quebrar |
|---|---|---|---|
| Pequeno | 18 a 28 px **[A ajustar]** | 1 | 1 |
| Grande | 38 a 48 px **[A ajustar]** | 5 **[Clayton]** | 1, e vira dois pedaços |
| Pedaço | metade do raio do grande | 1 | 1 |

- A resistência depende do tamanho, não da cor. **[Sugestão aceita]**
- Os pedaços nascem dentro do espaço que era do grande, em lados opostos. Como cada um tem metade do raio, os dois cabem sem encostar em outro meteoro. A direção é sorteada.
- O ponto vai para o dono da bola, como hoje (a cópia do multibola pontua para o dono).
- Cada batida conta para os poderes, como nos tijolos.
- Itens: 20% dos meteoros soltam item, como no resto do jogo. No meteoro grande, o item sai quando o último pedaço quebra.

### Cores e fim da fase

- Os meteoros chegam em três etapas: marrons, depois azulados e por último dourados. **[Clayton]**
- Cada etapa ocupa um terço do total. A cor é definida pela ordem de chegada do meteoro. Os pedaços herdam a cor do grande. **[Sugestão aceita]**
- A fase termina quando não resta nenhum meteoro para chegar nem na tela. Na prática, é quando o último dourado quebra. **[Clayton]**

### Quantidade

- Usar `totalPorJogadores`, a mesma conta das outras fases: 100 meteoros com até 15 jogadores, subindo aos poucos até 150 com 100 jogadores. **[Sugestão aceita]** O Clayton falou em "150, 170"; 150 é o valor inicial e fica em um único lugar, para ser fácil trocar.
- Um meteoro grande conta como 1 nesse total, mesmo virando dois pedaços. **[Sugestão aceita]**
- O contador no alto da tela mostra "Meteoros" em vez de "Tijolos" nesta fase. O número é o de meteoros que faltam na tela e para chegar.

### Reposição

1. Quando um meteoro pequeno quebra, ou quando os dois pedaços de um grande quebram, sai um meteoro novo. **[Clayton]**
2. Ele entra por cima ou pela lateral da tela e vai bem devagar (cerca de 40 px/s **[A ajustar]**) até perto do lugar vazio. **[Clayton]**
3. Passa por trás dos outros meteoros, sem parar, e se acomoda no lugar sorteado (regra alterada pelo Clayton em 2026-11-05). Só para diante de uma bola logo à frente ou de uma reserva de buraco. Um pedaço que nasce com parte fora da tela também vai para um lugar na área.
4. Se houver uma bola logo à frente, espera, como o chefão faz hoje ao descer. **[Sugestão aceita]**
5. Desvia dos buracos abertos ou sumindo e nunca para dentro deles. **[Sugestão aceita]**
6. Não pode ficar parado fora da tela nem fora da área dos meteoros. Se o caminho estiver bloqueado antes de chegar à área, ele escolhe outro destino.

Enquanto se move, a bola bate nele normalmente.

## Buraco de minhoca

### Ciclo

1. Aparece cerca de 5 s depois de a partida começar, nunca durante o lobby ou a contagem. **[Clayton]**
2. A entrada e a saída surgem aos poucos em lugares sorteados, entre os meteoros, na área definida acima. **[Clayton]**
3. Ficam abertas por cerca de 8 s. **[A ajustar]**
4. Quando o tempo acaba, a entrada para de puxar bolas. **[Clayton]**
5. A saída espera todas as bolas que entraram saírem. **[Clayton]**
6. As duas somem devagar, em cerca de 1,5 s. **[A ajustar]**
7. Depois de cerca de 4 s, reaparecem em outros lugares. **[A ajustar]**

A entrada e a saída mudam de lugar juntas, sempre longe uma da outra (no mínimo 300 px **[A ajustar]**).

### Lugar dos buracos

- Precisam de um espaço livre de meteoros, com folga para a bola passar. **[Clayton]**
- Se não houver lugar para os dois, esperam abrir espaço e tentam de novo. **[Clayton]**
- Enquanto existem, esse espaço fica reservado: nenhum meteoro entra nele.
- Um buraco tem cerca de 24 px de raio, um pouco menor que um meteoro grande. **[Clayton]**, sobre o tamanho menor; **[A ajustar]**, sobre o número.

### O que acontece com a bola

1. A bola que chega perto da entrada (cerca de 45 px do centro **[A ajustar]**) é capturada. Antes disso, a trajetória dela não muda.
2. Ela faz uma espiral até o centro, em cerca de 0,8 s, encolhendo. **[A ajustar]**
3. Sai pela saída **na mesma direção e velocidade em que entrou**. **[Clayton]**
4. A saída só solta bolas: não puxa nada, e a bola que passa por ela segue reto. **[Clayton]**

Várias bolas podem estar na espiral ao mesmo tempo, cada uma no seu tempo. As bolas não colidem entre si no jogo atual, então não é preciso formar fila.

### O buraco não afeta

- Meteoros: nunca são puxados. **[Clayton]**
- Bola presa no campo do `!gravity` ou que já esteja na espiral: não é capturada de novo.

### Durante a espiral

- A bola não bate em nada, não pontua e não sofre efeito de poderes.
- O dono não pode usar poder enquanto ela está lá. O pedido espera, como já acontece com a bola presa no `!gravity`.
- As cópias do multibola e a bola do streamer entram no buraco como qualquer outra.

### Garantia contra o limbo

- A fase terminou, a partida reiniciou ou a cena do OBS mudou com uma bola na espiral: ela é devolvida na hora. **[Clayton]**
- Se a bola deixar de existir durante a espiral (o tempo da cópia do multibola acabou, ou o simulador tirou as bolas falsas), ela sai da lista do buraco, para a saída não ficar esperando para sempre.
- A saída nunca some antes de a lista de bolas em trânsito estar vazia.
- A bola na espiral continua contando como "no ar" para a regra de pontos do streamer. Por isso, deve seguir em `estado === 'jogando'`, com uma marca própria, no mesmo estilo de `presoEm`. O laço das cópias em `atualizarJogo` hoje não confere `presoEm`, então precisa pular também as cópias que estão na espiral.

## Visual

- A entrada é escura, com espiral. A saída é clara. Quem assiste à live precisa entender que a bola só vai em um sentido. **[Clayton]**
- Fundo espacial: `assets/imagens/fases/fase-6.png`, 1200×680, como os das outras fases. Ele também aparece na miniatura do menu.
- A imagem é criada por código, uma única vez, e salva como PNG. **[Clayton]** O jogo a carrega como qualquer outro fundo, sem gastar processamento desenhando estrelas a cada quadro. O fundo fica escuro e discreto, para os meteoros, as bolas e os buracos se destacarem.

## Encaixe no jogo

- A fase entra em `js/dados/fases.js` com um campo novo, como a esteira (`espaco: { total: 150 }`). Vem logo depois da Fase 5 e antes de qualquer fase com `mes`.
- O modo intervalo já percorre a lista de fases, então ela entra no carrossel sem regra extra.
- A regra de chefão em `js/jogo/chefao.js` não pode valer para esta fase.
- Lobby e contagem: os meteoros já aparecem parados. A reposição e os buracos só funcionam durante a partida.
- `posicaoBloqueada` e qualquer outro código que trate tijolo como retângulo precisam conhecer o círculo. Sugestão: manter `x, y, w, h` no meteoro (com `w = h = 2 × raio`) e marcar que a colisão é redonda, para mexer pouco no resto. Esta parte fica a critério de quem programar.
- Não mudar o comportamento das outras fases.

## Ordem de trabalho

1. Clayton commita a reorganização das pastas.
2. Refatoração interna (`desenhar`, `finalizar`, chefão, colisão), que mexe nos mesmos arquivos.
3. Fase 6.

## Como saber que ficou pronto

- `node --check` passa em todos os arquivos.
- Sem erros no console, em partida normal e no modo intervalo com 75 bolas.
- Nenhuma bola some: ao fim de cada ciclo do buraco, o número de bolas em jogo é igual ao do início.
- Encerrar a fase com bolas na espiral não deixa nenhuma para trás.
- Nenhum meteoro sobreposto a outro ou a um buraco aberto.
- A fase termina no último dourado, com o total certo para 15 e para 100 jogadores.
- As outras fases continuam iguais.
- Atualizar o `README.md` e os `docs/` públicos que listam as fases.
