// ===== Fase do Ano Novo Chinês =====
// Fase de data: só fica liberada perto do Ano Novo Chinês (ver ANO_NOVO_DATAS).
// - Tijolos especiais (letras no padrao): L = lanterna (balança de leve e solta 3 moedas da sorte),
//   E = envelope vermelho (vida 2; ao quebrar, dá pontos extras), F = fogos (ao quebrar, explodem e quebram os vizinhos).
// - Moedas da sorte caem do céu de vez em quando: a bola que pegar ganha 1 ponto.
// - Fogo que sobe do chão: a bola que passar por ele ganha uma bênção (bomba, gravidade, choque ou !speed pronto).
// - Dragão (chefão): quando todos os tijolos quebram, entra uma serpente inteira de 12 partes, com 40 de vida.
//   Ela faz o caminho do desenho e depois a volta espelhada. Cada batida tira 1 de vida, mas o corpo nunca quebra.
//   Ela solta fogo logo à frente, que anda junto com ela: a bola que pegar esse fogo fica atordoada. Uma bola atordoada na frente do dragão
//   vira fantasma: passa por dentro dele e, quando ele passa, volta a andar na direção que tinha antes.
//   Quem der o último golpe ganha 5 pontos. Se ela sair da tela sem morrer, a fase acaba com o que sobrou.
// Todos os desenhos são pixel art: cada sprite é uma grade de letras (uma letra = um quadradinho).

// Dia 1 do Ano Novo Chinês (calendário lunar: muda todo ano; confira as datas antes de cada ano)
const ANO_NOVO_DATAS = ['2027-02-06', '2028-01-26', '2029-02-13', '2030-02-03'];
const ANO_NOVO_ANTES = 3;    // a fase libera 3 dias antes
const ANO_NOVO_DEPOIS = 15;  // e fica liberada até 15 dias depois (a festa das lanternas)

// Letras do padrao da fase que viram tijolos especiais
const TIPOS_ANO_NOVO = {
  L: { tipo: 'lanterna', vida: 1 },
  E: { tipo: 'envelope', vida: 2 },
  F: { tipo: 'fogos', vida: 1 }
};
const ENVELOPE_BONUS = 2;        // pontos extras ao quebrar o envelope
const FOGOS_RAIO = 90;           // raio da explosão dos fogos (px)
const MOEDA_R = 7;               // raio da moeda (px)
const MOEDA_GRAV = 140;          // gravidade das moedas (px/s²)
const MOEDA_CADA = [2500, 4000]; // intervalo (ms) entre as moedas que caem do céu
const FOGO_CADA = [7000, 11000]; // intervalo (ms) entre os fogos que sobem do chão
const FOGO_DURA = 3500;          // ms que cada fogo fica no ar
const FOGO_ALTURA = 240;         // altura máxima do fogo (px)
const FOGO_PEGA = 26;            // a bola pega a bênção se estiver a até esta distância do fogo
const DRAGAO_SEGMENTOS = 12;     // partes do dragão
const DRAGAO_RAIO = 16;          // raio de cada parte (px)
const DRAGAO_ESPACO = 24;        // distância entre as partes, no caminho (px)
const DRAGAO_VEL = 110;          // velocidade da cabeça (px por segundo)
const DRAGAO_VOLTAS = 2;         // o caminho do desenho, e depois a volta espelhada
const DRAGAO_VIDA = 40;          // vida do dragão inteiro (cada batida tira 1)
const DRAGAO_FOGO_CADA = [4000, 6000]; // intervalo (ms) entre os fogos que o dragão solta
const DRAGAO_FOGO_FRENTE = 130; // distância (px no caminho) à frente da cabeça onde o fogo aparece; ele anda junto com o dragão
const DRAGAO_FOGO_DURA = 2500;   // tempo (ms) que o fogo do dragão fica aceso no chão
const DRAGAO_FOGO_RAIO = 34;     // raio do fogo no chão (px)
const DRAGAO_ATORDOA = 2000;     // tempo (ms) que a bola fica atordoada ao pegar o fogo

