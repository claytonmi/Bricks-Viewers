// ===== Itens que caem e poderes dos viewers =====
// Tijolos marcados soltam um item; a raquete pode pegar. !bomb empurra as bolas perto.
// !gravity puxa as bolas perto por 2 s e depois lança todas para fora.
// !shock eletriza a bola por 1,5 s: quem passar perto fica atordoado (1% da velocidade) por 2 s.
// Bola com poder ativo não é afetada pelos poderes dos outros (usandoPoder, em regras.js).

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
    if (b.estado !== 'jogando' || b.presoEm) continue;
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

// !bomb: empurra as bolas que estão até BOMBA_RAIO da bola que deu o comando
// (não afeta paredes, tijolos nem a raquete; a bola de quem deu o comando não se move)
function explodirBomba(b, agora) {
  explosoes.push({ x: b.x, y: b.y, inicio: agora });
  b.brilhoBombaAte = agora + 700; // a bola de quem explodiu brilha em vermelho
  for (const o of viewers) {
    // presa no !gravity: o campo segura; com poder ativo: não é afetada
    if (o === b || o.estado !== 'jogando' || o.presoEm || usandoPoder(o, agora)) continue;
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

// !gravity: a bola de quem deu o comando para e vira o centro do campo
function criarCampoGravidade(b, agora) {
  const c = { dono: b, x: b.x, y: b.y, inicio: agora, fim: agora + GRAV_TEMPO, presas: [] };
  b.presoEm = c;
  camposGrav.push(c);
  capturarBolas(c, agora);
}

// Prende as bolas livres que estão dentro do raio do campo (menos as que estão usando poder)
function capturarBolas(c, agora) {
  for (const o of viewers) {
    if (o.presoEm || o.estado !== 'jogando' || usandoPoder(o, agora)) continue;
    const dx = o.x - c.x;
    const dy = o.y - c.y;
    const d = Math.hypot(dx, dy);
    if (d > GRAV_RAIO) continue;
    o.presoEm = c;
    c.presas.push({ b: o, ang: Math.atan2(dy, dx), dist: Math.max(d, GRAV_PERTO) });
  }
}

// A cada quadro: puxa as bolas presas girando em volta do centro; no fim, explode
function atualizarCamposGravidade(dt, agora) {
  for (const c of camposGrav) {
    capturarBolas(c, agora); // bola que entra no raio durante os 2 s também é puxada
    c.dono.x = c.x;
    c.dono.y = c.y;
    for (const p of c.presas) {
      p.dist = Math.max(GRAV_PERTO, p.dist - GRAV_PUXAO * dt);
      p.ang += GRAV_GIRO * dt;
      const x = c.x + Math.cos(p.ang) * p.dist;
      const y = c.y + Math.sin(p.ang) * p.dist;
      // fora da tela ou dentro de tijolo/parede: a bola espera onde está até o caminho liberar
      if (!posicaoBloqueada(x, y)) { p.b.x = x; p.b.y = y; }
    }
    if (agora >= c.fim) explodirCampo(c, agora);
  }
  camposGrav = camposGrav.filter(c => agora < c.fim);
}

// Explosão gravitacional: lança as bolas presas para fora, cada uma numa direção
function explodirCampo(c, agora) {
  explosoes.push({ x: c.x, y: c.y, inicio: agora, cor: '#3b82f6', raio: GRAV_RAIO, tempo: GRAV_ANEL });
  c.dono.presoEm = null; // a bola do dono segue com a velocidade que tinha
  const n = c.presas.length;
  const giro = Math.random() * Math.PI * 2;
  c.presas.forEach((p, i) => {
    // direções espalhadas em volta do centro (com um pouco de sorteio)
    const ang = giro + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    p.b.presoEm = null; // sai de onde está (já fora de tijolos e paredes)
    p.b.vx = Math.cos(ang) * VEL_BASE;
    p.b.vy = Math.sin(ang) * VEL_BASE;
    garantirMovimento(p.b);
  });
}

// !shock: a bola eletrizada atordoa as bolas que chegam a até CHOQUE_RAIO dela
function atualizarChoques(agora) {
  for (const b of viewers) {
    if (agora >= b.choqueAte || b.estado !== 'jogando') continue;
    for (const o of viewers) {
      if (o === b || o.estado !== 'jogando' || o.presoEm) continue;
      if (agora < o.imuneChoqueAte || usandoPoder(o, agora)) continue;
      if (Math.hypot(o.x - b.x, o.y - b.y) > CHOQUE_RAIO) continue;
      o.atordoadaAte = agora + ATORDOADA_TEMPO;
      o.imuneChoqueAte = o.atordoadaAte + IMUNE_CHOQUE; // 3 s de imunidade depois que passa
      raiosChoque.push({ de: b, para: o, ate: agora + 250 }); // raio ligando as duas bolas
    }
  }
  raiosChoque = raiosChoque.filter(r => agora < r.ate);
}
