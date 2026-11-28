// ===== Física da bola =====
// Movimento, rebotes na raquete, nos tijolos e nas paredes.

// Altura da linha de bolas no lobby e no respawn
// (modo intervalo: as linhas sobem a partir do chão-parede, nunca abaixo dele)
function alturaLinha(linha) {
  if (modoIntervalo) return PISO_Y - RAIO - 6 - linha * 22;
  return H - 230 + linha * 22;
}

// Parte de baixo da área de jogo: no modo intervalo é o chão-parede (a bola quica nele)
function fundoDoCampo() {
  return modoIntervalo ? PISO_Y : H;
}

// Posição da bola número k: centro primeiro, depois direita/esquerda alternando
function posicaoSlot(k) {
  const linha = Math.floor(k / BOLAS_POR_LINHA);
  const idx = k % BOLAS_POR_LINHA;
  let deslocamento = 0;
  if (idx > 0) {
    const passos = Math.ceil(idx / 2);
    deslocamento = (idx % 2 === 1 ? 1 : -1) * passos * ESPACO_BOLA;
  }
  return { x: W / 2 + deslocamento, y: alturaLinha(linha) };
}

// Velocidade horizontal mínima: a bola nunca fica quase vertical (~14 graus), senão quica presa na mesma coluna
const VX_MINIMO = VEL_BASE * 0.25;

// Se a bola está quase vertical, empurra a componente horizontal até o mínimo (mantém a velocidade e os sinais)
function garantirAngulo(b) {
  if (Math.abs(b.vx) >= VX_MINIMO) return;
  const velocidade = Math.hypot(b.vx, b.vy) || VEL_BASE;
  const sx = b.vx < 0 ? -1 : b.vx > 0 ? 1 : (Math.random() < 0.5 ? -1 : 1);
  const sy = b.vy < 0 ? -1 : 1;
  b.vx = sx * VX_MINIMO;
  b.vy = sy * Math.sqrt(Math.max(0, velocidade * velocidade - VX_MINIMO * VX_MINIMO));
}

// Lança a bola para cima com um ângulo aleatório
function lancar(b) {
  const vx = (Math.random() * 2 - 1) * VEL_BASE * 0.4;
  b.vx = vx;
  b.vy = -Math.sqrt(VEL_BASE * VEL_BASE - vx * vx);
  garantirAngulo(b);
}

// Rebote na raquete: o ângulo depende de onde a bola bateu
function rebaterNaRaquete(b) {
  const off = Math.max(-1, Math.min(1, (b.x - paddleX) / (PADDLE_W / 2)));
  const ang = off * 1.0; // no máximo ~57 graus
  b.vx = Math.sin(ang) * VEL_BASE;
  b.vy = -Math.cos(ang) * VEL_BASE;
  b.y = PADDLE_Y - RAIO;
  // streamer: a cada rebatidasPorPonto rebatidas na raquete, +1 ponto (só com "Streamer pontua" marcado).
  // Com mais viewers há mais bolas para rebater, então precisa de mais rebatidas (ver calcularRebatidasPorPonto).
  if (streamerPontua && ++rebatidasStreamer >= rebatidasPorPonto) {
    rebatidasStreamer = 0;
    streamerPts++;
    streamerPtsEm = agoraJogo();
    paddleBrilhoAte = agoraJogo() + 600; // raquete brilha quando o streamer ganha ponto
  }
}

// Rebatidas para o streamer ganhar 1 ponto, conforme os jogadores (fixado quando a partida começa).
// Segue REBATIDAS_PONTO_TABELA: abaixo do primeiro par vale o primeiro, acima do último vale o último,
// e entre dois pares sobe em linha reta.
function calcularRebatidasPorPonto(jogadores) {
  const t = REBATIDAS_PONTO_TABELA;
  if (jogadores <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    const [j0, r0] = t[i - 1];
    const [j1, r1] = t[i];
    if (jogadores <= j1) return Math.round(r0 + (r1 - r0) * (jogadores - j0) / (j1 - j0));
  }
  return t[t.length - 1][1];
}

// Batidas para ganhar um poder: quanto mais jogadores, menos batidas (cada bola acerta menos tijolos).
// A bola do streamer (só existe no modo intervalo) não conta como jogador.
function batidasPara(base) {
  const jogadores = viewers.length - (modoIntervalo ? 1 : 0);
  const f = Math.max(0, Math.min(1, (jogadores - BATIDAS_CHEIAS_ATE) / (BATIDAS_MENOS_COM - BATIDAS_CHEIAS_ATE)));
  return Math.round(base * (1 - f * (1 - BATIDAS_FATOR)));
}

