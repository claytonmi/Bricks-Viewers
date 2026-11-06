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

// Lança a bola para cima com um ângulo aleatório
function lancar(b) {
  const vx = (Math.random() * 2 - 1) * VEL_BASE * 0.4;
  b.vx = vx;
  b.vy = -Math.sqrt(VEL_BASE * VEL_BASE - vx * vx);
}

// Rebote na raquete: o ângulo depende de onde a bola bateu
function rebaterNaRaquete(b) {
  const off = Math.max(-1, Math.min(1, (b.x - paddleX) / (PADDLE_W / 2)));
  const ang = off * 1.0; // no máximo ~57 graus
  b.vx = Math.sin(ang) * VEL_BASE;
  b.vy = -Math.cos(ang) * VEL_BASE;
  b.y = PADDLE_Y - RAIO;
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

// Bola x tijolos: quebra um tijolo por frame e dá ponto ao viewer
function baterNosTijolos(b) {
  for (const t of tijolos) {
    if (!t.vivo) continue;
    if (t.circ) { if (t.dragao && b.fantasma) continue; if (baterNoMeteoro(b, t)) return; continue; }
    const tx = xDoTijolo(t, b.x);
    const cx = Math.max(tx, Math.min(b.x, tx + t.w));
    const cy = Math.max(t.y, Math.min(b.y, t.y + t.h));
    const dx = b.x - cx;
    const dy = b.y - cy;
    if (dx * dx + dy * dy < RAIO * RAIO) {
      if (Math.abs(dx) > Math.abs(dy)) {
        b.vx = -b.vx;
        b.x = cx + Math.sign(dx || 1) * RAIO;
      } else {
        b.vy = -b.vy;
        b.y = cy + Math.sign(dy || -1) * RAIO;
      }
      registrarBatida(b, t);
      return; // um tijolo por frame
    }
  }
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
    marcarPoderPronto(b, performance.now()); // modo intervalo: regra do ausente
  }
  if (t.dragao) { danoNoDragao(b, performance.now()); return; } // Ano Novo: o dragão inteiro perde vida; o corpo não quebra
  t.vida--;
  if (t.vida <= 0) {
    if (t.tipo) { romperTijoloAnoNovo(t, b.dono || b, performance.now()); return; } // Ano Novo: tijolo especial
    if (t.circ) { quebrarMeteoro(t, b); return; } // fase 6: ver espaco.js
    t.vivo = false;
    tijolosVivos--;
    // 1 ponto só quando o tijolo quebra (chefão: 5 para quem deu a última batida)
    darPontos(b.dono || b, t.chefao ? CHEFAO_PONTOS : 1);
    if (t.item) soltarItem(t);
  }
}

// Bola x retângulo (parede). Empurra a bola para fora e rebate.
function batidaRetangulo(b, r) {
  const cx = Math.max(r.x, Math.min(b.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
  const dx = b.x - cx;
  const dy = b.y - cy;
  if (dx * dx + dy * dy >= RAIO * RAIO) return false;
  if (Math.abs(dx) > Math.abs(dy)) {
    b.vx = -b.vx;
    b.x = cx + Math.sign(dx || 1) * RAIO;
  } else {
    b.vy = -b.vy;
    b.y = cy + Math.sign(dy || -1) * RAIO;
  }
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

  // !speed dobra a velocidade; empurrada por !bomb fica mais rápida; atordoada pelo !shock anda a 1%
  const mult = (agora < b.velExtraAte ? MULT_SPEED : 1) * (agora < b.impulsoAte ? BOMBA_IMPULSO : 1) *
    (agora < b.atordoadaAte ? ATORDOADA_VEL : 1);
  b.x += b.vx * mult * dt;
  b.y += b.vy * mult * dt;

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

  baterNosTijolos(b);

  // caiu
  if (b.y - RAIO > H) {
    b.estado = 'caiu';
    b.esperaAte = agora + ESPERA_QUEDA;
  }
}
