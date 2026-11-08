// ===== Desempate no pódio: mini-jogo ao vivo =====
// Quem empata em pontos e está em 1º a 4º joga aqui. Um tijolo foge das bolas do grupo; cada encosto dá 1 ponto
// de desempate, e o tijolo tem vida igual ao número de bolas. Quem decide a posição fica em cima.
// Só a ordem muda: os pontos do ranking não mudam. As regras puras estão em desempate-regras.js.

const DESEMPATE_ESPERA = 10000;      // tijolo parado no começo, para as bolas se posicionarem (ms)
const DESEMPATE_TEMPO = 60000;       // tempo total de cada grupo (ms)
const DESEMPATE_AVISO = 5000;        // mensagem grande antes de cada grupo começar (ms)
const DESEMPATE_TIJOLO_W = 96;       // tamanho do tijolo que foge (px)
const DESEMPATE_TIJOLO_H = 30;
const DESEMPATE_TIJOLO_VEL = 170;    // velocidade do tijolo (px por segundo)
const DESEMPATE_BOLA_VEL = VEL_BASE * 0.9; // velocidade das bolas que perseguem
const DESEMPATE_COOLDOWN = 600;      // ms: a mesma bola não conta dois encostos seguidos
const BOLA_STREAMER_CHAVE = '__streamer__';

let desempate = null;               // mini-jogo em andamento (null = nenhum)
let ordensDesempate = new Map();    // chave do jogador -> ordem decidida no desempate (0 = 1º do grupo)
let desempateSuspenso = null;       // Voltei no meio do desempate: função que continua o fluxo depois

// Linhas do ranking (viewers e, se marcado, o streamer), já ordenadas, com a posição de cada uma
function montarLinhas() {
  const linhas = viewers.filter(b => !b.streamer).map(b => ({ chave: b.nome, nome: b.nome, pontos: b.pontos, streamer: false, ref: b }));
  if (streamerPontua) linhas.push({ chave: BOLA_STREAMER_CHAVE, nome: 'Streamer', pontos: streamerPts, streamer: true, ref: null });
  for (const l of linhas) l.ordem = ordensDesempate.get(l.chave);
  return rotularLinhas(ordenarLinhas(linhas));
}

// Começa o desempate dos grupos empatados. Sem grupo, só chama 'depois' (o fluxo normal segue).
function iniciarDesempate(linhas, depois) {
  const grupos = gruposDesempate(linhas);
  if (grupos.length === 0) { depois(); return; }
  desempate = { grupos, indice: 0, linhas, depois, fase: 'aviso', etapa: null, bolas: new Map(), tijolo: null,
                comecaEm: 0, esperaAte: 0, fimEm: 0 };
  copias = [];
  itensCaindo = [];
  estado = 'desempate';
  prepararGrupo(agoraJogo());
}

// Prepara o grupo atual: bolas prontas, tijolo ainda não nasceu, mensagem grande por DESEMPATE_AVISO
function prepararGrupo(agora) {
  const d = desempate;
  const grupo = d.grupos[d.indice];
  d.bolas = new Map();
  for (const l of grupo) {
    let b = l.ref;
    if (!b) { // streamer na ordem do ranking: no modo normal ele não tem bola, então ganha uma só para o desempate
      const antes = viewers.length;
      entrar(nomeStreamer, true);
      if (viewers.length === antes) entrar(nomeStreamer + ' ', true); // já tem um viewer com esse nome
      b = viewers[viewers.length - 1];
      b.desempateTemp = true;
      l.ref = b;
    }
    b.estado = 'jogando';
    b.presoEm = null;
    b.buraco = null;
    b.atraidaAte = 0;
    b.velExtraAte = 0;
    b.impulsoAte = 0;
    b.atordoadaAte = 0;
    b.efeitoAte = 0;
    b.poderAte = 0;
    b.fila = [];
    b.chaveDesempate = l.chave;
    b.toqueAte = 0;
    d.bolas.set(l.chave, b);
  }
  d.etapa = criarDisputa(grupo.map(l => l.chave));
  d.tijolo = null;
  d.fase = 'aviso';
  d.comecaEm = agora + DESEMPATE_AVISO;
  atualizarTextoDesempate();
}

