// ===== Fase 6: Espaço =====
// Meteoros redondos e irregulares que se partem, e um buraco de minhoca: a bola entra pela entrada
// (escura, com espiral) e sai pela saída (clara), sempre no mesmo sentido.
// Os meteoros são tijolos com circ: true (colisão redonda, ver fisica.js e desenho.js).

// Total de meteoros desta partida: começa com o total cheio (o lobby usa ele) e é ajustado no início
function totalEspaco(jogadores) {
  return totalPorJogadores(ESPACO_MIN, FASES[faseIndex].espaco.total, jogadores);
}

function espacoAtiva() {
  return !!FASES[faseIndex].espaco;
}

// Monta os meteoros da fase: 20 já na tela, espalhados e parados. Chamado por montarFase.
function montarEspaco() {
  espacoTotal = FASES[faseIndex].espaco.total;
  espacoSeq = 0;
  proximaGota = 0;
  buraco = { fase: 'espera', t: 0, primeira: true, entrada: null, saida: null };
  for (let i = 0; i < ESPACO_INICIAL; i++) {
    const grande = Math.random() < ESPACO_CHANCE_GRANDE;
    const r = sortearRaio(grande);
    const p = pontoLivre(r);
    if (!p) continue;
    tijolos.push(novoMeteoro(p.x, p.y, r, grande, { vivos: 1, item: Math.random() < ITENS_PORCENTO }, espacoSeq++));
  }
  tijolosVivos = tijolos.length;
}

// No início da partida: acerta quantos meteoros ainda vão chegar (descontando os que já estão na tela)
function ajustarEspaco() {
  if (!espacoAtiva()) return;
  espacoTotal = totalEspaco(viewers.length);
  chuvaRestante = Math.max(0, espacoTotal - tijolosVivos);
}

function sortearRaio(grande) {
  const [min, max] = grande ? ESPACO_GRD : ESPACO_PEQ;
  return min + Math.random() * (max - min);
}

// Cor pela ordem de chegada: o primeiro terço é marrom, o segundo azulado e o último dourado
function corDoMeteoro(seq) {
  const terco = espacoTotal / 3;
  return seq < terco ? ESPACO_CORES[0] : seq < 2 * terco ? ESPACO_CORES[1] : ESPACO_CORES[2];
}

// Um meteoro: contorno e crateras sorteados uma vez, para ficar diferente de cada um dos outros
// grupo: { vivos, item } — um grande com dois pedaços conta como um meteoro só (ver quebrarMeteoro)
function novoMeteoro(x, y, r, grande, grupo, seq, pedaco = false) {
  const forma = Array.from({ length: 10 }, () => 0.8 + Math.random() * 0.2);
  const crateras = [0, 1].map(() => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 0.5, r: 0.12 + Math.random() * 0.12 }));
  const trincas = Array.from({ length: 5 }, () => Math.random() * Math.PI * 2);
  const vidaMax = grande ? 5 : 1; // grande: 5 batidas para quebrar; pequeno: 1
  return {
    circ: true, grande, pedaco, grupo, seq,
    cx: x, cy: y, r,
    x: x - r, y: y - r, w: 2 * r, h: 2 * r,   // caixa em volta do círculo (para o que espera por tijolos em caixa)
    vivo: true, vida: vidaMax, vidaMax,
    item: false, cor: corDoMeteoro(seq),
    forma, crateras, trincas, giro: Math.random() * Math.PI * 2,
    entrando: false, destino: null,
    chefao: false, linha: null, slot: null
  };
}

function atualizarCaixa(t) {
  t.x = t.cx - t.r;
  t.y = t.cy - t.r;
}

// Procura um lugar onde cabe um meteoro de raio r: fora dos outros e das reservas dos buracos
function pontoLivre(r, ignorar = null) {
  const a = ESPACO_AREA;
  for (let k = 0; k < 80; k++) {
    const x = a.x0 + r + Math.random() * (a.x1 - a.x0 - 2 * r);
    const y = a.y0 + r + Math.random() * (a.y1 - a.y0 - 2 * r);
    if (livreEm(x, y, r, ignorar)) return { x, y };
  }
  return null;
}

// Cabe um círculo de raio r em (x, y)? Não encosta em outro meteoro nem dentro da reserva de um buraco
function livreEm(x, y, r, ignorar = null) {
  for (const t of tijolos) {
    if (!t.vivo || t === ignorar || !t.circ) continue;
    if (Math.hypot(x - t.cx, y - t.cy) < r + t.r + 4) return false;
  }
  return !emReservaBuraco(x, y, r);
}

