// ===== OBS =====
// Link para o OBS, cena entrando e saindo do ar e contagem para o intervalo novo.

// ----- Link para o OBS -----
// Abrindo com ?canal=NOME o jogo já conecta no chat. Com &modo=intervalo também começa sozinho,
// sem nenhum clique (para deixar numa cena de "já volto"). &fase=2 escolhe a fase inicial, &vagas=50 o limite
// &cor=ff8800 a cor da barra, &skin=lava a skin dela e &idioma=pt|en o idioma.
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
    contarEvento('abriu-no-obs'); // contador de acessos: só o evento, sem o canal
    ouvirCenaDoObs();
    ajustarEscala();
  }
  const cor = p.get('cor') || '';
  if (/^[0-9a-f]{6}$/i.test(cor)) escolherCorRaquete('#' + cor, false); // cor da barra escolhida no menu
  const idioma = p.get('idioma') || '';
  if (idiomaValido(idioma)) escolherIdioma(idioma, false); // o link manda no idioma, sem mudar o guardado
  const skin = p.get('skin') || '';
  if (/^[a-z0-9_-]{1,40}$/.test(skin)) escolherSkin(skin, false); // skin do servidor só aparece se o canal puder usar
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
  ultimoFrame = agoraJogo();
  if (estado === 'menu') {
    // saiu de cena antes de o chat conectar: se já conectou, começa agora; senão, começa ao conectar
    if (iniciarAoConectar && !document.getElementById('btIniciar').disabled) {
      iniciarAoConectar = false;
      iniciarPartida();
    }
  } else if (estado === 'fim') {
    // sem ninguém no ranking, não tem o que mostrar: já abre o jogo novo
    if (viewers.some(b => !b.streamer)) {
      reinicioEm = agoraJogo() + RANKING_ESPERA;
      atualizarDicaRanking(agoraJogo());
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
  if (reinicioEm) atualizarTexto(dica, 'obs.novoIntervalo', { s: Math.ceil((reinicioEm - agora) / 1000) });
  else atualizarTexto(dica, 'obs.jogarDeNovo');
}

// O link do OBS só serve para o modo intervalo, em que tudo funciona por comando no chat.
// Fora dele, o streamer precisa da raquete e do menu. Chamado pelo loop, 4 vezes por segundo.
function atualizarBotaoLink() {
  const conectado = !document.getElementById('btIniciar').disabled;
  const intervalo = document.getElementById('modoIntervalo').checked;
  document.getElementById('btLinkObs').disabled = !(conectado && intervalo);
  let dica = '';
  if (!conectado && !intervalo) dica = 'obs.dicaAmbos';
  else if (!conectado) dica = 'obs.dicaConectar';
  else if (!intervalo) dica = 'obs.dicaIntervalo';
  const el = document.getElementById('dicaLinkObs');
  if (dica) atualizarTexto(el, dica);
  else if (el.textContent) { delete el.dataset.t; el.textContent = ''; }
}

// Monta o link com o que está escolhido no menu e copia
document.getElementById('btLinkObs').onclick = () => {
  const status = document.getElementById('status');
  const canal = document.getElementById('canal').value.trim().toLowerCase()
    .split('?')[0].split('/').filter(Boolean).pop()?.replace(/^#+/, '') || '';
  if (!/^[a-z0-9_]{1,25}$/.test(canal)) {
    definirTexto(status, 'status.canalParaLink');
    return;
  }
  const link = `${location.origin}${location.pathname}?canal=${canal}` +
    `&modo=intervalo&fase=${indiceFase + 1}&vagas=${document.getElementById('qtd').value}` +
    (corRaquete !== COR_RAQUETE_PADRAO ? `&cor=${corRaquete.slice(1)}` : '') +
    (skinRaquete ? `&skin=${skinRaquete}` : '') +
    `&idioma=${idiomaAtual}`;
  contarEvento('copiou-link-obs'); // contador de acessos: só o evento, sem o canal
  copiarAntigo(link, () => {
    definirTexto(status, 'status.linkCopiado');
  });
};
