// ===== Idiomas: todos os textos do jogo em português e inglês =====
// Cada frase tem um nome (chave). O HTML usa data-t="chave" e o JS usa t('chave', { valor }).
// Frase sem tradução no idioma atual aparece em português; chave que não existe aparece como a própria chave.
// Para um idioma novo: incluir o id em IDIOMAS, uma tabela em TEXTOS e uma bandeira no menu.
// Comandos do chat (!entrar, !speed...) e nomes de viewers/canal nunca passam por aqui.

const IDIOMAS = ['pt', 'en'];
const CHAVE_IDIOMA = 'bricksIdioma';
const LANG_HTML = { pt: 'pt-BR', en: 'en' };

const TEXTOS = {
  pt: {
    'menu.chat': 'Chat da Twitch',
    'menu.canalPlaceholder': 'nome do canal (ex: hercules_sc)',
    'menu.conectar': 'Conectar',
    'status.inicial': 'Não conectado. Conecte o canal para liberar o Iniciar.',
    'status.digiteCanal': 'Digite o nome do canal (ex: hercules_sc).',
    'status.conectando': 'Conectando no chat de {canal}...',
    'status.conectado': 'Conectado no chat de {canal}. Pode digitar !entrar.',
    'status.falhaLogin': 'Não consegui entrar no chat. Tente de novo.',
    'status.erroConexao': 'Erro de conexão com a Twitch. Tentando de novo...',
    'status.reconectando': 'Chat desconectado. Reconectando em {s} s...',
    'status.canalParaLink': 'Digite o nome do canal para gerar o link do OBS.',
    'status.linkCopiado': 'Link copiado! No OBS: fonte Navegador, cole o link e use o tamanho da sua live (1280x720 ou 1920x1080).',
    'obs.dicaAmbos': 'Para gerar o link do OBS, conecte o canal e marque o Modo intervalo.',
    'obs.dicaConectar': 'Para gerar o link do OBS, conecte o canal.',
    'obs.dicaIntervalo': 'Para gerar o link do OBS, marque o Modo intervalo.',
    'obs.novoIntervalo': 'Novo intervalo em {s} s. Para começar já, o streamer ou um moderador digita !recomecar.',
    'obs.jogarDeNovo': 'Para jogar de novo, o streamer ou um moderador digita !recomecar no chat.',
    'menu.faseAnt': 'Fase anterior',
    'menu.faseProx': 'Próxima fase',
    'menu.faseMiniatura': 'Miniatura da fase',
    'menu.qtdViewers': 'Quantidade de viewers',
    'menu.pontua': 'Streamer pontua no ranking',
    'menu.intervalo': 'Modo intervalo (só o chat joga)',
    'menu.intervaloDica': 'Sem raquete: só o chat joga, as fases seguem em carrossel a partir da escolhida até você clicar em Voltei',
    'menu.skinRaquete': 'Skin da raquete',
    'menu.skinBarra': 'Skin da barra',
    'menu.skinDica': 'No modo intervalo, a skin vai para a barra de baixo, onde as bolas quicam',
    'menu.skinAnt': 'Skin anterior',
    'menu.skinProx': 'Próxima skin',
    'menu.corRaquete': 'Cor da raquete',
    'menu.corBarra': 'Cor da barra',
    'menu.corDica': 'No modo intervalo, a cor vai para a barra de baixo, onde as bolas quicam',
    'menu.corEscolher': 'Escolher a cor da raquete',
    'menu.padrao': 'Padrão',
    'menu.aparenciaAviso': 'Conecte o canal para escolher a raquete.',
    'menu.iniciar': 'Iniciar',
    'menu.info': 'Informações',
    'menu.linkObs': 'Copiar link para o OBS',
    'menu.linkObsDica': 'Copia um link para deixar o modo intervalo numa cena do OBS: o jogo conecta e começa sozinho.',
    'menu.feedback': 'Enviar feedback ou bug',
    'cmd.obsEntrarIntervalo': '(a qualquer momento, até {max} jogadores)',
    'cmd.obsEntrarAntes': '(antes de começar)',
    'cmd.obsSpeed': '(a cada {n} batidas em tijolos)',
    'cmd.obsBomb': '(1 bomba a cada {n} batidas, até {max})',
    'cmd.obsGrav': '(a cada {n} batidas, só 1)',
    'cmd.obsShock': '(a cada {n} batidas, só 1)',
    'fase.f1': 'Fase 1',
    'fase.f2': 'Fase 2',
    'fase.f3': 'Fase 3',
    'fase.f4': 'Fase 4',
    'fase.f5': 'Fase 5',
    'fase.f6': 'Fase 6: Espaço',
    'fase.natal': 'Fase Natalina',
    'fase.anoNovo': 'Fase Ano Novo Chinês',
    'skin.nenhuma': 'Sem skin (cor)',
    'skin.real': 'Real',
    'skin.lava': 'Lava',
    'skin.pixel': 'Pixel',
    'skin.neon': 'Neon',
    'skin.gelo': 'Gelo',
    'skin.madeira': 'Madeira',
    'skin.aco': 'Aço',
    'skin.toxica': 'Tóxica',
    'skin.oceano': 'Oceano',
    'skin.ametista': 'Ametista',
    'skin.sakura': 'Sakura',
    'skin.ouro': 'Ouro',
    'skin.camuflada': 'Camuflada',
    'skin.fundador': 'Fundador',
    'skin.eletrica': 'Elétrica',
    'skin.esmeralda': 'Esmeralda',
    'skin.galaxia': 'Galáxia',
    'skin.synthwave': 'Synthwave',
    'skin.disco': 'Disco Voador',
    'skin.bengala': 'Bengala Doce',
  },
  en: {
    'menu.chat': 'Twitch chat',
    'menu.canalPlaceholder': 'channel name (e.g. hercules_sc)',
    'menu.conectar': 'Connect',
    'status.inicial': 'Not connected. Connect your channel to unlock Start.',
    'status.digiteCanal': 'Enter the channel name (e.g. hercules_sc).',
    'status.conectando': 'Connecting to the chat of {canal}...',
    'status.conectado': 'Connected to the chat of {canal}. You can type !entrar.',
    'status.falhaLogin': 'Could not join the chat. Try again.',
    'status.erroConexao': 'Connection error with Twitch. Trying again...',
    'status.reconectando': 'Chat disconnected. Reconnecting in {s} s...',
    'status.canalParaLink': 'Enter the channel name to generate the OBS link.',
    'status.linkCopiado': 'Link copied! In OBS: add a Browser source, paste the link and use your stream size (1280x720 or 1920x1080).',
    'obs.dicaAmbos': 'To generate the OBS link, connect your channel and turn on Break mode.',
    'obs.dicaConectar': 'To generate the OBS link, connect your channel.',
    'obs.dicaIntervalo': 'To generate the OBS link, turn on Break mode.',
    'obs.novoIntervalo': 'New break in {s} s. To start now, the streamer or a mod types !recomecar.',
    'obs.jogarDeNovo': 'To play again, the streamer or a mod types !recomecar in the chat.',
    'menu.faseAnt': 'Previous stage',
    'menu.faseProx': 'Next stage',
    'menu.faseMiniatura': 'Stage thumbnail',
    'menu.qtdViewers': 'Number of viewers',
    'menu.pontua': 'Streamer scores on the ranking',
    'menu.intervalo': 'Break mode (only chat plays)',
    'menu.intervaloDica': 'No paddle: only the chat plays, and the stages cycle from the chosen one until you click I\'m back',
    'menu.skinRaquete': 'Paddle skin',
    'menu.skinBarra': 'Bar skin',
    'menu.skinDica': 'In Break mode, the skin goes on the bottom bar, where the balls bounce',
    'menu.skinAnt': 'Previous skin',
    'menu.skinProx': 'Next skin',
    'menu.corRaquete': 'Paddle color',
    'menu.corBarra': 'Bar color',
    'menu.corDica': 'In Break mode, the color goes on the bottom bar, where the balls bounce',
    'menu.corEscolher': 'Choose the paddle color',
    'menu.padrao': 'Default',
    'menu.aparenciaAviso': 'Connect your channel to choose the paddle.',
    'menu.iniciar': 'Start',
    'menu.info': 'Info',
    'menu.linkObs': 'Copy OBS link',
    'menu.linkObsDica': 'Copies a link to run Break mode in an OBS scene: the game connects and starts by itself.',
    'menu.feedback': 'Send feedback or bug',
    'cmd.obsEntrarIntervalo': '(any time, up to {max} players)',
    'cmd.obsEntrarAntes': '(before it starts)',
    'cmd.obsSpeed': '(every {n} brick hits)',
    'cmd.obsBomb': '(1 bomb every {n} hits, up to {max})',
    'cmd.obsGrav': '(every {n} hits, only 1)',
    'cmd.obsShock': '(every {n} hits, only 1)',
    'fase.f1': 'Stage 1',
    'fase.f2': 'Stage 2',
    'fase.f3': 'Stage 3',
    'fase.f4': 'Stage 4',
    'fase.f5': 'Stage 5',
    'fase.f6': 'Stage 6: Space',
    'fase.natal': 'Christmas Stage',
    'fase.anoNovo': 'Chinese New Year Stage',
    'skin.nenhuma': 'No skin (color)',
    'skin.real': 'Royal',
    'skin.lava': 'Lava',
    'skin.pixel': 'Pixel',
    'skin.neon': 'Neon',
    'skin.gelo': 'Ice',
    'skin.madeira': 'Wood',
    'skin.aco': 'Steel',
    'skin.toxica': 'Toxic',
    'skin.oceano': 'Ocean',
    'skin.ametista': 'Amethyst',
    'skin.sakura': 'Sakura',
    'skin.ouro': 'Gold',
    'skin.camuflada': 'Camo',
    'skin.fundador': 'Founder',
    'skin.eletrica': 'Electric',
    'skin.esmeralda': 'Emerald',
    'skin.galaxia': 'Galaxy',
    'skin.synthwave': 'Synthwave',
    'skin.disco': 'Flying Saucer',
    'skin.bengala': 'Candy Cane',
  },
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

// Como definirTexto, mas só mexe na tela se o texto mudou (para quem atualiza várias vezes por segundo)
function atualizarTexto(el, chave, valores) {
  if (el.dataset.t === chave && el.textContent === t(chave, valores)) return;
  definirTexto(el, chave, valores);
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
  const chave = 'skin.' + (s.id || 'nenhuma'); // sem skin (cor) é a chave skin.nenhuma
  if (chave in TEXTOS.pt) return t(chave);
  return s.nome;
}

idiomaAtual = idiomaInicial();
