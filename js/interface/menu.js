// ===== Menu do streamer =====
// Escolha de fase, quantidade de viewers, painel de comandos, informações e botões.

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
