// ===== Idiomas: todos os textos do jogo em português e inglês =====
// Cada frase tem um nome (chave). O HTML usa data-t="chave" e o JS usa t('chave', { valor }).
// Frase sem tradução no idioma atual aparece em português; chave que não existe aparece como a própria chave.
// Para um idioma novo: incluir o id em IDIOMAS, uma tabela em TEXTOS e uma bandeira no menu.
// Comandos do chat (!entrar, !speed...) e nomes de viewers/canal nunca passam por aqui.

const IDIOMAS = ['pt', 'en'];
const CHAVE_IDIOMA = 'bricksIdioma';
const LANG_HTML = { pt: 'pt-BR', en: 'en' };

const TEXTOS = {
  pt: {},
  en: {},
};

let idiomaAtual = 'pt';
const aoTrocarIdiomaFns = [];

function idiomaValido(id) {
  return IDIOMAS.indexOf(id) !== -1;
}

// Idioma guardado no navegador; sem ele, o do navegador (português se começar com "pt", senão inglês)
function idiomaInicial() {
  let guardado = '';
  try { guardado = localStorage.getItem(CHAVE_IDIOMA) || ''; } catch (e) { /* sem armazenamento */ }
  if (idiomaValido(guardado)) return guardado;
  const lingua = (typeof navigator !== 'undefined' && navigator.language) || '';
  return /^pt/i.test(lingua) ? 'pt' : 'en';
}

function emLocalhost() {
  return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
}

// Frase pelo nome, no idioma atual; {nome} é trocado por valores.nome
function t(chave, valores) {
  let texto = TEXTOS[idiomaAtual][chave];
  if (texto === undefined) texto = TEXTOS.pt[chave];
  if (texto === undefined) {
    if (emLocalhost()) console.warn('Texto sem tradução: ' + chave);
    return chave;
  }
  if (valores) texto = texto.replace(/\{(\w+)\}/g, (m, nome) => (nome in valores ? valores[nome] : m));
  return texto;
}

// Escreve a frase no elemento e guarda a chave e os valores para refazer quando o idioma mudar.
// html = true só para frases nossas (negrito, links), nunca para texto vindo do chat.
function definirTexto(el, chave, valores, html) {
  el.dataset.t = chave;
  if (valores) el.dataset.tv = JSON.stringify(valores); else delete el.dataset.tv;
  if (html) el.dataset.tHtml = '1'; else delete el.dataset.tHtml;
  escreverTexto(el);
}

function escreverTexto(el) {
  let valores;
  try { valores = el.dataset.tv ? JSON.parse(el.dataset.tv) : undefined; } catch (e) { valores = undefined; }
  const texto = t(el.dataset.t, valores);
  if (el.dataset.tHtml) el.innerHTML = texto; else el.textContent = texto;
}

function aoTrocarIdioma(fn) {
  aoTrocarIdiomaFns.push(fn);
}

// Refaz tudo o que está marcado na página e avisa quem montou texto no JS
function aplicarIdioma() {
  document.documentElement.lang = LANG_HTML[idiomaAtual];
  document.querySelectorAll('[data-t]').forEach(escreverTexto);
  [['data-t-title', 'title'], ['data-t-placeholder', 'placeholder'], ['data-t-aria', 'aria-label']].forEach(([marca, atributo]) => {
    document.querySelectorAll('[' + marca + ']').forEach(el => el.setAttribute(atributo, t(el.getAttribute(marca))));
  });
  document.querySelectorAll('.bandeira[data-idioma]').forEach(el => {
    el.classList.toggle('ativa', el.dataset.idioma === idiomaAtual);
  });
  aoTrocarIdiomaFns.forEach(fn => {
    try { fn(); } catch (e) { console.error(e); } // um aviso com erro não impede os outros
  });
}

function escolherIdioma(id, guardar) {
  idiomaAtual = idiomaValido(id) ? id : 'pt';
  if (guardar) {
    try { localStorage.setItem(CHAVE_IDIOMA, idiomaAtual); } catch (e) { /* só não lembra */ }
  }
  aplicarIdioma();
}

// Chamada uma vez ao iniciar (main.js): liga as bandeiras e escreve tudo no idioma atual
function iniciarIdioma() {
  document.querySelectorAll('.bandeira[data-idioma]').forEach(el => {
    el.onclick = () => escolherIdioma(el.dataset.idioma, true);
  });
  aplicarIdioma();
}

// Nome da fase para mostrar; FASES[i].nome continua em português por dentro
function nomeFase(f) {
  return f.chave ? t('fase.' + f.chave) : f.nome;
}

// Nome da skin para mostrar; skin do servidor desconhecida mostra o nome que o servidor mandou
function nomeSkin(s) {
  if (s.id && (('skin.' + s.id) in TEXTOS.pt)) return t('skin.' + s.id);
  return s.nome;
}

idiomaAtual = idiomaInicial();
