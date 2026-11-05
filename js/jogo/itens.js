// ===== Itens que caem =====
// Tijolos marcados soltam um item e a raquete pode pegar.

// Tijolo marcado quebrou: solta um item no centro dele.
// 1 em 4 é multibola; os outros dão pontos ao streamer (só caem com "Streamer pontua" marcado).
function soltarItem(t) {
  if (modoIntervalo) return; // modo intervalo: sem raquete, não cai item nenhum
  const tipo = Math.random() < MULTIBOLA_CHANCE ? 'multibola' : 'pontos';
  if (tipo === 'pontos' && !streamerPontua) return;
  itensCaindo.push({ x: (t.x + t.w / 2) % W, y: t.y + t.h, tipo }); // % W: tijolo da esteira passando da borda
}

// Multibola: cada bola em jogo ganha uma cópia (se já tem cópias na tela, só renova o tempo)
function ativarMultibola(agora) {
  anunciar('Multibola!', agora);
  if (copias.length) {
    for (const c of copias) c.ate = agora + MULTIBOLA_TEMPO;
    return;
  }
  for (const b of viewers) {
    if (b.estado !== 'jogando' || b.presoEm || b.buraco) continue;
    // sai do mesmo lugar, espelhada para o outro lado
    const c = { dono: b, cor: b.cor, x: b.x, y: b.y, vx: -b.vx || VEL_BASE * 0.5, vy: b.vy,
                estado: 'jogando', velExtraAte: 0, atordoadaAte: 0, ate: agora + MULTIBOLA_TEMPO };
    garantirMovimento(c);
    copias.push(c);
  }
}

// Move os itens e trata a pegada com a raquete; apaga explosões antigas
function atualizarItens(dt, agora) {
  for (const it of itensCaindo) it.y += ITEM_VEL * dt;

  itensCaindo = itensCaindo.filter(it => {
    const pegou = it.y + ITEM_TAM / 2 >= PADDLE_Y &&
                  it.y - ITEM_TAM / 2 <= PADDLE_Y + PADDLE_H &&
                  Math.abs(it.x - paddleX) <= PADDLE_W / 2;
    if (pegou) {
      if (it.tipo === 'multibola') {
        ativarMultibola(agora);
        paddleBrilhoAte = agora + 600;
      } else if (streamerPontua) { // o ponto do item só vale quando "Streamer pontua" está marcado
        streamerPts += ITEM_PONTOS;
        paddleBrilhoAte = agora + 600;
      }
      return false;
    }
    // passou da raquete sem pegar: já era, o item some
    return it.y - ITEM_TAM / 2 <= PADDLE_Y + PADDLE_H;
  });

  explosoes = explosoes.filter(e => agora - e.inicio < (e.tempo || BOMBA_TEMPO));
}
