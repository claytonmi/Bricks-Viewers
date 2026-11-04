// ===== Menu do streamer =====
// Escolha de fase, quantidade de viewers, chat, informações e botões.

// Painel de comandos (lado esquerdo): o !entrar fica apagado quando não dá mais para entrar
function atualizarPainelComandos() {
  // modo intervalo: dá para entrar a qualquer momento
  const fechado = !modoIntervalo && (estado === 'contagem' || estado === 'jogando' || estado === 'fim');
  document.getElementById('cmdEntrar').classList.toggle('fechado', fechado);
  document.getElementById('obsEntrar').textContent =
    modoIntervalo ? `(a qualquer momento, até ${maxViewers} jogadores)` : '(antes de começar)';
  // regra do ausente: só vale no modo intervalo
  document.getElementById('cmdAusente').classList.toggle('escondido', !modoIntervalo);

  // números dos poderes: mudam sozinhos quando o número de viewers cruza o limite (ver batidasPara)
  document.getElementById('obsSpeed').textContent = `(a cada ${batidasPara(CARGA_SPEED)} batidas em tijolos)`;
  document.getElementById('obsBomb').textContent = `(1 bomba a cada ${batidasPara(BOMBA_CADA)} batidas, até ${BOMBA_MAX})`;
  document.getElementById('obsGrav').textContent = `(a cada ${batidasPara(GRAV_CADA)} batidas, só 1)`;
  document.getElementById('obsShock').textContent = `(a cada ${batidasPara(CHOQUE_CADA)} batidas, só 1)`;
}

// Fase de evento fora do mês dela (ex: Natal fora de dezembro) fica escondida: não aparece no menu,
// nem nas informações, nem no carrossel do modo intervalo. É surpresa para o chat.
function mostrarFase() {
  if (!faseLiberada(indiceFase)) { // ex: estava no simulador numa fase de evento e saiu dele
    indiceFase = 0;
    faseIndex = 0;
  }
  const f = FASES[indiceFase];
  document.getElementById('faseNome').textContent = f.nome;
  document.getElementById('faseImg').src = f.fundo;
  // textos da tela de informações que só aparecem quando a fase de evento está liberada
  document.querySelectorAll('[data-evento]').forEach(el => {
    const i = FASES.findIndex(x => x.nome === el.dataset.evento);
    el.classList.toggle('escondido', i < 0 || !faseLiberada(i));
  });
}

// Setas do menu: andam só pelas fases liberadas
function trocarFase(passo) {
  for (let k = 0; k < FASES.length; k++) {
    indiceFase = (indiceFase + passo + FASES.length) % FASES.length;
    if (faseLiberada(indiceFase)) break;
  }
  faseIndex = indiceFase;
  mostrarFase();
}

document.getElementById('faseAnt').onclick = () => trocarFase(-1);
document.getElementById('faseProx').onclick = () => trocarFase(1);
document.getElementById('qtd').oninput = e => {
  document.getElementById('qtdTexto').textContent = e.target.value;
};
document.getElementById('btIniciar').onclick = iniciarPartida;
document.getElementById('btVoltar').onclick = voltarMenu;
document.getElementById('btConectar').onclick = conectarChat;
document.getElementById('btVoltei').onclick = pararIntervalo;
// Modo intervalo: o streamer não pontua (a opção fica apagada). As vagas sobem para o máximo, porque o
// streamer estará fora para aumentar; ele ainda pode baixar. Desmarcando, volta o número que estava.
let qtdAntesDoIntervalo = 5;
document.getElementById('modoIntervalo').onchange = e => {
  const pontua = document.getElementById('pontuaStreamer');
  pontua.disabled = e.target.checked;
  if (e.target.checked) pontua.checked = false;
  const qtd = document.getElementById('qtd');
  if (e.target.checked) {
    qtdAntesDoIntervalo = qtd.value;
    qtd.value = qtd.max;
  } else {
    qtd.value = qtdAntesDoIntervalo;
  }
  document.getElementById('qtdTexto').textContent = qtd.value;
};
// ----- Link para o OBS -----
// Abrindo com ?canal=NOME o jogo já conecta no chat. Com &modo=intervalo também começa sozinho,
// sem nenhum clique (para deixar numa cena de "já volto"). &fase=2 escolhe a fase inicial e &vagas=50 o limite.
function inicioPeloLink() {
  const p = new URLSearchParams(location.search);
  const canal = (p.get('canal') || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{1,25}$/.test(canal)) return; // o link pode vir de qualquer lugar: só nome de canal válido
  document.getElementById('canal').value = canal;
  if (p.get('modo') === 'intervalo') {
    const caixa = document.getElementById('modoIntervalo');
    caixa.checked = true;
    caixa.onchange({ target: caixa });
    iniciarAoConectar = true;
  }
  const vagas = Number(p.get('vagas'));
  if (Number.isInteger(vagas) && vagas >= 1 && vagas <= MAX_VIEWERS) {
    document.getElementById('qtd').value = vagas;
    document.getElementById('qtdTexto').textContent = vagas;
  }
  conectarChat();
  // só depois de conectar: o simulador libera as fases de evento
  const fase = Number(p.get('fase')) - 1;
  if (Number.isInteger(fase) && FASES[fase] && faseLiberada(fase)) {
    indiceFase = fase;
    faseIndex = fase;
    mostrarFase();
  }
  // simulador não espera a conexão com a Twitch
  if (iniciarAoConectar && !document.getElementById('btIniciar').disabled) {
    iniciarAoConectar = false;
    iniciarPartida();
  }
}

// Monta o link com o que está escolhido no menu e copia
document.getElementById('btLinkObs').onclick = () => {
  const status = document.getElementById('status');
  const canal = document.getElementById('canal').value.trim().toLowerCase()
    .split('?')[0].split('/').filter(Boolean).pop()?.replace(/^#+/, '') || '';
  if (!/^[a-z0-9_]{1,25}$/.test(canal)) {
    status.textContent = 'Digite o nome do canal para gerar o link do OBS.';
    return;
  }
  let link = `${location.origin}${location.pathname}?canal=${canal}`;
  if (document.getElementById('modoIntervalo').checked) {
    link += `&modo=intervalo&fase=${indiceFase + 1}&vagas=${document.getElementById('qtd').value}`;
  }
  copiarAntigo(link, () => {
    status.textContent = 'Link copiado! No OBS: fonte Navegador, cole o link, Largura 1920 e Altura 1080.';
  });
};

document.getElementById('btInfo').onclick = () => document.getElementById('info').classList.remove('escondido');
document.getElementById('btFecharInfo').onclick = () => document.getElementById('info').classList.add('escondido');
