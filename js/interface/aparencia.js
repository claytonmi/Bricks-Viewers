// ===== Aparência da raquete: cor e skin =====
// O streamer só escolhe depois de conectar o canal (ou no modo simulação). A escolha fica guardada
// no navegador dele e vai junto no link do OBS.
// Há dois tipos de skin: as do jogo (SKINS_RAQUETE, grátis, no repositório) e as do servidor
// (Fundador, temporárias e, no futuro, as pagas). As do servidor só chegam depois de conectar:
// o servidor diz quais o canal pode usar e só entrega a imagem dessas.
// No modo intervalo não tem raquete: a cor e a skin vão para a barra de baixo, onde as bolas quicam.

const CHAVE_COR_RAQUETE = 'bricksCorRaquete';
const CHAVE_SKIN_RAQUETE = 'bricksSkinRaquete';

let skinIndice = 0;              // skin mostrada no menu (posição em listaSkins())
let skinDesejada = '';           // skin escolhida pelo streamer (pode ser do servidor e ainda não ter chegado)
let skinsServidor = [];          // skins do servidor liberadas para o canal conectado: { id, nome, servidor: true }
let canalSkins = '';             // canal a que essa lista pertence
let canalPedidoSkins = '';       // canal da última pergunta ao servidor (resposta de outro canal é ignorada)
let aparenciaLiberada = false;   // canal conectado (ou simulação): dá para escolher

function lerGuardado(chave) {
  try { return localStorage.getItem(chave) || ''; } catch (e) { return ''; }
}
function guardarValor(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) { /* navegador sem armazenamento: só não lembra */ }
}