// O círculo (x, y, r) toca a reserva da entrada ou da saída? A reserva fica livre para a bola passar
function emReservaBuraco(x, y, r) {
  if (!buraco || !buraco.entrada) return false;
  for (const p of [buraco.entrada, buraco.saida]) {
    if (Math.hypot(x - p.x, y - p.y) < r + BURACO_R + BURACO_FOLGA) return true;
  }
  return false;
}

// Uma bola jogando perto de (x, y): o meteoro que está entrando espera ela sair
function bolaPerto(x, y, r) {
  return viewers.concat(copias).some(b => b.estado === 'jogando' && !b.buraco &&
    Math.hypot(b.x - x, b.y - y) < r + RAIO + 10);
}

// Um meteoro entra pela parte de cima e vai para o lugar sorteado, bem devagar.
// Desvia de um buraco que aparecer no caminho, para quando encosta em outro meteoro e espera bolas passarem.
function andarMeteoro(t, dt) {
  // sem destino (ainda não achou lugar): procura de novo a cada quadro, sem desistir.
  // Um meteoro nunca fica parado fora da área, senão nenhuma bola alcança e a fase não termina.
  if (!t.destino) { t.destino = pontoLivre(t.r, t); return; }
  const d0 = t.destino;
  const dx = d0.x - t.cx;
  const dy = d0.y - t.cy;
  const d = Math.hypot(dx, dy);
  const passo = ESPACO_VEL * dt;
  const chegou = d <= passo;
  const nx = chegou ? d0.x : t.cx + dx / d * passo;
  const ny = chegou ? d0.y : t.cy + dy / d * passo;
  if (emReservaBuraco(nx, ny, t.r)) {
    t.destino = pontoLivre(t.r, t); // desvia do buraco; se não achar agora, tenta de novo no próximo quadro
    return;
  }
  if (bolaPerto(nx, ny, t.r)) return;
  // passa por trás dos outros meteoros (não para ao encostar): só a reserva do buraco e as bolas bloqueiam
  t.cx = nx;
  t.cy = ny;
  atualizarCaixa(t);
  if (chegou) { t.entrando = false; t.destino = null; }
}

// Um meteoro novo entra pela parte de cima da área, no lugar que já foi sorteado
function spawnarMeteoro(agora) {
  const grande = Math.random() < ESPACO_CHANCE_GRANDE;
  const r = sortearRaio(grande);
  const destino = pontoLivre(r);
  const x = ESPACO_AREA.x0 + r + Math.random() * (ESPACO_AREA.x1 - ESPACO_AREA.x0 - 2 * r);
  if (!destino || !livreEm(x, -r, r)) { proximaGota = agora + 500; return; } // sem lugar agora: tenta de novo
  const t = novoMeteoro(x, -r, r, grande, { vivos: 1, item: Math.random() < ITENS_PORCENTO }, espacoSeq++);
  t.entrando = true;
  t.destino = destino;
  tijolos.push(t);
  chuvaRestante--;
  tijolosVivos++;
  proximaGota = agora + ESPACO_REPOR;
}

// Um meteoro quebrou (chamado pela física quando a vida chega a zero)
// Grande: vira dois pedaços com metade do raio, em lados opostos, e continua sendo um meteoro só.
// Pequeno ou pedaço: se for o último do grupo, o meteoro acabou (sai o item, se tiver, e entra outro).
function quebrarMeteoro(t, b) {
  t.vivo = false;
  t.entrando = false;
  darPontos(b.dono || b, 1);
  const g = t.grupo;
  if (t.grande) {
    const ang = Math.random() * Math.PI * 2;
    for (const s of [1, -1]) {
      const px = t.cx + Math.cos(ang) * s * t.r / 2;
      const py = t.cy + Math.sin(ang) * s * t.r / 2;
      const p = novoMeteoro(px, py, t.r / 2, false, g, t.seq, true);
      tijolos.push(p);
      // quebrou ainda entrando, com parte fora da tela: o pedaço também vai para um lugar na área
      if (p.cy - p.r < 0) { p.entrando = true; p.destino = pontoLivre(p.r, p); }
    }
    g.vivos += 1; // o grande sai e entram dois pedaços: 2 no grupo
    return;
  }
  g.vivos--;
  if (g.vivos > 0) return;
  tijolosVivos--;
  if (g.item) soltarItem({ x: t.cx - t.r, y: t.cy - t.r, w: 2 * t.r, h: 2 * t.r });
}

// ----- Buraco de minhoca -----