// Caminho do dragão, desenhado à mão (coordenadas da imagem de desenho, 1030 × 602).
// Começa pela esquerda em cima, vai pela faixa de cima até a direita, faz a curva e volta pela de baixo.
const CAMINHO_DESENHO = [
  [55, 60], [90, 70], [115, 100], [150, 80], [200, 75], [250, 90], [300, 105], [350, 125], [400, 140],
  [440, 125], [480, 100], [520, 72], [560, 80], [620, 110], [680, 145], [720, 165], [760, 150], [800, 115],
  [840, 85], [880, 68], [950, 72], [1000, 95], [1025, 130], [1032, 190], [1020, 230], [1000, 270],
  [975, 320], [960, 338], [920, 340], [880, 300], [820, 278], [770, 300], [720, 345], [680, 320],
  [640, 280], [600, 258], [540, 275], [480, 320], [440, 333], [400, 320], [340, 258], [320, 255],
  [260, 280], [200, 318], [160, 310], [140, 270], [125, 200], [118, 140], [60, 235]
];

// ----- Sprites em pixel art (cada letra é um quadradinho; '.' = transparente) -----
const SPRITE_LANTERNA = [
  '....kk....',
  '...yyyy...',
  '..yddddy..',
  '.yrrrrrry.',
  '.yrrrrrry.',
  '.yrrrrrry.',
  '.yrrrrrry.',
  '.yrrrrrry.',
  '..yddddy..',
  '...yyyy...',
  '....kk....',
  '....yy....'
];
const PAL_LANTERNA = { k: '#fef08a', y: '#facc15', r: '#dc2626', d: '#991b1b' };

const SPRITE_ENVELOPE = [
  'oooooooooooooooo',
  'orrrrrrrrrrrrrro',
  'orrddddddddddrro',
  'orrrddddddddrrro',
  'orrrrddyyddrrrro',
  'orrrrrryyrrrrrro',
  'orrrrrrrrrrrrrro',
  'oooooooooooooooo'
];
const PAL_ENVELOPE = { o: '#facc15', r: '#b91c1c', d: '#dc2626', y: '#fef08a' };

const SPRITE_FAISCA = [
  '..k..',
  '.kyk.',
  'kyyyk',
  '.kyk.',
  '..k..'
];
const PAL_FAISCA = { k: '#fef08a', y: '#facc15' };

// Cabeça vista de cima (16 × 12), virada para a direita: chifres grandes para trás, olhos perto do focinho e bigode amarelo na frente
const SPRITE_CABECA = [
  'hhhhh....oooo.....y',
  'hhhhhhoorrrrro...y.',
  'hhhhhhoorrrrrrroy..',
  '...hoorrrrrrwbrro..',
  '...orrrrrrrrrrrrro.',
  '...orrrrrrrrrrrrrro',
  '...orrrrrrrrrrrrrro',
  '...orrrrrrrrrrrrro.',
  '...hoorrrrrrwbrro..',
  'hhhhhhoorrrrrrroy..',
  'hhhhhhoorrrrro...y.',
  'hhhhh....oooo.....y'
];
const PAL_CABECA = { o: '#7f1d1d', r: '#dc2626', w: '#ffffff', b: '#000000', h: '#92400e', y: '#facc15' };

// Pata de dragão chinês: sai do lado do corpo e termina em garras (8 × 5), apontando para fora
const SPRITE_PATA = [
  '.oo.....',
  'oyyoo...',
  'oyyyyoow',
  'oyyyyyyw',
  '.oo..oow'
];
const PAL_PATA = { o: '#7f1d1d', y: '#facc15', w: '#fef08a' };

const SPRITE_ESCAMA = [
  'oooooooo',
  'oyyyyyyo',
  'oyyrryyo',
  'oyrrrryo',
  'oyrrrryo',
  'oyyrryyo',
  'oyyyyyyo',
  'oooooooo'
];
const PAL_ESCAMA_A = { o: '#7f1d1d', y: '#facc15', r: '#dc2626' };
const PAL_ESCAMA_B = { o: '#7f1d1d', y: '#dc2626', r: '#facc15' };

const SPRITE_ENVELOPE_MINI = [
  'oooooooo',
  'orrrrrro',
  'orrddrro',
  'orrrrrro',
  'oooooooo'
];
const PAL_ENVELOPE_MINI = { o: '#facc15', r: '#b91c1c', d: '#dc2626' };

const SPRITE_MOEDA = [
  '.oooo.',
  'oyyyyo',
  'oy..yo',
  'oy..yo',
  'oyyyyo',
  '.oooo.'
];
const PAL_MOEDA = { o: '#92400e', y: '#facc15' };

let moedas = [];          // moedas caindo (a bola que pegar ganha 1 ponto)
let fogos = [];           // fogos subindo do chão (a bola que passar ganha uma bênção)
let textosAnoNovo = [];   // "+1", "+3" subindo de onde a bola pegou ou o tijolo quebrou
let dragao = null;        // dragão em jogo (null = ainda não apareceu)
let proximaMoeda = 0;     // quando cai a próxima moeda do céu (0 = ainda não sorteado)
let proximoFogo = 0;      // quando sobe o próximo fogo (0 = ainda não sorteado)

