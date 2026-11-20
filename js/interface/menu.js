// ===== Menu do streamer =====
// Escolha de fase, quantidade de viewers, painel de comandos, informações e botões.

// Painel de comandos (lado esquerdo): o !entrar fica apagado quando não dá mais para entrar
function atualizarPainelComandos() {
  // modo intervalo: dá para entrar a qualquer momento
  const fechado = !modoIntervalo && (estado === 'contagem' || estado === 'jogando' || estado === 'fim');
  document.getElementById('cmdEntrar').classList.toggle('fechado', fechado);
  const obsEntrar = document.getElementById('obsEntrar');
  if (modoIntervalo) atualizarTexto(obsEntrar, 'cmd.obsEntrarIntervalo', { max: maxViewers });
  else atualizarTexto(obsEntrar, 'cmd.obsEntrarAntes');
  // regra do ausente: só vale no modo intervalo
  document.getElementById('cmdAusente').classList.toggle('escondido', !modoIntervalo);

  // números dos poderes: mudam sozinhos quando o número de viewers cruza o limite (ver batidasPara)
  atualizarTexto(document.getElementById('obsSpeed'), 'cmd.obsSpeed', { n: batidasPara(CARGA_SPEED) });
  atualizarTexto(document.getElementById('obsBomb'), 'cmd.obsBomb', { n: batidasPara(BOMBA_CADA), max: BOMBA_MAX });
  atualizarTexto(document.getElementById('obsGrav'), 'cmd.obsGrav', { n: batidasPara(GRAV_CADA) });
  atualizarTexto(document.getElementById('obsShock'), 'cmd.obsShock', { n: batidasPara(CHOQUE_CADA) });
}

// Fase de evento fora do mês dela (ex: Natal fora de dezembro) fica escondida: não aparece no menu,
// nem nas informações, nem no carrossel do modo intervalo. É surpresa para o chat.
function mostrarFase() {
  if (!faseLiberada(indiceFase)) { // ex: estava no simulador numa fase de evento e saiu dele
    indiceFase = 0;
    faseIndex = 0;
  }
  const f = FASES[indiceFase];
  document.getElementById('faseNome').textContent = nomeFase(f);
  document.getElementById('faseImg').src = f.fundo;
  // textos da tela de informações que só aparecem quando a fase de evento está liberada
  document.querySelectorAll('[data-evento]').forEach(el => {
    const i = FASES.findIndex(x => x.nome === el.dataset.evento);
    el.classList.toggle('escondido', i < 0 || !faseLiberada(i));
  });
}

aoTrocarIdioma(mostrarFase); // o nome da fase troca junto com o idioma

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
  // no modo intervalo não tem raquete: a cor vai para a barra de baixo, onde as bolas quicam
  definirTexto(document.getElementById('corRaqueteRotulo'), e.target.checked ? 'menu.corBarra' : 'menu.corRaquete');
  definirTexto(document.getElementById('skinRotulo'), e.target.checked ? 'menu.skinBarra' : 'menu.skinRaquete');
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