// Na esteira, o tijolo que passa da borda direita aparece pela esquerda: para uma bola no lado
// esquerdo da tela, a parte que já voltou fica em x - W
function xDoTijolo(t, bx) {
  if (t.circ) return t.x; // meteoro não dá a volta na tela
  return t.x + t.w > W && bx < W / 2 ? t.x - W : t.x;
}

// Bola x tijolos: rebate em todos que está encostando e quebra um tijolo por frame (dá ponto ao viewer)
function baterNosTijolos(b) {
  for (const t of tijolos) { // meteoros e dragão (círculos)
    if (!t.vivo || !t.circ) continue;
    if (t.dragao && b.fantasma) continue;
    if (baterNoMeteoro(b, t)) return;
  }
  const contatos = [];
  for (const t of tijolos) {
    if (!t.vivo || t.circ) continue;
    const c = contatoRetangulo(b, xDoTijolo(t, b.x), t.y, t.w, t.h);
    if (c) { c.t = t; contatos.push(c); }
  }
  if (contatos.length === 0) return;
  // encostando numa face e numa quina ao mesmo tempo (vão entre dois tijolos vizinhos): vale a face, a bola
  // rebate reto como numa parede só. Quinas só contam quando a bola encosta apenas nelas.
  const faces = contatos.filter(c => !c.quina);
  const usados = faces.length ? faces : contatos;
  rebaterNosContatos(b, usados, (x, y, c) => contatoRetangulo(b, xDoTijolo(c.t, b.x), c.t.y, c.t.w, c.t.h));
  garantirMovimento(b); // quina na diagonal pode deixar a bola quase na horizontal
  // dano: um tijolo por frame, o que a bola mais entrou
  registrarBatida(b, usados.reduce((a, c) => (c.entrou > a.entrou ? c : a)).t);
}

// Contato da bola com um retângulo: normal (para fora, na direção da bola), quanto a bola entrou e se foi na quina.
// Na face a normal é reta; na quina ela sai da ponta do retângulo para a bola (rebate como numa esquina, não desliza).
// Se o centro da bola entrou no retângulo (bola rápida), ela sai pelo lado mais perto.
function contatoRetangulo(b, x, y, w, h) {
  const cx = Math.max(x, Math.min(b.x, x + w));
  const cy = Math.max(y, Math.min(b.y, y + h));
  const dx = b.x - cx;
  const dy = b.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= RAIO * RAIO) return null;
  if (d2 > 0) {
    const d = Math.sqrt(d2);
    return { nx: dx / d, ny: dy / d, entrou: RAIO - d, quina: dx !== 0 && dy !== 0, px: cx, py: cy };
  }
  const lados = [
    { nx: -1, ny: 0, e: b.x - x }, { nx: 1, ny: 0, e: x + w - b.x },
    { nx: 0, ny: -1, e: b.y - y }, { nx: 0, ny: 1, e: y + h - b.y }
  ];
  const l = lados.reduce((a, c) => (c.e < a.e ? c : a));
  return { nx: l.nx, ny: l.ny, entrou: RAIO + l.e, quina: false, px: b.x + l.nx * l.e, py: b.y + l.ny * l.e };
}

// Tira a bola de dentro de cada contato e rebate pela normal somada deles. Só rebate se a bola está indo contra
// a superfície: se outra batida no mesmo quadro (teto, outro tijolo) já virou a bola, ela não é jogada de volta.
function rebaterNosContatos(b, contatos, recalcular) {
  let nx = 0, ny = 0;
  for (const c of contatos) { nx += c.nx * c.entrou; ny += c.ny * c.entrou; }
  const n = Math.hypot(nx, ny);
  if (n) { nx /= n; ny /= n; } else { nx = contatos[0].nx; ny = contatos[0].ny; }
  for (const c of contatos) {
    const atual = recalcular(b.x, b.y, c); // a anterior pode já ter tirado a bola deste
    if (atual) { b.x = atual.px + atual.nx * RAIO; b.y = atual.py + atual.ny * RAIO; }
  }
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
}