function faseAnoNovo() {
  return !!FASES[faseIndex].anoNovo;
}

// A fase está liberada hoje? (dentro da janela de cada Ano Novo Chinês da lista)
function anoNovoLiberado() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return ANO_NOVO_DATAS.some(data => {
    const [a, m, d] = data.split('-').map(Number);
    const inicio = new Date(a, m - 1, d - ANO_NOVO_ANTES);
    const fim = new Date(a, m - 1, d + ANO_NOVO_DEPOIS);
    return hoje >= inicio && hoje <= fim;
  });
}

// Fase nova: limpa tudo do Ano Novo
function resetarAnoNovo() {
  moedas = [];
  fogos = [];
  textosAnoNovo = [];
  dragao = null;
  proximaMoeda = 0;
  proximoFogo = 0;
}

// Roda a cada quadro durante a partida
function atualizarAnoNovo(dt, agora) {
  if (!faseAnoNovo()) return;
  atualizarDragao(dt, agora);
  atualizarMoedas(dt, agora);
  atualizarFogosChao(dt, agora);
  textosAnoNovo = textosAnoNovo.filter(t => agora < t.ate);
}

function sorteioEntre([min, max]) {
  return min + Math.random() * (max - min);
}

// ----- Tijolos especiais -----

// Tijolo especial quebrado (lanterna, envelope ou fogos). Chamado pela batida e pelos fogos vizinhos.
function romperTijoloAnoNovo(t, dono, agora) {
  t.vivo = false;
  tijolosVivos--;
  let pontos = 1;
  if (t.tipo === 'envelope') {
    pontos += ENVELOPE_BONUS;
    textosAnoNovo.push({ x: t.x + t.w / 2, y: t.y, texto: `+${pontos}`, inicio: agora, ate: agora + 1000 });
  }
  darPontos(dono, pontos);
  if (t.item) soltarItem(t);
  if (t.tipo === 'lanterna') soltarMoedas(t.x + t.w / 2, t.y + t.h / 2, agora, 3);
  if (t.tipo === 'fogos') explodirFogos(t, dono, agora);
}

// Fogos: explodem e quebram os tijolos num raio (os fogos vizinhos explodem também)
function explodirFogos(origem, dono, agora) {
  const cx = origem.x + origem.w / 2;
  const cy = origem.y + origem.h / 2;
  explosoes.push({ x: cx, y: cy, inicio: agora, cor: '#f97316', raio: FOGOS_RAIO, tempo: 500 });
  for (const o of tijolos) {
    if (!o.vivo || o.circ || o.chefao || o.saco) continue;
    if (Math.hypot(o.x + o.w / 2 - cx, o.y + o.h / 2 - cy) <= FOGOS_RAIO) romperTijoloAnoNovo(o, dono, agora);
  }
}

// Moedas da sorte: soltam para cima e depois caem
function soltarMoedas(x, y, agora, n) {
  for (let i = 0; i < n; i++) {
    moedas.push({ x, y, vx: (Math.random() - 0.5) * 140, vy: -(150 + Math.random() * 90), pegavelEm: agora + 300 });
  }
}

// Moedas que caem do céu, de vez em quando. A bola que encostar ganha 1 ponto.
function atualizarMoedas(dt, agora) {
  if (!proximaMoeda) proximaMoeda = agora + sorteioEntre(MOEDA_CADA);
  if (agora >= proximaMoeda) {
    moedas.push({ x: 30 + Math.random() * (W - 60), y: -10, vx: 0, vy: 60, pegavelEm: agora });
    proximaMoeda = agora + sorteioEntre(MOEDA_CADA);
  }
  const bolas = viewers.concat(copias).filter(b => b.estado === 'jogando');
  moedas = moedas.filter(m => {
    m.vy += MOEDA_GRAV * dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.x < MOEDA_R) { m.x = MOEDA_R; m.vx = Math.abs(m.vx); }
    if (m.x > W - MOEDA_R) { m.x = W - MOEDA_R; m.vx = -Math.abs(m.vx); }
    const b = agora >= m.pegavelEm && bolas.find(o => Math.hypot(o.x - m.x, o.y - m.y) < RAIO + MOEDA_R + 2);
    if (b) {
      darPontos(b.dono || b, 1);
      textosAnoNovo.push({ x: m.x, y: m.y, texto: '+1', inicio: agora, ate: agora + 900 });
      return false;
    }
    return m.y - MOEDA_R < fundoDoCampo(); // chegou no chão: some
  });
}

