// ===== Fase de Natal =====
// Fase de evento (só liberada em dezembro). Os tijolos são presentes, a neve cai na tela,
// no fim desce o chefão saco do Papai Noel e, de vez em quando, uma rena passa voando lá em cima.
// - Saco: quando sobram 4 tijolos ou menos, desce e fica balançando de um lado para o outro (mais rápido
//   conforme perde vida). Quem dá a última batida ganha os pontos do chefão; ao estourar, solta
//   presentinhos que valem 1 ponto para a bola que pegar.
// - Rena puxando o trenó: passa a cada 20 a 35 s; a bola que acertar (rena ou trenó) ganha 10 pontos e ela foge.

let presentinhos = [];   // presentes que saíram do saco (as bolas pegam)
let rena = null;         // rena voando agora (null = nenhuma)
let proximaRena = 0;     // quando a próxima rena aparece (0 = ainda não sorteado)
let textosFlutuantes = []; // "+1", "+10" subindo de onde a bola pegou

function faseNatal() {
  return !!FASES[faseIndex].natal;
}

// A fase ainda não pode acabar: o saco quebrou mas não estourou, ou ainda tem presentinho no ar
function natalPendente() {
  return presentinhos.length > 0 || tijolos.some(t => t.saco && !t.vivo && !t.estourou);
}

// Fase nova: limpa tudo do Natal
function resetarNatal() {
  presentinhos = [];
  rena = null;
  proximaRena = 0;
  textosFlutuantes = [];
}

// Roda a cada quadro durante a partida
function atualizarNatal(dt, agora) {
  if (!faseNatal()) return;
  atualizarSaco(dt, agora);
  atualizarPresentinhos(dt, agora);
  atualizarRena(dt, agora);
  textosFlutuantes = textosFlutuantes.filter(t => agora < t.ate);
}

// ----- Chefão: saco do Papai Noel -----
function atualizarSaco(dt, agora) {
  const saco = tijolos.find(t => t.saco);
  if (!saco) {
    if (!chefaoCaiu && tijolosVivos <= CHEFAO_QUANDO) {
      tijolos.push({
        x: W / 2 - SACO_W / 2, y: -SACO_H, w: SACO_W, h: SACO_H,
        vida: CHEFAO_VIDA, vidaMax: CHEFAO_VIDA, vivo: true, item: false, cor: '#b91c1c',
        chefao: true, saco: true, balanco: 0
      });
      chefaoCaiu = true;
      tijolosVivos++;
      anunciar('Saco do Papai Noel!', agora);
    }
    return;
  }
  if (!saco.vivo) {
    if (!saco.estourou) estourarSaco(saco, agora);
    return;
  }
  if (saco.y < SACO_Y) {
    // descendo do teto: espera se tiver bola embaixo
    const novoY = Math.min(saco.y + CHUVA_VEL * dt, SACO_Y);
    if (!bolaEmbaixo(saco, novoY)) saco.y = novoY;
    return;
  }
  // balança de um lado para o outro, mais rápido conforme perde vida (até 3x)
  const ritmo = 0.6 * (1 + 2 * (1 - saco.vida / saco.vidaMax));
  saco.balanco += ritmo * dt;
  const antes = saco.x;
  saco.x = W / 2 - SACO_W / 2 + Math.sin(saco.balanco) * SACO_BALANCO;
  if (saco.x !== antes) empurrarBolas(saco, Math.sign(saco.x - antes));
}

// O saco estourou: os presentinhos pulam para os lados
function estourarSaco(saco, agora) {
  saco.estourou = true;
  explosoes.push({ x: saco.x + saco.w / 2, y: saco.y + saco.h / 2, inicio: agora, cor: '#facc15', raio: 70, tempo: 500 });
  const cores = FASES[faseIndex].cores;
  for (let i = 0; i < PRESENTINHOS; i++) {
    const ang = -Math.PI / 2 + (i / (PRESENTINHOS - 1) - 0.5) * 2.6; // leque para cima
    const vel = 140 + Math.random() * 90;
    presentinhos.push({
      x: saco.x + saco.w / 2, y: saco.y + saco.h / 2,
      vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
      cor: cores[i % cores.length],
      pegavelEm: agora + 350 // espalham um pouco antes de poder pegar (uma bola só não pega todos)
    });
  }
}