// Chamado a cada quadro enquanto estado === 'desempate'
function atualizarDesempate(dt, agora) {
  const d = desempate;
  if (!d) return;
  if (d.fase === 'aviso') {
    if (agora >= d.comecaEm) comecarJogoGrupo(agora);
    return;
  }
  if (agora >= d.fimEm) { // tempo do grupo acabou: quem falta fica na ordem anterior
    fecharPorTempo(d.etapa);
    concluirGrupo();
    return;
  }
  const t = d.tijolo;
  if (agora >= d.esperaAte) moverTijolo(d, t, dt);
  for (const chave of [...d.etapa.restantes]) {
    const b = d.bolas.get(chave);
    perseguir(b, t, dt);
    const px = Math.max(t.x, Math.min(b.x, t.x + t.w));
    const py = Math.max(t.y, Math.min(b.y, t.y + t.h));
    const dx = b.x - px;
    const dy = b.y - py;
    const dist = Math.hypot(dx, dy);
    if (dist >= RAIO || agora < b.toqueAte) continue;
    // encostou: quica para longe e o tijolo escolhe outro lugar para fugir
    const nx = dist ? dx / dist : 0;
    const ny = dist ? dy / dist : -1;
    b.x = px + nx * RAIO;
    b.y = py + ny * RAIO;
    b.vx = nx * DESEMPATE_BOLA_VEL;
    b.vy = ny * DESEMPATE_BOLA_VEL;
    b.toqueAte = agora + DESEMPATE_COOLDOWN;
    t.alvo = escolherAlvo(d, t);
    const res = tocarTijolo(d.etapa, chave);
    if (!res) continue;
    if (res.decidido) { // a bola que decidiu a posição para de correr e fica onde está
      b.vx = 0;
      b.vy = 0;
    }
    if (res.fim) { concluirGrupo(); return; }
  }
}

// Tijolo começa a fugir depois da espera; quando chega no alvo, escolhe outro
function moverTijolo(d, t, dt) {
  if (!t.alvo) t.alvo = escolherAlvo(d, t);
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  const dx = t.alvo.x - cx;
  const dy = t.alvo.y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < 8) { t.alvo = escolherAlvo(d, t); return; }
  const passo = Math.min(dist, DESEMPATE_TIJOLO_VEL * dt);
  t.x += (dx / dist) * passo;
  t.y += (dy / dist) * passo;
}

// Escolhe um lugar para o tijolo: entre 6 sorteados, o mais longe da bola mais perto (foge de verdade)
function escolherAlvo(d, t) {
  const bolas = d.etapa.restantes.map(k => d.bolas.get(k)).filter(Boolean);
  const topo = 100; // abaixo do cartaz do mata-mata (que ocupa os primeiros 70 px)
  const fundo = fundoDoCampo() * 0.6;
  let melhor = null;
  let melhorDist = -1;
  for (let i = 0; i < 6; i++) {
    const x = 60 + Math.random() * (W - 120);
    const y = topo + Math.random() * Math.max(40, fundo - topo);
    const perto = bolas.length ? Math.min(...bolas.map(b => Math.hypot(b.x - x, b.y - y))) : 0;
    if (perto > melhorDist) { melhorDist = perto; melhor = { x, y }; }
  }
  return melhor;
}

// Bola persegue o tijolo (vai reta, com a velocidade virando aos poucos: curva, não robótico)
function perseguir(b, t, dt) {
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  const dx = cx - b.x;
  const dy = cy - b.y;
  const dist = Math.hypot(dx, dy) || 1;
  const vx = (dx / dist) * DESEMPATE_BOLA_VEL;
  const vy = (dy / dist) * DESEMPATE_BOLA_VEL;
  const k = Math.min(1, dt * 2.5);
  b.vx += (vx - b.vx) * k;
  b.vy += (vy - b.vy) * k;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  // a bola não sai da tela
  const fundo = fundoDoCampo();
  if (b.x < RAIO) { b.x = RAIO; b.vx = Math.abs(b.vx); }
  if (b.x > W - RAIO) { b.x = W - RAIO; b.vx = -Math.abs(b.vx); }
  if (b.y < RAIO) { b.y = RAIO; b.vy = Math.abs(b.vy); }
  if (b.y > fundo - RAIO) { b.y = fundo - RAIO; b.vy = -Math.abs(b.vy); }
}

// Mensagem grande acabou: começa o jogo do grupo (o ranking some e o tijolo nasce no alto)
function comecarJogoGrupo(agora) {
  const d = desempate;
  d.fase = 'jogo';
  d.esperaAte = agora + DESEMPATE_ESPERA;
  d.fimEm = agora + DESEMPATE_TEMPO;
  d.tijolo = { x: W / 2 - DESEMPATE_TIJOLO_W / 2, y: 100, w: DESEMPATE_TIJOLO_W, h: DESEMPATE_TIJOLO_H, alvo: null };
  document.getElementById('ranking').classList.add('escondido');
  atualizarTextoDesempate();
}

