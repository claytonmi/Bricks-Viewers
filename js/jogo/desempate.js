// ===== Desempate no pódio: mini-jogo ao vivo =====
// Quem empata em pontos e está em 1º a 4º joga aqui, como uma partida nova só com as bolas do grupo.
// Um tijolo anda de um lado para o outro no alto da tela (como uma esteira). As bolas quicam com a física normal
// e batem no tijolo como em qualquer fase; cada batida dá 1 ponto de desempate. O tijolo não puxa ninguém.
// Quem decide a posição sai do campo. Só a ordem muda: os pontos do ranking não mudam.
// As regras puras (ordem, grupos, vida do tijolo) estão em desempate-regras.js.

const DESEMPATE_TEMPO = 60000;       // tempo total de cada grupo (ms)
const DESEMPATE_AVISO = 5000;        // mensagem grande antes de cada grupo começar (ms)
const DESEMPATE_TIJOLO_W = 96;       // tamanho do tijolo que anda (px)
const DESEMPATE_TIJOLO_H = 30;
const DESEMPATE_TIJOLO_Y = 90;       // altura do tijolo: logo abaixo do cartaz
const DESEMPATE_TIJOLO_VEL = [100, 170]; // velocidade do tijolo, sorteada a cada batida na parede (px/s)
const BOLA_STREAMER_CHAVE = '__streamer__';

let desempate = null;               // mini-jogo em andamento (null = nenhum)
let ordensDesempate = new Map();    // chave do jogador -> ordem decidida no desempate (0 = 1º do grupo)
let desempateSuspenso = null;       // Voltei no meio do desempate: função que continua o fluxo depois

// Linhas do ranking (viewers e, se marcado, o streamer), já ordenadas, com a posição de cada uma.
// Durante o desempate, o ranking vem de todos os jogadores da fase (não só das bolas que estão no campo).
function montarLinhas() {
  const origem = desempate ? desempate.originais : viewers;
  const linhas = origem.filter(b => !b.streamer).map(b => ({ chave: b.nome, nome: b.nome, pontos: b.pontos, streamer: false, ref: b }));
  if (streamerPontua) linhas.push({ chave: BOLA_STREAMER_CHAVE, nome: 'Streamer', pontos: streamerPts, streamer: true, ref: null });
  for (const l of linhas) l.ordem = ordensDesempate.get(l.chave);
  return rotularLinhas(ordenarLinhas(linhas));
}

// Começa o desempate dos grupos empatados. Sem grupo, só chama 'depois' (o fluxo normal segue).
function iniciarDesempate(linhas, depois) {
  const grupos = gruposDesempate(linhas);
  if (grupos.length === 0) { depois(); return; }
  desempate = { grupos, indice: 0, linhas, depois, fase: 'aviso', etapa: null, bolas: new Map(), tijolo: null,
                comecaEm: 0, fimEm: 0, acabouGrupo: false, originais: viewers.slice() };
  copias = [];
  itensCaindo = [];
  liberarBuracos(); // fase 6: nenhuma espiral no meio do mini-jogo
  estado = 'desempate';
  prepararGrupo(agoraJogo());
}

// Prepara o grupo atual: só as bolas do grupo ficam no campo, embaixo, como numa partida nova
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
      d.originais.push(b);
      l.ref = b;
    }
    d.bolas.set(l.chave, b);
  }
  // as bolas do grupo, de baixo para cima, nas posições de largada (como o lobby)
  const bolas = grupo.map(l => d.bolas.get(l.chave));
  bolas.forEach((b, i) => {
    const p = posicaoSlot(i);
    b.x = p.x;
    b.y = p.y;
    b.vx = 0;
    b.vy = 0;
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
    b.carga = 0;
    b.bombas = 0;
    b.batidas = 0;
    b.gravidade = false;
    b.batidasGrav = 0;
    b.choque = false;
    b.batidasChoque = 0;
  });
  for (const l of grupo) d.bolas.get(l.chave).chaveDesempate = l.chave;
  viewers = bolas;
  tijolos = []; // o tijolo só nasce quando o grupo começa a jogar
  d.etapa = criarDisputa(grupo.map(l => l.chave));
  d.ganhos = []; // pontos dados neste grupo, um por vez (ainda desfazíveis)
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
  moverTijolo(d.tijolo, dt);
  // física normal: cada bola se move, quica nas paredes, na raquete e no tijolo (ver fisica.js)
  for (const b of [...viewers]) {
    if (viewers.includes(b)) atualizarBola(b, dt, agora);
  }
  if (d.acabouGrupo) {
    d.acabouGrupo = false;
    concluirGrupo();
  }
}

// Tijolo anda de um lado ao outro no alto da tela, como uma esteira. Bate na parede e volta; nunca sai da tela.
function moverTijolo(t, dt) {
  t.x += t.vx * dt;
  if (t.x <= 0) {
    t.x = 0;
    t.vx = Math.abs(t.vx);
    t.vx = sortearVelocidadeTijolo() * Math.sign(t.vx);
  }
  if (t.x + t.w >= W) {
    t.x = W - t.w;
    t.vx = -Math.abs(t.vx);
    t.vx = sortearVelocidadeTijolo() * Math.sign(t.vx);
  }
}

function sortearVelocidadeTijolo() {
  const [min, max] = DESEMPATE_TIJOLO_VEL;
  return min + Math.random() * (max - min);
}

