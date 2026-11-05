// ===== Poderes dos viewers =====
// !speed deixa a bola mais rápida. !bomb empurra as bolas perto.
// !gravity puxa as bolas perto por 2 s e depois lança todas para fora.
// !shock eletriza a bola por 1,5 s: quem passar perto fica atordoado (1% da velocidade) por 2 s.
// Bola com poder ativo não é afetada pelos poderes dos outros (usandoPoder).

// O viewer tem algum poder pronto para usar?
function temAlgumPoder(b) {
  return PODERES.some(cmd => temPoder(b, cmd));
}

// Modo intervalo: anota desde quando o viewer tem um poder pronto nesta fase. Se ele perdeu o poder
// (o !speed pede mais batidas quando entra gente e passa de 15 jogadores), a contagem recomeça do zero.
function marcarPoderPronto(b, agora) {
  if (!modoIntervalo) return;
  if (!temAlgumPoder(b)) b.poderDesde = 0;
  else if (!b.poderDesde) b.poderDesde = agora;
}

const PODERES = ['!speed', '!bomb', '!gravity', '!shock'];

// O viewer tem a carga desse poder?
function temPoder(b, cmd) {
  if (cmd === '!speed') return b.carga >= batidasPara(CARGA_SPEED);
  if (cmd === '!bomb') return b.bombas > 0;
  if (cmd === '!gravity') return b.gravidade;
  if (cmd === '!shock') return b.choque;
  return false;
}

// Bola com algum poder ativo (!speed, !bomb, !gravity ou !shock): os poderes dos outros não pegam nela
function usandoPoder(b, agora) {
  return agora < b.poderAte;
}

// A bola sofreu o poder de outra (efeito acaba em fimDoEfeito): só usa poder 1,5 s depois disso.
// Se pedir antes, o pedido espera na fila e sai sozinho quando liberar.
function marcarEfeito(b, fimDoEfeito) {
  b.efeitoAte = Math.max(b.efeitoAte, fimDoEfeito + PODER_APOS_EFEITO);
}

// Pode soltar um poder agora? (bola em jogo, nenhum poder ativo, não presa num campo nem atordoada,
// e já passou a espera depois do efeito do poder de outra bola)
function podeUsarAgora(b, agora) {
  return b.estado === 'jogando' && !usandoPoder(b, agora) && !b.presoEm &&
    agora >= b.atordoadaAte && agora >= b.efeitoAte;
}

// Gasta a carga e solta o poder
function usarPoder(b, cmd, agora) {
  if (cmd === '!speed') {
    b.carga = 0;
    b.velExtraAte = agora + DURACAO_SPEED;
    b.poderAte = b.velExtraAte;
  } else if (cmd === '!bomb') {
    b.bombas--;
    b.poderAte = agora + BOMBA_TEMPO;
    explodirBomba(b, agora);
  } else if (cmd === '!gravity') {
    b.gravidade = false;
    b.poderAte = agora + GRAV_TEMPO;
    criarCampoGravidade(b, agora);
  } else if (cmd === '!shock') {
    b.choque = false;
    b.choqueAte = agora + CHOQUE_TEMPO;
    b.poderAte = b.choqueAte;
  }
  b.usouNaFase = true; // modo intervalo: usou poder, não é ausente nesta fase
  mostrarAviso(b, cmd, agora);
}

// Fila: quando o poder anterior acaba, solta o próximo pedido (se ainda tiver a carga)
function atualizarFilas(agora) {
  for (const b of viewers) {
    if (b.fila.length === 0 || !podeUsarAgora(b, agora)) continue;
    const cmd = b.fila.shift();
    if (temPoder(b, cmd)) usarPoder(b, cmd, agora);
  }
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
    o.impulsoAte = agora + BOMBA_IMPULSO_TEMPO;
    marcarEfeito(o, agora); // o empurrão acaba na hora: a espera de 1,5 s conta daqui
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
    marcarEfeito(p.b, agora);
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
      marcarEfeito(o, o.atordoadaAte);
      raiosChoque.push({ de: b, para: o, ate: agora + 250 }); // raio ligando as duas bolas
    }
  }
  raiosChoque = raiosChoque.filter(r => agora < r.ate);
}