// Presentinhos caem devagar; a bola que encostar ganha o ponto. Somem ao chegar no chão.
function atualizarPresentinhos(dt, agora) {
  const bolas = viewers.concat(copias).filter(b => b.estado === 'jogando');
  presentinhos = presentinhos.filter(p => {
    p.vy += 140 * dt; // gravidade fraca: dá tempo de as bolas pegarem
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < PRESENTINHO_TAM / 2) { p.x = PRESENTINHO_TAM / 2; p.vx = Math.abs(p.vx); }
    if (p.x > W - PRESENTINHO_TAM / 2) { p.x = W - PRESENTINHO_TAM / 2; p.vx = -Math.abs(p.vx); }
    const b = agora >= p.pegavelEm && bolas.find(o => Math.hypot(o.x - p.x, o.y - p.y) < RAIO + PRESENTINHO_TAM / 2 + 2);
    if (b) {
      const dono = b.dono || b;
      darPontos(dono, PRESENTINHO_PONTOS);
      textosFlutuantes.push({ x: p.x, y: p.y, texto: `+${PRESENTINHO_PONTOS}`, inicio: agora, ate: agora + 900 });
      return false;
    }
    return p.y - PRESENTINHO_TAM / 2 < fundoDoCampo(); // chegou no chão: some
  });
}

// ----- Rena voando -----
function atualizarRena(dt, agora) {
  if (!rena) {
    if (proximaRena === 0) proximaRena = agora + sortearEsperaRena();
    if (agora < proximaRena) return;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y = 10 + Math.random() * (TIJOLO_TOPO - RENA_H - 22); // sempre acima da primeira linha de tijolos
    rena = { x: dir > 0 ? -RENA_W : W, y, dir, fugindo: false, inicio: agora };
    return;
  }
  rena.x += rena.dir * RENA_VEL * (rena.fugindo ? 2 : 1) * dt;
  if (rena.fugindo) rena.y -= 260 * dt; // acertada: foge para cima
  rena.y += Math.sin((agora - rena.inicio) / 220) * 12 * dt; // sobe e desce de leve
  if (rena.x < -RENA_W - 10 || rena.x > W + 10 || rena.y < -RENA_H - 10) {
    rena = null;
    proximaRena = agora + sortearEsperaRena();
    return;
  }
  if (rena.fugindo) return;
  for (const b of viewers.concat(copias)) {
    if (b.estado !== 'jogando') continue;
    const cx = Math.max(rena.x, Math.min(b.x, rena.x + RENA_W));
    const cy = Math.max(rena.y, Math.min(b.y, rena.y + RENA_H));
    if ((b.x - cx) ** 2 + (b.y - cy) ** 2 >= RAIO * RAIO) continue;
    const dono = b.dono || b;
    darPontos(dono, RENA_PONTOS);
    anunciar(`${dono.nome} acertou a rena! +${RENA_PONTOS}`, agora);
    textosFlutuantes.push({ x: rena.x + RENA_W / 2, y: rena.y, texto: `+${RENA_PONTOS}`, inicio: agora, ate: agora + 1200 });
    b.vy = Math.abs(b.vy) || VEL_BASE * 0.5; // a bola volta para baixo
    rena.fugindo = true;
    break;
  }
}

function sortearEsperaRena() {
  return RENA_CADA_MIN + Math.random() * (RENA_CADA_MAX - RENA_CADA_MIN);
}

// ===== Desenho do Natal =====

// Rena em pixel art (olhando para a direita). b = marrom, d = marrom escuro, c = chifre, k = olho,
// r = nariz vermelho, w = rabo/barriga clara, g = coleira dourada
const RENA_PIXELS = [
  '.........c..c.',
  '........cc.cc.',
  '.........ccc..',
  '.........bbbb.',
  '.........bkbbr',
  '.........bbbb.',
  '........gbb...',
  'w.bbbbbbgb....',
  'wbbbbbbbbb....',
  '.bbwwwwwbb....',
  '.bb.....b.b...',
  'bb.......b.b..',
  'd.........d.d.'
];
// Trenó atrás da rena (frente para a direita): v = vermelho, y = dourado, d = madeira escura,
// e = presente verde, a = presente azul
const TRENO_PIXELS = [
  '..eee.aaa.....',
  '..eee.aaa.....',
  'vvvvvvvvvv..vv',
  'vyyyyyyyyvv.vv',
  'vvvvvvvvvvvvv.',
  '.vvvvvvvvvvv..',
  '..d......d...y',
  'yyyyyyyyyyyyyy'
];
const RENA_ESC = 4;
const TRENO_W = TRENO_PIXELS[0].length * RENA_ESC;
const TRENO_GAP = 20;            // espaço entre o trenó e a rena (onde passam as rédeas)
const RENA_X0 = TRENO_W + TRENO_GAP; // onde a rena começa dentro do desenho
const RENA_W = RENA_X0 + RENA_PIXELS[0].length * RENA_ESC; // rena + trenó (a bola acerta qualquer parte)
const RENA_H = RENA_PIXELS.length * RENA_ESC;
const TRENO_Y0 = RENA_H - TRENO_PIXELS.length * RENA_ESC - 4;
const RENA_CORES = { b: '#8b5a2b', d: '#5a3a1e', c: '#e7d3a8', k: '#111', r: '#ef4444', w: '#e9dcc4', g: '#facc15',
                     v: '#c81e1e', y: '#facc15', e: '#16a34a', a: '#3b82f6' };