// Bola x meteoro (círculo): rebate pela normal, como numa parede redonda
function baterNoMeteoro(b, t) {
  const dx = b.x - t.cx;
  const dy = b.y - t.cy;
  const d = Math.hypot(dx, dy);
  const R = RAIO + t.r;
  if (d >= R) return false;
  const nx = d ? dx / d : 0;
  const ny = d ? dy / d : -1;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
  b.x = t.cx + nx * R;
  b.y = t.cy + ny * R;
  registrarBatida(b, t);
  return true;
}

// Uma batida num tijolo ou meteoro: conta para os poderes e, se quebrou, dá o ponto
function registrarBatida(b, t) {
  ultimoToqueTijolo = agoraJogo(); // qualquer encosto em tijolo zera o contador do fim de fase travado
  b.mirarNaBatida = false; // fim de fase travado: já encostou num tijolo, não precisa mais mirar
  // cópia do multibola não carrega poderes (só os pontos vão para o dono); a bola do streamer também não
  if (!b.dono && !b.streamer) {
    b.carga++;
    // a cada 10 encostos, 1 bomba (no máximo 2 guardadas; cheio, não conta)
    if (b.bombas < BOMBA_MAX && ++b.batidas >= batidasPara(BOMBA_CADA)) {
      b.bombas++;
      b.batidas = 0;
    }
    // a cada 12 encostos, o !gravity (só 1; com ele pronto, não conta)
    if (!b.gravidade && ++b.batidasGrav >= batidasPara(GRAV_CADA)) {
      b.gravidade = true;
      b.batidasGrav = 0;
    }
    // a cada 13 encostos, o !shock (só 1; com ele pronto, não conta)
    if (!b.choque && ++b.batidasChoque >= batidasPara(CHOQUE_CADA)) {
      b.choque = true;
      b.batidasChoque = 0;
    }
    marcarPoderPronto(b, agoraJogo()); // modo intervalo: regra do ausente
  }
  if (t.dragao) { danoNoDragao(b, agoraJogo()); return; } // Ano Novo: o dragão inteiro perde vida; o corpo não quebra
  t.vida--;
  if (t.vida <= 0) {
    if (t.tipo) { romperTijoloAnoNovo(t, b.dono || b, agoraJogo()); return; } // Ano Novo: tijolo especial
    if (t.circ) { quebrarMeteoro(t, b); return; } // fase 6: ver espaco.js
    t.vivo = false;
    tijolosVivos--;
    // 1 ponto só quando o tijolo quebra (chefão: 5 para quem deu a última batida)
    darPontos(b.dono || b, t.chefao ? CHEFAO_PONTOS : 1);
    if (t.chefao) quebrarRestantes(b.dono || b); // chefão quebrado: os tijolos que sobravam também quebram
    if (t.item) soltarItem(t);
  }
}

// Bola x retângulo (parede): empurra a bola para fora e rebate para longe dele (quina como quina; ver contatoRetangulo)
function batidaRetangulo(b, r) {
  const c = contatoRetangulo(b, r.x, r.y, r.w, r.h);
  if (!c) return false;
  rebaterNosContatos(b, [c], () => contatoRetangulo(b, r.x, r.y, r.w, r.h));
  return true;
}

// Bola x segmento inclinado (parede em linha). Rebate pela normal da linha.
function batidaSegmento(b, s) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy;
  let t = ((b.x - s.x1) * dx + (b.y - s.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = s.x1 + t * dx;
  const cy = s.y1 + t * dy;
  let nx = b.x - cx;
  let ny = b.y - cy;
  const d = Math.hypot(nx, ny);
  const R = RAIO + s.espessura / 2;
  if (d >= R) return false;
  if (d === 0) {
    nx = -dy; ny = dx;
    const l = Math.hypot(nx, ny);
    nx /= l; ny /= l;
  } else {
    nx /= d; ny /= d;
  }
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    b.vx -= 2 * vn * nx;
    b.vy -= 2 * vn * ny;
  }
  b.x = cx + nx * R;
  b.y = cy + ny * R;
  return true;
}