// ----- Fogo que sobe do chão (bênção) -----

function atualizarFogosChao(dt, agora) {
  if (!proximoFogo) proximoFogo = agora + sorteioEntre(FOGO_CADA);
  if (agora >= proximoFogo) {
    fogos.push({ x: 120 + Math.random() * (W - 240), inicio: agora, quem: [] });
    proximoFogo = agora + sorteioEntre(FOGO_CADA);
  }
  fogos = fogos.filter(f => agora < f.inicio + FOGO_DURA);
  for (const f of fogos) {
    const altura = alturaDoFogo(f, agora);
    const topo = fundoDoCampo() - altura;
    for (const b of viewers) {
      if (b.streamer || b.estado !== 'jogando' || f.quem.includes(b)) continue;
      if (Math.abs(b.x - f.x) < FOGO_PEGA && b.y > topo) {
        f.quem.push(b);
        abencoar(b, agora);
      }
    }
  }
}

// O fogo sobe, fica no ar e desce: altura de 0 a FOGO_ALTURA
function alturaDoFogo(f, agora) {
  return FOGO_ALTURA * Math.sin(Math.PI * Math.min(1, (agora - f.inicio) / FOGO_DURA));
}

// Bênção: uma das opções, sorteada (se a escolhida já estiver pronta, dá o !speed)
function abencoar(b, agora) {
  const opcoes = ['bomba', 'gravidade', 'choque', 'velocidade'];
  const escolha = opcoes[Math.floor(Math.random() * opcoes.length)];
  let texto;
  if (escolha === 'bomba' && b.bombas < BOMBA_MAX) {
    b.bombas++;
    texto = 'uma bomba';
  } else if (escolha === 'gravidade' && !b.gravidade) {
    b.gravidade = true;
    texto = '!gravity pronto';
  } else if (escolha === 'choque' && !b.choque) {
    b.choque = true;
    texto = '!shock pronto';
  } else {
    b.carga = Math.max(b.carga, batidasPara(CARGA_SPEED));
    texto = '!speed pronto';
  }
  marcarPoderPronto(b, agora);
  b.aviso = `${b.nome} ganhou ${texto}`;
  b.avisoAte = agora + DURACAO_AVISO + AVISO_SOME;
}

// ----- Dragão -----

// Caminho do desenho: a ida (esquerda → direita) e a volta espelhada (direita → esquerda).
// Começa e termina fora da tela, para a serpente entrar e sair.
function prepararCaminho(pontos) {
  const acum = [0];
  for (let i = 1; i < pontos.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(pontos[i][0] - pontos[i - 1][0], pontos[i][1] - pontos[i - 1][1]));
  }
  return { pontos, acum, total: acum[acum.length - 1] };
}

function caminhoDoDesenho(espelhado) {
  const pts = CAMINHO_DESENHO.map(([x, y]) => {
    const gx = (x - 55) / 1030 * W;
    const gy = (y - 38) / 602 * H;
    return [espelhado ? W - gx : gx, gy];
  });
  const fora = espelhado ? W + 260 : -260;
  return prepararCaminho([[fora, pts[0][1]], ...pts, [fora, pts[pts.length - 1][1]]]);
}

let caminhosDragao = null;
function obterCaminhosDragao() {
  if (!caminhosDragao) caminhosDragao = [caminhoDoDesenho(false), caminhoDoDesenho(true)];
  return caminhosDragao;
}

