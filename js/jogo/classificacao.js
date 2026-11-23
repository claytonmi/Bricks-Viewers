// ===== Classificação do ranking =====
// Mais pontos primeiro. Empate em pontos: fica na frente quem chegou primeiro nessa pontuação
// (como num quiz: quem responde antes leva). Cada jogador guarda em pontosEm o momento do jogo em que chegou
// nos pontos que tem agora; no modo intervalo os pontos somam entre as fases e vale quando chegou no total.
// As posições nunca se repetem: 1º, 2º, 3º...

const BOLA_STREAMER_CHAVE = '__streamer__';

// Ordena as linhas: mais pontos; em empate, quem chegou antes (pontosEm menor). Se até isso empatar
// (mesmo instante, ou os dois com 0 pontos), o streamer fica atrás dos viewers e o resto segue a ordem de entrada.
function ordenarLinhas(linhas) {
  return linhas
    .map((l, i) => ({ l, i }))
    .sort((a, b) => {
      if (b.l.pontos !== a.l.pontos) return b.l.pontos - a.l.pontos;
      if (a.l.em !== b.l.em) return a.l.em - b.l.em;
      if (!!a.l.streamer !== !!b.l.streamer) return a.l.streamer ? 1 : -1;
      return a.i - b.i;
    })
    .map(x => x.l);
}

// Linhas do ranking (viewers e, se marcado, o streamer), já ordenadas, com a posição de cada uma
function montarLinhas() {
  const linhas = viewers.filter(b => !b.streamer)
    .map(b => ({ chave: b.nome, nome: b.nome, pontos: b.pontos, em: b.pontosEm || 0, streamer: false, ref: b }));
  if (streamerPontua) {
    linhas.push({ chave: BOLA_STREAMER_CHAVE, nome: 'Streamer', pontos: streamerPts, em: streamerPtsEm, streamer: true, ref: null });
  }
  return ordenarLinhas(linhas).map((l, i) => { l.posicao = i + 1; return l; });
}
