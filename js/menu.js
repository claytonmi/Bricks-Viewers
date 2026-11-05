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
// Modo intervalo: o streamer não pontua (a opção fica apagada). As vagas já vêm em 75, porque ele estará
// fora e pode esquecer de ajustar; ainda dá para mudar antes de copiar o link. Desmarcando, volta o número que estava.
let qtdAntesDoIntervalo = 5;
document.getElementById('modoIntervalo').onchange = e => {
  const pontua = document.getElementById('pontuaStreamer');
  pontua.disabled = e.target.checked;
  if (e.target.checked) pontua.checked = false;
  const qtd = document.getElementById('qtd');
  if (e.target.checked) {
    qtdAntesDoIntervalo = qtd.value;
    qtd.value = VAGAS_INTERVALO;
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
    modoAutomatico = true;
    ouvirCenaDoObs();
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

// ----- Cena do jogo no OBS -----
// A página fica sempre carregada e o jogo só vive na memória dela: fechar o OBS apaga tudo, e a próxima
// live começa do zero. O streamer usa isto com "Desligar fonte" e "Atualizar navegador" desligados.
//   Sai de cena  -> o jogo para e o ranking fica pronto (sem calcular nem desenhar nada)
//   Volta à cena -> mostra o ranking, conta 30 s e começa um intervalo novo
//   Sai de novo  -> cancela a contagem; ao voltar, conta 30 s de novo
function ouvirCenaDoObs() {
  // o OBS avisa pelo evento e pela função antiga; o aviso repetido é ignorado
  window.addEventListener('obsSourceActiveChanged', e => {
    if (e.detail && typeof e.detail.active === 'boolean') cenaMudou(e.detail.active);
  });
  if (window.obsstudio) window.obsstudio.onActiveChange = ativa => cenaMudou(!!ativa);
}

let cenaJaAvisada = false; // o OBS já avisou alguma vez sobre a cena?

function cenaMudou(ativa) {
  if (!modoAutomatico) return;
  // O OBS não diz como a cena estava quando a página abriu, então o jogo começa como se estivesse no ar.
  // Se o primeiro aviso é "entrou no ar", ela estava fora desde o início: o jogo rodou escondido e recomeça do zero.
  if (!cenaJaAvisada) {
    cenaJaAvisada = true;
    if (ativa && estado !== 'menu') {
      iniciarPartida();
      return;
    }
  }
  if (ativa === fonteAtiva) return;
  fonteAtiva = ativa;
  if (!ativa) {
    reinicioEm = 0;
    if (estado === 'lobby' || estado === 'contagem' || estado === 'jogando' || estado === 'pausa') finalizar();
    pararMusica();
    return;
  }
  ultimoFrame = performance.now();
  if (estado === 'menu') {
    // saiu de cena antes de o chat conectar: se já conectou, começa agora; senão, começa ao conectar
    if (iniciarAoConectar && !document.getElementById('btIniciar').disabled) {
      iniciarAoConectar = false;
      iniciarPartida();
    }
  } else if (estado === 'fim') {
    // sem ninguém no ranking, não tem o que mostrar: já abre o jogo novo
    if (viewers.some(b => !b.streamer)) {
      reinicioEm = performance.now() + RANKING_ESPERA;
      atualizarDicaRanking(performance.now());
    } else {
      iniciarPartida();
    }
  }
}

// Depois do ranking: conta até o jogo novo
function atualizarReinicio(agora) {
  if (!reinicioEm) return;
  if (agora >= reinicioEm) iniciarPartida();
  else atualizarDicaRanking(agora);
}

function atualizarDicaRanking(agora) {
  const dica = document.getElementById('rankingDica');
  const texto = reinicioEm
    ? `Novo intervalo em ${Math.ceil((reinicioEm - agora) / 1000)} s. Para começar já, o streamer ou um moderador digita !recomecar.`
    : 'Para jogar de novo, o streamer ou um moderador digita !recomecar no chat.';
  if (dica.textContent !== texto) dica.textContent = texto;
}

// O link do OBS só serve para o modo intervalo, em que tudo funciona por comando no chat.
// Fora dele, o streamer precisa da raquete e do menu. Chamado pelo loop, 4 vezes por segundo.
function atualizarBotaoLink() {
  const conectado = !document.getElementById('btIniciar').disabled;
  const intervalo = document.getElementById('modoIntervalo').checked;
  document.getElementById('btLinkObs').disabled = !(conectado && intervalo);
  let dica = '';
  if (!conectado && !intervalo) dica = 'Para gerar o link do OBS, conecte o canal e marque o Modo intervalo.';
  else if (!conectado) dica = 'Para gerar o link do OBS, conecte o canal.';
  else if (!intervalo) dica = 'Para gerar o link do OBS, marque o Modo intervalo.';
  const el = document.getElementById('dicaLinkObs');
  if (el.textContent !== dica) el.textContent = dica;
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
  const link = `${location.origin}${location.pathname}?canal=${canal}` +
    `&modo=intervalo&fase=${indiceFase + 1}&vagas=${document.getElementById('qtd').value}`;
  copiarAntigo(link, () => {
    status.textContent = 'Link copiado! No OBS: fonte Navegador, cole o link, Largura 1920 e Altura 1080.';
  });
};

// Abas da tela de informações
function mostrarAba(id) {
  document.querySelectorAll('.aba').forEach(bt => {
    const ativa = bt.dataset.aba === id;
    bt.classList.toggle('ativa', ativa);
    document.getElementById(bt.dataset.aba).classList.toggle('escondido', !ativa);
  });
  document.getElementById('info').scrollTop = 0;
}
document.querySelectorAll('.aba').forEach(bt => {
  bt.onclick = () => mostrarAba(bt.dataset.aba);
});

document.getElementById('btInfo').onclick = () => document.getElementById('info').classList.remove('escondido');
document.getElementById('btFecharInfo').onclick = () => document.getElementById('info').classList.add('escondido');