// Ponto do caminho à distância s do começo (antes do começo: fica no começo, fora da tela)
function pontoNoCaminho(c, s) {
  if (s <= 0) return c.pontos[0];
  if (s >= c.total) return c.pontos[c.pontos.length - 1];
  let i = 1;
  while (c.acum[i] < s) i++;
  const f = (s - c.acum[i - 1]) / (c.acum[i] - c.acum[i - 1]);
  const a = c.pontos[i - 1];
  const b = c.pontos[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

// Dragão: 12 partes que seguem a cabeça pelo caminho. O corpo não quebra: a vida é do dragão inteiro.
// As partes entram no tijolos como círculos (colisão de meteoro), e não são quebradas pelo caminho normal.
function criarDragao() {
  for (let i = 0; i < DRAGAO_SEGMENTOS; i++) {
    tijolos.push({
      dragao: true, circ: true, indice: i, r: DRAGAO_RAIO,
      cx: -999, cy: -999, x: -999, y: -999, w: DRAGAO_RAIO * 2, h: DRAGAO_RAIO * 2,
      vida: 1, vivo: true, item: false, cor: null
    });
  }
  tijolosVivos += DRAGAO_SEGMENTOS;
  return { volta: 0, s: 0, ang: 0, fugiu: false, morto: false, vida: DRAGAO_VIDA, fogos: [], proximoFogo: 0 };
}

// As partes vivas do dragão (todas, enquanto ele estiver inteiro)
function partesDoDragao() {
  return tijolos.filter(s => s.dragao && s.vivo);
}

function atualizarDragao(dt, agora) {
  if (!dragao) {
    if (!chefaoCaiu && estado === 'jogando' && tijolosVivos === 0) { // só depois que todos os tijolos quebram
      dragao = criarDragao();
      chefaoCaiu = true;
      anunciar('Dragão do Ano Novo!', agora);
    }
    return;
  }
  if (dragao.fugiu || dragao.morto) return;
  const d = dragao;
  let caminho = obterCaminhosDragao()[d.volta % 2];
  d.s += DRAGAO_VEL * dt;
  if (d.s >= caminho.total) {
    // terminou a volta: o dragão sai da tela e, se ainda tem voltas, entra de novo pelo outro lado
    d.volta++;
    if (d.volta >= DRAGAO_VOLTAS) return fugirDragao(agora);
    d.s = 0;
    d.fogos = []; // o fogo da volta anterior some
    caminho = obterCaminhosDragao()[d.volta % 2];
  }
  for (const s of partesDoDragao()) {
    const [x, y] = pontoNoCaminho(caminho, d.s - s.indice * DRAGAO_ESPACO);
    s.cx = x;
    s.cy = y;
    s.x = x - s.r;
    s.y = y - s.r;
  }
  // direção da cabeça (para desenhar a cabeça virada para onde vai)
  const [ax, ay] = pontoNoCaminho(caminho, d.s);
  const [bx, by] = pontoNoCaminho(caminho, d.s + 4);
  d.ang = Math.atan2(by - ay, bx - ax);
  atualizarFogoDoDragao(agora);
  empurrarBolasDoDragao(agora);
  soltarFantasmas();
}

// Dragão solta fogo logo à frente da cabeça. O fogo anda junto com ele (sempre à mesma distância no caminho),
// então a serpente nunca passa por cima dele. Quem pegar fica atordoado.
function atualizarFogoDoDragao(agora) {
  const d = dragao;
  const caminho = obterCaminhosDragao()[d.volta % 2];
  if (!d.proximoFogo) d.proximoFogo = agora + sorteioEntre(DRAGAO_FOGO_CADA);
  if (agora >= d.proximoFogo) {
    d.fogos.push({ inicio: agora, x: 0, y: 0 });
    d.proximoFogo = agora + sorteioEntre(DRAGAO_FOGO_CADA);
  }
  d.fogos = d.fogos.filter(f => agora < f.inicio + DRAGAO_FOGO_DURA && d.s + DRAGAO_FOGO_FRENTE < caminho.total);
  for (const f of d.fogos) {
    [f.x, f.y] = pontoNoCaminho(caminho, d.s + DRAGAO_FOGO_FRENTE);
    for (const b of viewers) {
      if (b.streamer || b.estado !== 'jogando') continue;
      if (Math.hypot(b.x - f.x, b.y - f.y) >= DRAGAO_FOGO_RAIO + RAIO) continue;
      // se ainda não estava atordoada, guarda a direção que tinha antes do atordoamento
      if (agora >= b.atordoadaAte) {
        b.vxAntes = b.vx;
        b.vyAntes = b.vy;
      }
      b.atordoadaAte = agora + DRAGAO_ATORDOA;
    }
  }
}

// A serpente empurra as bolas que encostam nas partes. Bola atordoada não é empurrada: vira fantasma
// e passa por dentro do dragão (sem bater, sem contar batida, sem dar ponto).
function empurrarBolasDoDragao(agora) {
  const bolas = viewers.concat(copias);
  for (const s of partesDoDragao()) {
    for (const b of bolas) {
      if (b.estado !== 'jogando' || b.presoEm || b.buraco) continue;
      const dx = b.x - s.cx;
      const dy = b.y - s.cy;
      const dist = Math.hypot(dx, dy);
      const R = s.r + RAIO;
      if (dist >= R) continue;
      if (agora < b.atordoadaAte) { b.fantasma = true; continue; }
      if (dist === 0) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      b.x = s.cx + nx * R;
      b.y = s.cy + ny * R;
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
    }
  }
}

// Fantasma que o dragão já passou (não encosta mais em nenhuma parte): volta a andar na direção de antes
function soltarFantasmas() {
  for (const b of viewers) {
    if (!b.fantasma) continue;
    const dentro = partesDoDragao().some(s => Math.hypot(b.x - s.cx, b.y - s.cy) < s.r + RAIO);
    if (!dentro) restaurarFantasma(b);
  }
}

function restaurarFantasma(b) {
  b.fantasma = false;
  if (b.vxAntes !== undefined) {
    b.vx = b.vxAntes;
    b.vy = b.vyAntes;
  }
}

// Batida em qualquer parte do dragão: tira 1 de vida do dragão inteiro. O último golpe dá CHEFAO_PONTOS.
function danoNoDragao(b, agora) {
  const dono = b.dono || b;
  dragao.vida--;
  if (dragao.vida > 0) {
    darPontos(dono, 1);
    return;
  }
  dragao.vida = 0;
  dragao.morto = true;
  darPontos(dono, CHEFAO_PONTOS);
  textosAnoNovo.push({ x: b.x, y: b.y, texto: `+${CHEFAO_PONTOS}`, inicio: agora, ate: agora + 1200 });
  for (const s of partesDoDragao()) {
    s.vivo = false;
    tijolosVivos--;
  }
  dragao.fogos = [];
  viewers.forEach(restaurarFantasma);
  anunciar('Dragão derrotado!', agora);
}

// O dragão sai da tela sem morrer: as partes somem (a fase acaba com o que sobrou)
function fugirDragao(agora) {
  dragao.fugiu = true;
  dragao.fogos = [];
  for (const s of partesDoDragao()) {
    s.vivo = false;
    tijolosVivos--;
  }
  viewers.forEach(restaurarFantasma);
  anunciar('O dragão fugiu!', agora);
}

// ----- Desenho em pixel art -----

// Arte em PNG (pasta assets/imagens/ano-novo/, exportada por dev/gerar-sprites-ano-novo.ps1).
// Enquanto o PNG não carrega, o jogo usa o desenho de letras do próprio código, então nunca fica sem sprite.
const ARQUIVO_ANO_NOVO = {
  lanterna: 'lanterna', envelope: 'envelope', faisca: 'faisca-fogos', cabeca: 'cabeca-dragao',
  pata: 'pata-dragao', escamaA: 'escama-dragao-a', escamaB: 'escama-dragao-b',
  envelopeMini: 'envelope-dragao', moeda: 'moeda'
};
const imagensAnoNovo = new Map();
function imagemAnoNovo(nome) {
  if (!imagensAnoNovo.has(nome)) {
    const img = new Image();
    img.src = 'assets/imagens/ano-novo/' + nome + '.png';
    imagensAnoNovo.set(nome, img);
  }
  return imagensAnoNovo.get(nome);
}

// Sprite em pixel art: uma vez por tipo, guardado num canvas pequeno (cada letra vira um quadrado)
const spritesAnoNovo = new Map();
function spritePixels(chave, linhas, cores, esc) {
  const nome = ARQUIVO_ANO_NOVO[chave];
  if (nome) {
    const img = imagemAnoNovo(nome);
    if (img.complete && img.naturalWidth > 0) return img;
  }
  if (!spritesAnoNovo.has(chave)) {
    const c = document.createElement('canvas');
    c.width = linhas[0].length * esc;
    c.height = linhas.length * esc;
    const cx = c.getContext('2d');
    linhas.forEach((linha, j) => [...linha].forEach((ch, i) => {
      if (ch === '.' || !cores[ch]) return;
      cx.fillStyle = cores[ch];
      cx.fillRect(i * esc, j * esc, esc, esc);
    }));
    spritesAnoNovo.set(chave, c);
  }
  return spritesAnoNovo.get(chave);
}

// Tijolos especiais: lanterna que balança de leve, envelope vermelho e fogos (fundo de tijolo em pixels)
function desenharTijoloAnoNovo(t, agora) {
  const balanco = t.tipo === 'lanterna' ? Math.round(Math.sin(agora / 500 + t.x * 0.05) * 2) : 0;
  const x = t.x;
  const y = t.y;
  const w = t.w;
  const h = t.h;
  ctx.fillStyle = t.tipo === 'fogos' ? '#450a0a' : '#7f1d1d';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(x, y, w, 2); // luz em cima, como nos outros tijolos
  if (t.tipo === 'lanterna') {
    // corda, depois a lanterna (10 × 12 pixels, em escala 2)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + w / 2, y - 4, 2, 4);
    const sp = spritePixels('lanterna', SPRITE_LANTERNA, PAL_LANTERNA, 2);
    ctx.drawImage(sp, Math.round(x + w / 2 - sp.width / 2) + balanco, y);
  } else if (t.tipo === 'envelope') {
    const sp = spritePixels('envelope', SPRITE_ENVELOPE, PAL_ENVELOPE, 2);
    ctx.drawImage(sp, Math.round(x + w / 2 - sp.width / 2), Math.round(y + h / 2 - sp.height / 2));
  } else {
    const sp = spritePixels('faisca', SPRITE_FAISCA, PAL_FAISCA, 3);
    const girando = Math.floor(agora / 150) % 2 === 0; // pisca entre duas posições
    ctx.drawImage(sp, Math.round(x + w / 2 - sp.width / 2) + (girando ? 0 : 1), Math.round(y + h / 2 - sp.height / 2));
  }
}

// Parte do dragão: escamas alternadas (32 × 32 pixels em escala 4); a cabeça tem o envelope vermelho
function desenharSegmentoDragao(s, agora) {
  if (s.indice === 0) return; // a cabeça é desenhada por cima do corpo (em desenharExtrasAnoNovo)
  // liga com a parte da frente, com blocos de pixels (o corpo é inteiro)
  const frente = tijolos.find(o => o.dragao && o.vivo && o.indice === s.indice - 1);
  if (frente) {
    const n = Math.max(1, Math.ceil(Math.hypot(frente.cx - s.cx, frente.cy - s.cy) / 8));
    ctx.fillStyle = '#7f1d1d';
    for (let k = 0; k <= n; k++) {
      const px = s.cx + (frente.cx - s.cx) * k / n;
      const py = s.cy + (frente.cy - s.cy) * k / n;
      ctx.fillRect(Math.round(px) - 8, Math.round(py) - 8, 16, 16);
    }
  }
  if (frente && s.indice % 3 === 2) desenharPatas(s, frente); // patas em 2, 5, 8 e 11
  const pal = s.indice % 2 === 0 ? PAL_ESCAMA_A : PAL_ESCAMA_B;
  const sp = spritePixels(s.indice % 2 === 0 ? 'escamaA' : 'escamaB', SPRITE_ESCAMA, pal, 4);
  ctx.drawImage(sp, Math.round(s.cx - sp.width / 2), Math.round(s.cy - sp.height / 2));
  if (s.indice === DRAGAO_SEGMENTOS - 1) desenharRaboDragao(s);
}

// Rabo: 4 pedaços que vão afinando atrás da última parte, seguindo o mesmo caminho (não bate em nada)
const RABO_PEDACOS = [24, 20, 16, 12]; // largura de cada pedaço, em px
function desenharRaboDragao(ultimo) {
  const caminho = obterCaminhosDragao()[dragao.volta % 2];
  const base = dragao.s - ultimo.indice * DRAGAO_ESPACO; // onde está a última parte no caminho
  let anterior = ultimo;
  RABO_PEDACOS.forEach((larg, k) => {
    const [x, y] = pontoNoCaminho(caminho, base - (k + 1) * 14);
    // liga com a parte de trás, com blocos de pixels
    const n = Math.max(1, Math.ceil(Math.hypot(x - anterior.cx, y - anterior.cy) / 8));
    ctx.fillStyle = '#7f1d1d';
    for (let i = 0; i <= n; i++) {
      const px = anterior.cx + (x - anterior.cx) * i / n;
      const py = anterior.cy + (y - anterior.cy) * i / n;
      ctx.fillRect(Math.round(px) - 4, Math.round(py) - 4, 8, 8);
    }
    const pal = k % 2 === 0 ? PAL_ESCAMA_B : PAL_ESCAMA_A;
    const sp = spritePixels(k % 2 === 0 ? 'escamaB' : 'escamaA', SPRITE_ESCAMA, pal, 4);
    ctx.drawImage(sp, Math.round(x - larg / 2), Math.round(y - larg / 2), larg, larg);
    anterior = { cx: x, cy: y };
  });
  // ponta amarela no fim do rabo
  const fim = anterior;
  ctx.fillStyle = '#facc15';
  ctx.fillRect(Math.round(fim.cx) - 3, Math.round(fim.cy) - 3, 6, 6);
}

// Uma pata de cada lado do corpo, saindo para fora na perpendicular do caminho
function desenharPatas(s, frente) {
  const sp = spritePixels('pata', SPRITE_PATA, PAL_PATA, 3);
  const dir = Math.atan2(s.cy - frente.cy, s.cx - frente.cx); // direção do corpo (da cabeça para a cauda)
  ctx.save();
  ctx.translate(s.cx, s.cy);
  for (const lado of [Math.PI / 2, -Math.PI / 2]) {
    ctx.save();
    ctx.rotate(dir + lado);
    ctx.drawImage(sp, 6, -sp.height / 2); // começa por dentro do corpo, que cobre a ponta
    ctx.restore();
  }
  ctx.restore();
}

function desenharCabecaDragao(s) {
  const sp = spritePixels('cabeca', SPRITE_CABECA, PAL_CABECA, 3);
  ctx.save();
  ctx.translate(s.cx, s.cy);
  ctx.rotate(dragao ? dragao.ang : 0); // a cabeça aponta para onde a serpente vai (vista de cima)
  ctx.drawImage(sp, -sp.width / 2, -sp.height / 2);
  ctx.restore();
  // vida que falta no dragão inteiro, em cima da cabeça
  const vida = dragao ? dragao.vida : 0;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';
  ctx.strokeText(vida, s.cx, s.cy - s.r - 14);
  ctx.fillStyle = '#fff';
  ctx.fillText(vida, s.cx, s.cy - s.r - 14);
  ctx.textAlign = 'left';
}

// Fogo em pixels: colunas de quadradinhos que sobem, mais largas embaixo e com a ponta em amarelo
function desenharChamaPixels(x, base, altura, agora, cor, larg) {
  const C = 4; // tamanho de cada quadradinho do fogo
  const linhas = Math.max(1, Math.floor(altura / C));
  for (let j = 0; j < linhas; j++) {
    const t = j / linhas;
    const tremor = Math.round(Math.sin(agora / 120 + j) * 1);
    const meia = Math.max(0, Math.round((larg / 2) * (1 - t) * 1.2) + tremor);
    ctx.fillStyle = t < 0.5 ? cor : '#fef08a';
    for (let i = -meia; i <= meia; i++) {
      ctx.fillRect(Math.round(x + i * C - C / 2), base - (j + 1) * C, C, C);
    }
  }
}

// Fogo do dragão: uma mancha de fogo azul em pixels, que cresce no começo e pisca enquanto anda junto
function desenharFogoDoDragao(f, agora) {
  const C = 4;
  const cells = Math.round(DRAGAO_FOGO_RAIO / C);
  const cresce = Math.min(1, (agora - f.inicio) / 400);
  const raio = cells * cresce;
  const pisca = Math.floor(agora / 120) % 2;
  for (let j = -cells; j <= cells; j++) {
    for (let i = -cells; i <= cells; i++) {
      const dist = Math.hypot(i, j);
      if (dist > raio + (pisca ? 0 : -1)) continue;
      ctx.fillStyle = dist < raio * 0.5 ? '#e0f2fe' : '#38bdf8';
      ctx.fillRect(Math.round(f.x) + i * C - C / 2, Math.round(f.y) + j * C - C / 2, C, C);
    }
  }
}

// Moedas da sorte, fogos que sobem do chão, fogo do dragão e os "+1" da fase
function desenharExtrasAnoNovo(agora) {
  if (!faseAnoNovo()) return;
  const cabeca = tijolos.find(t => t.dragao && t.vivo && t.indice === 0);
  if (cabeca) desenharCabecaDragao(cabeca); // a cabeça fica por cima do corpo, para ficar visível
  const base = fundoDoCampo();
  for (const f of fogos) {
    const altura = alturaDoFogo(f, agora);
    desenharChamaPixels(f.x, base, altura, agora, '#f97316', 8);
    desenharChamaPixels(f.x - 16, base, altura * 0.6, agora + 300, '#ea580c', 5);
    desenharChamaPixels(f.x + 16, base, altura * 0.6, agora + 600, '#ea580c', 5);
  }
  if (dragao) for (const f of dragao.fogos) desenharFogoDoDragao(f, agora);
  const sp = spritePixels('moeda', SPRITE_MOEDA, PAL_MOEDA, 2);
  for (const m of moedas) {
    ctx.drawImage(sp, Math.round(m.x - sp.width / 2), Math.round(m.y - sp.height / 2));
  }
  for (const t of textosAnoNovo) {
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