// Chamado pela física quando uma bola do desempate bate no tijolo (ver registrarBatida em fisica.js)
function desempateBateu(b) {
  const d = desempate;
  if (!d || d.fase !== 'jogo' || !b.chaveDesempate) return;
  const res = tocarTijolo(d.etapa, b.chaveDesempate);
  if (!res) return;
  if (res.decidido) { // quem ganha uma posição leva 1 ponto (o ranking mostra o total novo)
    darPontoDesempate(d, res.decidido);
    viewers = viewers.filter(x => x !== b); // e sai do campo
  }
  if (res.fim) d.acabouGrupo = true; // o grupo acabou: concluído no fim do quadro
}

// Todos os jogadores do ranking durante o desempate (inclusive os que estão fora do campo)
function jogadoresDoRanking(d) {
  const lista = d.originais.filter(b => !b.streamer).map(b => ({ chave: b.nome, ref: b }));
  if (streamerPontua) lista.push({ chave: BOLA_STREAMER_CHAVE, ref: null });
  return lista;
}

const pontosDoJogador = p => (p.chave === BOLA_STREAMER_CHAVE ? streamerPts : p.ref.pontos);

function somarPontoDesempate(d, p) {
  d.ganhos.push(p);
  if (p.chave === BOLA_STREAMER_CHAVE) streamerPts++;
  else p.ref.pontos++;
}

// +1 ponto para quem ganhou a posição no desempate. Se com isso ele empatar com alguém que já estava
// na frente (e não jogou este desempate), esse alguém também ganha +1 e continua na frente; se esse +1
// empatar com outro que estava mais acima, o mesmo vale para ele, e assim por diante.
function darPontoDesempate(d, chave) {
  somarPontoDesempate(d, { chave, ref: chave === BOLA_STREAMER_CHAVE ? null : d.bolas.get(chave) });
  const noGrupo = new Set(d.grupos[d.indice].map(l => l.chave));
  const fora = jogadoresDoRanking(d).filter(p => !noGrupo.has(p.chave));
  const subiram = new Set(); // quem já ganhou o +1 agora não conta de novo
  let total = pontosDoJogador({ chave, ref: d.bolas.get(chave) });
  for (;;) {
    const empatados = fora.filter(p => !subiram.has(p) && pontosDoJogador(p) === total);
    if (empatados.length === 0) break;
    empatados.forEach(p => { somarPontoDesempate(d, p); subiram.add(p); });
    total++;
  }
}

// Desfaz os pontos já dados no grupo atual (quando o desempate para no meio: Voltei ou troca de cena)
function desfazerPontosDesempate(d) {
  for (const p of d.ganhos) {
    if (p.chave === BOLA_STREAMER_CHAVE) streamerPts--;
    else p.ref.pontos--;
  }
  d.ganhos = [];
}

// Mensagem grande acabou: começa o jogo do grupo. O tijolo nasce no alto e as bolas são lançadas para cima.
function comecarJogoGrupo(agora) {
  const d = desempate;
  d.fase = 'jogo';
  d.fimEm = agora + DESEMPATE_TEMPO;
  const vx = sortearVelocidadeTijolo() * (Math.random() < 0.5 ? -1 : 1);
  d.tijolo = { x: W / 2 - DESEMPATE_TIJOLO_W / 2, y: DESEMPATE_TIJOLO_Y, w: DESEMPATE_TIJOLO_W, h: DESEMPATE_TIJOLO_H,
               vx, vivo: true, cor: '#f97316', vida: 1, vidaMax: 1, circ: false, item: false, chefao: false,
               desempate: true };
  tijolos = [d.tijolo];
  for (const b of viewers) lancar(b);
  document.getElementById('ranking').classList.add('escondido');
  atualizarTextoDesempate();
}

// Grupo resolvido: grava a ordem de cada um e passa para o próximo grupo (ou termina)
function concluirGrupo() {
  const d = desempate;
  // ordem global da fase: grupos decididos antes ficam na frente dos seguintes com o mesmo total
  const base = ordensDesempate.size;
  d.etapa.ordem.forEach((chave, i) => ordensDesempate.set(chave, base + i));
  d.indice++;
  if (d.indice < d.grupos.length) {
    prepararGrupo(agoraJogo());
    return;
  }
  terminarDesempate();
}

// Devolve o campo ao que era: todos os jogadores da fase voltam, sem tijolo do desempate e sem bola temporária
function restaurarCampo(d) {
  viewers = d.originais.filter(b => !b.desempateTemp);
  tijolos = [];
  copias = [];
  itensCaindo = [];
}

// Todos os grupos resolvidos: volta ao fluxo normal (ranking)
function terminarDesempate() {
  const d = desempate;
  desempate = null;
  restaurarCampo(d);
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

// Cartaz no topo do jogo (mata-mata) com a vida do tijolo e o tempo. O tijolo é desenhado pela tela normal.
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
  ctx.restore();
}

// Voltei no meio do desempate (modo intervalo): para o mini-jogo e mostra o ranking com Continuar ou Cancelar
function suspenderDesempate() {
  const d = desempate;
  desempateSuspenso = d.depois;
  desempate = null;
  desfazerPontosDesempate(d);
  restaurarCampo(d);
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
  const d = desempate;
  desempate = null;
  desfazerPontosDesempate(d);
  restaurarCampo(d);
}

document.getElementById('btDesempateContinuar').onclick = () => continuarDesempate();
document.getElementById('btDesempateCancelar').onclick = () => cancelarDesempate();
