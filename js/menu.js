// ===== Menu do streamer =====
// Escolha de fase, quantidade de viewers, chat, informações e botões.

// Painel de comandos (lado esquerdo): o !entrar fica apagado quando não dá mais para entrar
function atualizarPainelComandos() {
  const fechado = estado === 'contagem' || estado === 'jogando' || estado === 'fim';
  document.getElementById('cmdEntrar').classList.toggle('fechado', fechado);
}

function mostrarFase() {
  const f = FASES[indiceFase];
  document.getElementById('faseNome').textContent = f.nome;
  document.getElementById('faseImg').src = f.fundo;
}

document.getElementById('faseAnt').onclick = () => {
  indiceFase = (indiceFase - 1 + FASES.length) % FASES.length;
  faseIndex = indiceFase;
  mostrarFase();
};
document.getElementById('faseProx').onclick = () => {
  indiceFase = (indiceFase + 1) % FASES.length;
  faseIndex = indiceFase;
  mostrarFase();
};
document.getElementById('qtd').oninput = e => {
  document.getElementById('qtdTexto').textContent = e.target.value;
};
document.getElementById('btIniciar').onclick = iniciarPartida;
document.getElementById('btVoltar').onclick = voltarMenu;
document.getElementById('btConectar').onclick = conectarChat;
document.getElementById('btInfo').onclick = () => document.getElementById('info').classList.remove('escondido');
document.getElementById('btFecharInfo').onclick = () => document.getElementById('info').classList.add('escondido');