// A bola na posição (x, y) ficaria fora da tela ou dentro de um tijolo ou parede?
function posicaoBloqueada(x, y) {
  if (x < RAIO || x > W - RAIO || y < RAIO || y > fundoDoCampo() - RAIO) return true;
  const dentroRet = r => {
    const dx = x - Math.max(r.x, Math.min(x, r.x + r.w));
    const dy = y - Math.max(r.y, Math.min(y, r.y + r.h));
    return dx * dx + dy * dy < RAIO * RAIO;
  };
  if (tijolos.some(t => t.vivo && (t.circ ? Math.hypot(x - t.cx, y - t.cy) < RAIO + t.r
    : dentroRet({ x: xDoTijolo(t, x), y: t.y, w: t.w, h: t.h })))) return true;
  return paredesAtuais.some(p => {
    if (p.x1 === undefined) return dentroRet(p);
    const dx = p.x2 - p.x1;
    const dy = p.y2 - p.y1;
    const t = Math.max(0, Math.min(1, ((x - p.x1) * dx + (y - p.y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - (p.x1 + t * dx), y - (p.y1 + t * dy)) < RAIO + p.espessura / 2;
  });
}

// Escolhe o tipo de colisão da parede (retângulo ou segmento)
function colidirParede(b, p) {
  return p.x1 !== undefined ? batidaSegmento(b, p) : batidaRetangulo(b, p);
}

// Evita a bola ficar quicando só na horizontal presa entre paredes
function garantirMovimento(b) {
  const minVy = VEL_BASE * 0.3;
  if (Math.abs(b.vy) < minVy) {
    const sy = b.vy < 0 ? -1 : 1;
    b.vy = sy * minVy;
    const sx = b.vx < 0 ? -1 : 1;
    b.vx = sx * Math.sqrt(VEL_BASE * VEL_BASE - minVy * minVy);
  }
}

// Move uma bola por um quadro e trata tudo que acontece com ela
function atualizarBola(b, dt, agora) {
  if (b.buraco) { avancarEspiral(b, dt); return; } // na espiral do buraco: não bate em nada e não pontua
  if (b.estado === 'caiu') {
    if (agora >= b.esperaAte) {
      b.x = W / 2;
      b.y = alturaLinha(0);
      b.estado = 'jogando';
      b.atordoadaAte = 0; // volta da queda já sem o atordoamento
      b.efeitoAte = 0;    // e sem a espera para usar poder
      b.impulsoAte = 0;
      lancar(b);
    }
    return;
  }

  // !speed (ou o item velocidade) dobra a velocidade, sem somar os dois; empurrada por !bomb fica mais rápida;
  // atordoada pelo !shock anda a 1%
  const mult = (agora < b.velExtraAte || agora < velTodasAte ? MULT_SPEED : 1) * (agora < b.impulsoAte ? BOMBA_IMPULSO : 1) *
    (agora < b.atordoadaAte ? ATORDOADA_VEL : 1);
  b.x += b.vx * mult * dt;
  b.y += b.vy * mult * dt;
  const vxAntes = b.vx, vyAntes = b.vy; // para saber se bateu em algo neste quadro (fim de fase travado)

  // paredes e teto
  if (b.x < RAIO) { b.x = RAIO; b.vx = Math.abs(b.vx); }
  if (b.x > W - RAIO) { b.x = W - RAIO; b.vx = -Math.abs(b.vx); }
  if (b.y < RAIO) { b.y = RAIO; b.vy = Math.abs(b.vy); }
  // modo intervalo: o chão é parede, a bola quica e nunca cai
  if (modoIntervalo && b.y > PISO_Y - RAIO) { b.y = PISO_Y - RAIO; b.vy = -Math.abs(b.vy); }

  // fase 6: bola perto da entrada de um buraco aberto começa a espiral
  if (capturarNoBuraco(b)) return;

  // raquete (só quando a bola desce; no modo intervalo não tem raquete)
  if (!modoIntervalo && b.vy > 0 &&
      b.y + RAIO >= PADDLE_Y &&
      b.y - RAIO <= PADDLE_Y + PADDLE_H &&
      Math.abs(b.x - paddleX) <= PADDLE_W / 2 + RAIO) {
    rebaterNaRaquete(b);
  }

  // paredes da fase (não contam para o !speed)
  for (const p of paredesAtuais) {
    if (colidirParede(b, p)) garantirMovimento(b);
  }

  // fim de fase travado: a bola escolhida acabou de bater (raquete, borda, teto, parede) e sai mirando o tijolo mais perto
  if (b.mirarNaBatida && (Math.sign(b.vx) !== Math.sign(vxAntes) || Math.sign(b.vy) !== Math.sign(vyAntes))) mirarNoTijolo(b);

  baterNosTijolos(b);

  // depois de qualquer batida (chão, teto, raquete, tijolo, parede), a bola não fica quase vertical
  garantirAngulo(b);

  // caiu
  if (b.y - RAIO > H) {
    b.estado = 'caiu';
    b.esperaAte = agora + ESPERA_QUEDA;
  }
}