// Sorteia uma entrada e uma saída livres e longe uma da outra; null se não achar lugar agora
function colocarBuraco() {
  for (let k = 0; k < 20; k++) {
    const e = pontoLivre(BURACO_R + BURACO_FOLGA);
    const s = e && pontoLivre(BURACO_R + BURACO_FOLGA);
    if (e && s && Math.hypot(e.x - s.x, e.y - s.y) >= BURACO_DIST_MIN) return { entrada: e, saida: s };
  }
  return null;
}

// Alguma bola ainda está na espiral deste buraco?
function bolaNoBuraco() {
  return viewers.concat(copias).some(b => b.buraco);
}

// Ciclo do buraco, em milissegundos de jogo (só anda durante a partida):
// espera → aparecendo → aberto → fechando (a saída espera as bolas que entraram) → sumindo → espera
function atualizarBuraco(dt) {
  const b = buraco;
  b.t += dt * 1000;
  if (b.fase === 'espera') {
    const prazo = b.primeira ? BURACO_INICIO : BURACO_ESPERA;
    if (b.t < prazo) return;
    const lugar = colocarBuraco();
    if (!lugar) { b.t = prazo - 500; return; } // sem lugar livre: tenta de novo em meio segundo
    b.entrada = lugar.entrada;
    b.saida = lugar.saida;
    b.fase = 'aparecendo';
    b.t = 0;
    b.primeira = false;
  } else if (b.fase === 'aparecendo') {
    if (b.t >= BURACO_SURGE) { b.fase = 'aberto'; b.t = 0; }
  } else if (b.fase === 'aberto') {
    if (b.t >= BURACO_ABERTO) { b.fase = 'fechando'; b.t = 0; }
  } else if (b.fase === 'fechando') {
    if (!bolaNoBuraco()) { b.fase = 'sumindo'; b.t = 0; }
  } else if (b.fase === 'sumindo') {
    if (b.t >= BURACO_SOME) {
      b.entrada = null;
      b.saida = null;
      b.fase = 'espera';
      b.t = 0;
    }
  }
}

// A bola que chega perto da entrada, com o buraco aberto, começa a espiral (ver fisica.js)
function capturarNoBuraco(b) {
  if (!buraco || buraco.fase !== 'aberto' || b.estado !== 'jogando' || b.presoEm) return false;
  const e = buraco.entrada;
  const d = Math.hypot(b.x - e.x, b.y - e.y);
  if (d > BURACO_CAPTURA) return false;
  // guarda a velocidade de entrada: ela sai pela saída com a mesma direção e velocidade
  b.buraco = {
    entrada: e, saida: buraco.saida, t: 0, r0: d,
    ang0: Math.atan2(b.y - e.y, b.x - e.x), vx: b.vx, vy: b.vy
  };
  return true;
}

// Uma bola em espiral: gira até o centro da entrada, encolhendo, e depois sai pela saída
function avancarEspiral(b, dt) {
  const e = b.buraco;
  e.t += dt * 1000;
  const s = Math.min(1, e.t / BURACO_ESPIRAL);
  const r = e.r0 * (1 - s);
  const ang = e.ang0 + s * 4 * Math.PI;
  b.x = e.entrada.x + Math.cos(ang) * r;
  b.y = e.entrada.y + Math.sin(ang) * r;
  if (s >= 1) sairDoBuraco(b);
}

function sairDoBuraco(b) {
  const e = b.buraco;
  b.buraco = null;
  b.x = e.saida.x;
  b.y = e.saida.y;
  b.vx = e.vx;
  b.vy = e.vy;
}

// Fim da fase, ou partida que acabou com bolas na espiral: as bolas saem pela saída na hora
function liberarBuracos() {
  for (const b of viewers.concat(copias)) {
    if (b.buraco) sairDoBuraco(b);
  }
}

// Roda a cada quadro durante a partida (ver partida.js)
function atualizarEspaco(dt, agora) {
  if (!espacoAtiva()) return;
  tijolos = tijolos.filter(t => t.vivo); // tira os quebrados (a lista não cresce à toa)
  for (const t of tijolos) {
    if (!t.circ) continue;
    // rede de segurança: meteoro vivo com parte fora da tela tem que voltar a viajar para a área
    if (!t.entrando && t.cy - t.r < 0) { t.entrando = true; t.destino = pontoLivre(t.r, t); }
    if (t.entrando) andarMeteoro(t, dt);
  }
  // até 6 meteoros viajando ao mesmo tempo: a viagem é lenta, e a reposição não pode ficar esperando um por vez
  const viajando = tijolos.filter(t => t.entrando).length;
  if (chuvaRestante > 0 && agora >= proximaGota && viajando < ESPACO_MAX_VIAJANDO) spawnarMeteoro(agora);
  if (buraco) atualizarBuraco(dt);
}