let spriteRena = null;

// Desenha a rena puxando o trenó num canvas (olhando para a direita)
function criarSpriteRena() {
  const c = document.createElement('canvas');
  c.width = RENA_W;
  c.height = RENA_H;
  const cx = c.getContext('2d');
  const pintar = (pixels, x0, y0) => pixels.forEach((linha, y) => [...linha].forEach((ch, x) => {
    if (!RENA_CORES[ch]) return;
    cx.fillStyle = RENA_CORES[ch];
    cx.fillRect(x0 + x * RENA_ESC, y0 + y * RENA_ESC, RENA_ESC, RENA_ESC);
  }));
  // rédeas: da frente do trenó até a coleira da rena
  cx.strokeStyle = '#7c2d12';
  cx.lineWidth = 2;
  cx.beginPath();
  cx.moveTo(TRENO_W - RENA_ESC * 2, TRENO_Y0 + RENA_ESC * 2.5);
  cx.quadraticCurveTo(RENA_X0 + 12, TRENO_Y0 + RENA_ESC * 3, RENA_X0 + 8 * RENA_ESC + 2, 6 * RENA_ESC + 2);
  cx.stroke();
  pintar(TRENO_PIXELS, 0, TRENO_Y0);
  pintar(RENA_PIXELS, RENA_X0, 0);
  return c;
}

function desenharRena(agora) {
  if (!rena) return;
  if (!spriteRena) spriteRena = criarSpriteRena();
  ctx.save();
  ctx.shadowColor = '#fde68a';
  ctx.shadowBlur = 10;
  if (rena.dir > 0) {
    ctx.drawImage(spriteRena, rena.x, rena.y);
  } else {
    ctx.translate(rena.x + RENA_W, rena.y);
    ctx.scale(-1, 1);
    ctx.drawImage(spriteRena, 0, 0);
  }
  ctx.restore();
}

// Fita e laço por cima do tijolo (vira um presente)
function desenharFitaPresente(t, x) {
  const fita = t.cor === '#facc15' ? '#dc2626' : '#fde68a';
  ctx.fillStyle = fita;
  ctx.fillRect(x + t.w / 2 - 3, t.y, 6, t.h);
  ctx.fillRect(x, t.y + t.h / 2 - 2, t.w, 4);
  // laço em cima
  ctx.beginPath();
  ctx.moveTo(x + t.w / 2, t.y + 2);
  ctx.lineTo(x + t.w / 2 - 10, t.y - 5);
  ctx.lineTo(x + t.w / 2 - 9, t.y + 4);
  ctx.closePath();
  ctx.moveTo(x + t.w / 2, t.y + 2);
  ctx.lineTo(x + t.w / 2 + 10, t.y - 5);
  ctx.lineTo(x + t.w / 2 + 9, t.y + 4);
  ctx.closePath();
  ctx.fill();
}

// Saco do Papai Noel: vermelho, amarrado com corda dourada, com a vida no meio
function desenharSaco(t, agora) {
  const x = t.x, y = t.y, w = t.w, h = t.h;
  const dano = 1 - t.vida / t.vidaMax;
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 12 + Math.sin(agora / 150) * 5;
  // corpo do saco (mais largo embaixo)
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.3, y + h * 0.22);
  ctx.quadraticCurveTo(x - 6, y + h * 0.55, x + w * 0.08, y + h);
  ctx.lineTo(x + w * 0.92, y + h);
  ctx.quadraticCurveTo(x + w + 6, y + h * 0.55, x + w * 0.7, y + h * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  // pano de cima (franzido) e o nó
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.36, y + h * 0.22);
  ctx.lineTo(x + w * 0.22, y);
  ctx.lineTo(x + w * 0.5, y + h * 0.1);
  ctx.lineTo(x + w * 0.78, y);
  ctx.lineTo(x + w * 0.64, y + h * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + w * 0.3, y + h * 0.2, w * 0.4, 6);
  // remendos conforme apanha
  ctx.fillStyle = '#7f1d1d';
  if (dano > 0.33) ctx.fillRect(x + w * 0.18, y + h * 0.62, 14, 10);
  if (dano > 0.66) ctx.fillRect(x + w * 0.66, y + h * 0.45, 12, 12);
  // presentes aparecendo pela boca do saco
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(x + w * 0.38, y + h * 0.08, 10, 8);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(x + w * 0.52, y + h * 0.04, 9, 10);
  ctx.restore();
  // vida
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';
  ctx.strokeText(t.vida, x + w / 2, y + h * 0.68);
  ctx.fillStyle = '#fff';
  ctx.fillText(t.vida, x + w / 2, y + h * 0.68);
  ctx.textAlign = 'left';
}

