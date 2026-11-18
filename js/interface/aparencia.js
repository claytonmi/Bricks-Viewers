// ===== Aparência da raquete: cor e skin =====
// O streamer só escolhe depois de conectar o canal (ou no modo simulação). A escolha fica guardada
// no navegador dele e vai junto no link do OBS. A skin Fundador só vale para canais fundadores.
// No modo intervalo não tem raquete: a cor e a skin vão para a barra de baixo, onde as bolas quicam.

const CHAVE_COR_RAQUETE = 'bricksCorRaquete';
const CHAVE_SKIN_RAQUETE = 'bricksSkinRaquete';

let skinIndice = 0;              // skin mostrada no menu
let aparenciaLiberada = false;   // canal conectado (ou simulação): dá para escolher
let canalEhFundador = false;     // resposta do servidor para o canal conectado
let simulacaoLigada = false;     // modo simulação: todas as skins liberadas para testar

function lerGuardado(chave) {
  try { return localStorage.getItem(chave) || ''; } catch (e) { return ''; }
}
function guardarValor(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) { /* navegador sem armazenamento: só não lembra */ }
}

function skinLiberada(s) {
  return !s.soFundador || canalEhFundador || simulacaoLigada;
}

// ----- Cor -----

function escolherCorRaquete(cor, guardar) {
  cor = /^#[0-9a-f]{6}$/i.test(cor) ? cor.toLowerCase() : COR_RAQUETE_PADRAO;
  corRaquete = cor;
  document.getElementById('corRaquete').value = cor;
  if (guardar) guardarValor(CHAVE_COR_RAQUETE, cor);
  atualizarAparencia();
}

// ----- Skin -----

// Mostra a skin de número i no menu; se ela estiver liberada, passa a valer (e fica guardada)
function mostrarSkin(i, guardar) {
  const n = SKINS_RAQUETE.length;
  skinIndice = ((i % n) + n) % n;
  const s = SKINS_RAQUETE[skinIndice];
  if (guardar && skinLiberada(s)) guardarValor(CHAVE_SKIN_RAQUETE, s.id);
  atualizarAparencia();
}

// Escolhe pelo nome (link do OBS ou o que estava guardado)
function escolherSkin(id, guardar) {
  const i = SKINS_RAQUETE.findIndex(s => s.id === id);
  mostrarSkin(i < 0 ? 0 : i, guardar);
}

// O servidor respondeu se o canal é fundador (fundador.js): libera ou bloqueia a skin Fundador
function definirFundador(sim) {
  canalEhFundador = !!sim;
  atualizarAparencia();
}

// Canal conectado (ou simulação): libera as escolhas. Ao trocar de canal, bloqueia até conectar.
function liberarAparencia(sim, simulacao) {
  aparenciaLiberada = !!sim;
  simulacaoLigada = !!(sim && simulacao);
  atualizarAparencia();
}

// ----- Tela -----

function atualizarAparencia() {
  const s = SKINS_RAQUETE[skinIndice];
  const liberada = skinLiberada(s);
  // skin bloqueada (Fundador sem ser fundador): a raquete fica com a cor
  skinRaquete = liberada ? s.id : '';

  const caixa = document.getElementById('aparenciaRaquete');
  caixa.classList.toggle('bloqueada', !aparenciaLiberada);
  for (const el of caixa.querySelectorAll('button, input')) el.disabled = !aparenciaLiberada;
  if (aparenciaLiberada) document.getElementById('btCorPadrao').disabled = corRaquete === COR_RAQUETE_PADRAO;

  document.getElementById('skinNome').textContent = s.nome + (liberada ? '' : ' (só fundadores)');
  document.getElementById('linhaCorRaquete').classList.toggle('escondido', !!skinRaquete);

  // prévia: a skin, ou a raquete pintada com a cor; bloqueada fica apagada
  const cv = document.getElementById('skinPrevia');
  const cx = cv.getContext('2d');
  cx.clearRect(0, 0, cv.width, cv.height);
  const img = s.id ? imgs['skin_' + s.id] : raqueteColorida(corRaquete);
  if (img) {
    cx.globalAlpha = liberada ? 1 : 0.35;
    cx.drawImage(img, 0, 0, cv.width, cv.height);
    cx.globalAlpha = 1;
  }
}

function iniciarAparencia() {
  document.getElementById('corRaquete').oninput = e => escolherCorRaquete(e.target.value, true);
  document.getElementById('btCorPadrao').onclick = () => escolherCorRaquete(COR_RAQUETE_PADRAO, true);
  document.getElementById('skinAnt').onclick = () => mostrarSkin(skinIndice - 1, true);
  document.getElementById('skinProx').onclick = () => mostrarSkin(skinIndice + 1, true);
  corRaquete = /^#[0-9a-f]{6}$/i.test(lerGuardado(CHAVE_COR_RAQUETE)) ? lerGuardado(CHAVE_COR_RAQUETE) : COR_RAQUETE_PADRAO;
  document.getElementById('corRaquete').value = corRaquete;
  escolherSkin(lerGuardado(CHAVE_SKIN_RAQUETE), false);
}