// Grupo resolvido: grava a ordem de cada um e passa para o próximo grupo (ou termina)
function concluirGrupo() {
  const d = desempate;
  d.etapa.ordem.forEach((chave, i) => ordensDesempate.set(chave, i));
  d.indice++;
  if (d.indice < d.grupos.length) {
    prepararGrupo(agoraJogo());
    return;
  }
  terminarDesempate();
}

// Todos os grupos resolvidos: tira a bola temporária do streamer e volta para o fluxo normal
function terminarDesempate() {
  const d = desempate;
  desempate = null;
  viewers = viewers.filter(b => !b.desempateTemp);
  copias = [];
  itensCaindo = [];
  d.depois();
}

// Texto da mensagem grande (dentro do ranking) e do cartaz no jogo
function textoDoGrupo() {
  const d = desempate;
  if (!d || !d.grupos[d.indice]) return '';
  const grupo = d.grupos[d.indice];
  return rotuloDisputa(d.linhas.indexOf(grupo[0]), grupo.length);
}

function atualizarTextoDesempate() {
  const el = document.getElementById('desempateAviso');
  if (!el) return;
  const d = desempate;
  el.textContent = d ? `Desempate: ${textoDoGrupo()}` : '';
  el.classList.toggle('escondido', !d || d.fase !== 'aviso');
}

// Cartaz no topo do jogo (mata-mata) e o tijolo que foge
function desenharDesempate(agora) {
  const d = desempate;
  if (!d) return;
  const aviso = d.fase === 'aviso';
  const segundos = Math.max(0, Math.ceil(((aviso ? d.comecaEm : d.fimEm) - agora) / 1000));
  const titulo = aviso ? `Desempate: ${textoDoGrupo()}` : `Mata-mata: ${textoDoGrupo()}`;
  const sub = aviso ? `começa em ${segundos} s`
    : `tijolo com ${d.etapa.vida} de vida · ${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')} restantes`;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, W, 70);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(titulo, W / 2, 34);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '18px sans-serif';
  ctx.fillText(sub, W / 2, 60);
  if (!aviso && d.tijolo) {
    const t = d.tijolo;
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.strokeRect(t.x, t.y, t.w, t.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(d.etapa.vida), t.x + t.w / 2, t.y + t.h / 2 + 6);
  }
  ctx.restore();
}

// Voltei no meio do desempate (modo intervalo): para o mini-jogo e mostra o ranking com Continuar ou Cancelar
function suspenderDesempate() {
  const d = desempate;
  desempateSuspenso = d.depois;
  desempate = null;
  viewers = viewers.filter(b => !b.desempateTemp);
  copias = [];
  itensCaindo = [];
  estado = 'fim';
  mostrarEscolhaDesempate();
}

function mostrarEscolhaDesempate() {
  mostrarRankingFinal(montarLinhas());
  document.getElementById('desempateEscolha').classList.remove('escondido');
  document.getElementById('desempateAviso').classList.add('escondido');
}

function esconderEscolhaDesempate() {
  const el = document.getElementById('desempateEscolha');
  if (el) el.classList.add('escondido');
}

// Continuar: refaz o desempate dos grupos que ainda estão sem ordem, e depois segue o fluxo que estava
function continuarDesempate() {
  const depois = desempateSuspenso;
  desempateSuspenso = null;
  esconderEscolhaDesempate();
  if (!depois) return;
  estado = 'desempate';
  iniciarDesempate(montarLinhas(), depois);
}

// Cancelar: o ranking final fica como está, com os empates agrupados
function cancelarDesempate() {
  desempateSuspenso = null;
  esconderEscolhaDesempate();
  estado = 'fim';
  mostrarRankingFinal(montarLinhas());
}

// Trocou de cena ou saiu no meio: some com o mini-jogo sem dar ordem a ninguém
function descartarDesempate() {
  desempate = null;
  viewers = viewers.filter(b => !b.desempateTemp);
  copias = [];
  itensCaindo = [];
}

document.getElementById('btDesempateContinuar').onclick = () => continuarDesempate();
document.getElementById('btDesempateCancelar').onclick = () => cancelarDesempate();