// Todas as skins que aparecem no menu agora: as do jogo e as do servidor que já chegaram
function listaSkins() {
  return SKINS_RAQUETE.concat(skinsServidor.filter(s => imgs['skin_' + s.id]));
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

// Mostra a skin de número i no menu e passa a usar ela
function mostrarSkin(i, guardar) {
  const lista = listaSkins();
  skinIndice = ((i % lista.length) + lista.length) % lista.length;
  skinDesejada = lista[skinIndice].id;
  if (guardar) guardarValor(CHAVE_SKIN_RAQUETE, skinDesejada);
  atualizarAparencia();
}

// Escolhe pelo nome (link do OBS ou o que estava guardado). Se for do servidor e ainda não chegou,
// fica sem skin até a lista do canal chegar (e volta sozinha se o canal puder usar).
function escolherSkin(id, guardar) {
  skinDesejada = /^[a-z0-9_-]{0,40}$/.test(id || '') ? (id || '') : '';
  if (guardar) guardarValor(CHAVE_SKIN_RAQUETE, skinDesejada);
  aplicarSkinDesejada();
}

function aplicarSkinDesejada() {
  const i = listaSkins().findIndex(s => s.id === skinDesejada);
  skinIndice = i < 0 ? 0 : i;
  atualizarAparencia();
}

// ----- Skins do servidor -----

// Pergunta ao servidor quais skins o canal pode usar e baixa as imagens que faltam.
// Sem canal (modo simulação), pede só as grátis.
async function carregarSkinsServidor(canal) {
  canal = String(canal || '').toLowerCase();
  if (!FUNDADOR_SERVIDOR) return;
  const chave = canal || '_';  // "_" no endereço da imagem: sem canal (só grátis)
  canalPedidoSkins = chave;
  let lista;
  try {
    const resp = await fetch(FUNDADOR_SERVIDOR + '/skins' + (canal ? '/' + encodeURIComponent(canal) : ''));
    if (!resp.ok) return;
    lista = (await resp.json()).skins || [];
  } catch (e) {
    return; // servidor fora do ar: fica com as skins do jogo (e os desenhos de reserva do disco e da bengala)
  }
  if (chave !== canalPedidoSkins) return; // trocou de canal enquanto esperava
  canalSkins = chave;
  // o que saiu da lista (ex: deixou de ser fundador, período acabou) some do menu e da raquete
  const permitidas = new Set(lista.map(s => s.id));
  for (const s of skinsServidor) {
    if (!permitidas.has(s.id)) { delete imgs['skin_' + s.id]; delete imgs['arte_' + s.id]; }
  }
  skinsServidor = lista.map(s => ({ id: s.id, nome: s.nome, versao: s.versao, desenho: s.desenho || '', jogo: !!s.jogo, servidor: true }));
  aplicarSkinDesejada();
  for (const s of skinsServidor) {
    baixarImagemSkin(s, chave, 'skin_', '', () => aplicarSkinDesejada());
    if (s.jogo) baixarImagemSkin(s, chave, 'arte_', '/jogo', null); // imagem da partida (disco, bengala)
  }
}

function baixarImagemSkin(s, chave, prefixo, sufixo, pronto) {
  const atual = imgs[prefixo + s.id];
  if (atual && atual.dataset.versao === s.versao && atual.dataset.canal === chave) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.dataset.versao = s.versao;
  img.dataset.canal = chave;
  img.onload = () => {
    if (chave !== canalSkins || !skinsServidor.some(x => x.id === s.id)) return;
    imgs[prefixo + s.id] = img;
    if (pronto) pronto();
  };
  img.src = FUNDADOR_SERVIDOR + '/skin/' + encodeURIComponent(s.id) + '/' + encodeURIComponent(chave) + sufixo +
    '?v=' + encodeURIComponent(s.versao || '');
}

// Desenho próprio da skin em uso na partida ("disco", "bengala"); '' = a imagem da skin
function desenhoDaSkin() {
  const s = skinRaquete && skinsServidor.find(x => x.id === skinRaquete);
  return s ? s.desenho : '';
}

// Imagem da partida de uma skin do servidor (o disco da Fase 6, a bengala do Natal), ou null
function arteDaSkin(id) {
  return imgs['arte_' + id] || null;
}

// Outro canal (ou simulação): tira as skins do servidor do canal anterior
function limparSkinsServidor() {
  for (const s of skinsServidor) { delete imgs['skin_' + s.id]; delete imgs['arte_' + s.id]; }
  skinsServidor = [];
  canalSkins = '';
  canalPedidoSkins = '';
  aplicarSkinDesejada();
}

// Confere de novo com o servidor (começo de cada partida): se a skin não vale mais, volta para a cor
function revalidarSkinsServidor() {
  if (canalSkins) carregarSkinsServidor(canalSkins === '_' ? '' : canalSkins);
}

// Canal conectado (ou simulação): libera as escolhas. Ao trocar de canal, bloqueia até conectar.
function liberarAparencia(sim) {
  aparenciaLiberada = !!sim;
  atualizarAparencia();
}

// ----- Tela -----

function atualizarAparencia() {
  const lista = listaSkins();
  if (skinIndice >= lista.length) skinIndice = 0;
  const s = lista[skinIndice];
  skinRaquete = s.id;

  const caixa = document.getElementById('aparenciaRaquete');
  caixa.classList.toggle('bloqueada', !aparenciaLiberada);
  for (const el of caixa.querySelectorAll('button, input')) el.disabled = !aparenciaLiberada;
  if (aparenciaLiberada) document.getElementById('btCorPadrao').disabled = corRaquete === COR_RAQUETE_PADRAO;

  document.getElementById('skinNome').textContent = s.nome;
  document.getElementById('linhaCorRaquete').classList.toggle('escondido', !!skinRaquete);

  // prévia: a skin, ou a raquete pintada com a cor
  const cv = document.getElementById('skinPrevia');
  const cx = cv.getContext('2d');
  cx.clearRect(0, 0, cv.width, cv.height);
  const img = s.id ? imgs['skin_' + s.id] : raqueteColorida(corRaquete);
  if (img) cx.drawImage(img, 0, 0, cv.width, cv.height);
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