// Raquete da fase de Natal: bengala doce listrada. A parte reta tem o tamanho da raquete normal e fica
// no mesmo lugar (é ela que rebate a bola); a voltinha desce na ponta esquerda, para não ficar no caminho das bolas.
const BENGALA_GROSSURA = 14;
const BENGALA_RAIO = 12;         // raio da curva da voltinha (cabe no espaço embaixo da raquete)
const BENGALA_MARGEM = 4;        // sobra em volta do desenho, para o contorno
let spriteBengala = null;

function criarSpriteBengala() {
  const g = BENGALA_GROSSURA, r = BENGALA_RAIO, m = BENGALA_MARGEM;
  const c = document.createElement('canvas');
  c.width = PADDLE_W + m * 2;
  c.height = r * 2 + g + m * 2;
  const cx = c.getContext('2d');
  const yReta = m + g / 2;
  const xCurva = m + r + g / 2;
  const caminho = () => {
    cx.beginPath();
    cx.moveTo(m + PADDLE_W - g / 2, yReta);          // ponta direita da parte reta
    cx.lineTo(xCurva, yReta);
    cx.arc(xCurva, yReta + r, r, -Math.PI / 2, Math.PI / 2, true); // a voltinha, descendo pela esquerda
    cx.lineTo(xCurva + 12, yReta + r * 2);           // pontinha que volta para a direita
  };
  cx.lineJoin = 'round';
  // contorno escuro, para aparecer em cima da neve
  cx.lineCap = 'round';
  cx.strokeStyle = '#7f1d1d';
  cx.lineWidth = g + 3;
  caminho();
  cx.stroke();
  // corpo branco
  cx.strokeStyle = '#fff7ed';
  cx.lineWidth = g;
  caminho();
  cx.stroke();
  // listras vermelhas acompanhando a curva
  cx.lineCap = 'butt';
  cx.strokeStyle = '#dc2626';
  cx.setLineDash([9, 9]);
  caminho();
  cx.stroke();
  cx.setLineDash([]);
  // brilho em cima da parte reta
  cx.lineCap = 'round';
  cx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  cx.lineWidth = 2;
  cx.beginPath();
  cx.moveTo(m + PADDLE_W - g, yReta - g / 4);
  cx.lineTo(xCurva + 4, yReta - g / 4);
  cx.stroke();
  return c;
}

// x e y são os mesmos da raquete normal (canto de cima da parte que rebate)
function desenharBengala(x, y) {
  if (!spriteBengala) spriteBengala = criarSpriteBengala();
  const m = BENGALA_MARGEM;
  ctx.drawImage(spriteBengala, x - m, y + PADDLE_H / 2 - (m + BENGALA_GROSSURA / 2));
}

// Presentinhos caindo e os "+1" subindo
function desenharPresentinhos(agora) {
  for (const p of presentinhos) {
    const s = PRESENTINHO_TAM;
    ctx.fillStyle = p.cor;
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(p.x - 1.5, p.y - s / 2, 3, s);
    ctx.fillRect(p.x - s / 2, p.y - 1.5, s, 3);
  }
  for (const t of textosFlutuantes) {
    const f = (agora - t.inicio) / (t.ate - t.inicio);
    ctx.globalAlpha = Math.max(0, 1 - f);
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.strokeText(t.texto, t.x, t.y - f * 30);
    ctx.fillStyle = '#facc15';
    ctx.fillText(t.texto, t.x, t.y - f * 30);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

// Neve caindo (sem estado: cada floco tem velocidade e balanço fixos, a posição vem do tempo)
const FLOCOS = Array.from({ length: NEVE_FLOCOS }, (_, i) => {
  const r = n => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * W, y: r(2) * H, vel: 25 + r(3) * 45, tam: 1 + r(4) * 2.2, fase: r(5) * 6.28, balanco: 8 + r(6) * 18 };
});

function desenharNeve(agora) {
  const s = agora / 1000;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (const f of FLOCOS) {
    const y = (f.y + f.vel * s) % (H + 10) - 5;
    const x = ((f.x + Math.sin(s * 0.8 + f.fase) * f.balanco) % W + W) % W;
    ctx.beginPath();
    ctx.arc(x, y, f.tam, 0, Math.PI * 2);
    ctx.fill();
  }
}
