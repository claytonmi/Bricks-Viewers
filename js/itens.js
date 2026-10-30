// ===== Itens que caem e bomba dos viewers =====
// Tijolos marcados soltam um item; a raquete pode pegar. !bomb empurra as bolas perto.

// Tijolo marcado quebrou: solta um item no centro dele
function soltarItem(t) {
  itensCaindo.push({ x: t.x + t.w / 2, y: t.y + t.h });
}

// Move os itens e trata a pegada com a raquete; apaga explosões antigas
function atualizarItens(dt, agora) {
  for (const it of itensCaindo) it.y += ITEM_VEL * dt;

  itensCaindo = itensCaindo.filter(it => {
    const pegou = it.y + ITEM_TAM / 2 >= PADDLE_Y &&
                  it.y - ITEM_TAM / 2 <= PADDLE_Y + PADDLE_H &&
                  Math.abs(it.x - paddleX) <= PADDLE_W / 2;
    if (pegou) {
      // o ponto do item só vale quando "Streamer pontua" está marcado
      if (streamerPontua) {
        streamerPts += ITEM_PONTOS;
        paddleBrilhoAte = agora + 600;
      }
      return false;
    }
    return it.y < H + ITEM_TAM; // some quando sai da tela
  });

  explosoes = explosoes.filter(e => agora - e.inicio < BOMBA_TEMPO);
}

// !bomb: empurra as bolas que estão até BOMBA_RAIO da bola que deu o comando
// (não afeta paredes, tijolos nem a raquete; a bola de quem deu o comando não se move)
function explodirBomba(b, agora) {
  explosoes.push({ x: b.x, y: b.y, inicio: agora });
  for (const o of viewers) {
    if (o === b || o.estado !== 'jogando') continue;
    let dx = o.x - b.x;
    let dy = o.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d > BOMBA_RAIO) continue;
    if (d === 0) { dx = 0; dy = -1; } else { dx /= d; dy /= d; }
    // a bola segue para longe da explosão, mantendo a velocidade que já tinha
    const vel = Math.hypot(o.vx, o.vy) || VEL_BASE;
    o.vx = dx * vel;
    o.vy = dy * vel;
    garantirMovimento(o);
  }
}
