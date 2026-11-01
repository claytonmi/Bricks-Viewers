// ===== Simulador (para testes) =====
// Modo simulação: o streamer digita um destes nomes no campo do canal (em vez de um canal da Twitch).
// Pode vir seguido do nome do streamer (ex: "simulador Hercules_SC"): os viewers falsos viram
// "Hercules_SC 1", "Hercules_SC 2"... Sem nome, ficam "Streamer 1", "Streamer 2"...
// Não conecta no chat, mostra o painel e cria viewers falsos com o mesmo processarComando.

const MODOS_SIMULACAO = ['simulador', 'simulacao', 'simulação', 'dev'];
let intervaloAuto = null;          // roda os comandos sozinho quando o automático está ligado
let contadorSimulado = 0;
let nomeSimulado = 'Streamer';     // base dos nomes dos viewers falsos

const COMANDOS_SIMULADOS = ['!azul', '!vermelho', '!amarelo', '!verde', '!branco', '!roxo',
                            '!laranja', '!rosa', '!ciano', '!speed', '!bomb'];

// Liga o modo simulação: fecha o chat (se estiver aberto), mostra o painel e libera o Iniciar
// (o painel fica no ranking lateral, que só aparece depois do Iniciar)
function ativarModoSimulacao(nome) {
  nomeSimulado = nome || 'Streamer';
  if (clienteTwitch) {
    clienteTwitch.close();
    clienteTwitch = null;
  }
  document.getElementById('simulador').classList.remove('escondido');
  document.getElementById('status').textContent =
    'Modo simulação ligado (sem chat da Twitch). Clique em Iniciar: o painel do simulador aparece ao lado do jogo.';
  document.getElementById('btIniciar').disabled = false;
}

// Desliga o modo simulação ao conectar num canal de verdade: esconde o painel e para o automático
function desativarModoSimulacao() {
  pararAutoSimulador();
  document.getElementById('simulador').classList.add('escondido');
}

// Cria viewers falsos com !entrar (só funciona no lobby, como no chat)
function simularEntradas(qtd) {
  // partida nova (ou depois do Limpar): a numeração volta para 1
  if (!viewers.some(v => v.simulado)) contadorSimulado = 0;
  for (let i = 0; i < qtd; i++) {
    const nome = `${nomeSimulado} ${contadorSimulado + 1}`;
    processarComando(nome, '!entrar');
    const novo = viewers.find(v => v.nome === nome);
    if (!novo) break; // lobby cheio (ou fora do lobby): não pula número
    novo.simulado = true; // marca para o botão Limpar tirar só os falsos
    contadorSimulado++;
  }
}

// Um viewer falso (escolhido ao acaso) manda um comando qualquer
function simularComandoAleatorio() {
  if (viewers.length === 0) return;
  const b = viewers[Math.floor(Math.random() * viewers.length)];
  const cmd = COMANDOS_SIMULADOS[Math.floor(Math.random() * COMANDOS_SIMULADOS.length)];
  processarComando(b.nome, cmd);
}

function ligarAutoSimulador() {
  if (intervaloAuto) return;
  intervaloAuto = setInterval(() => {
    // no lobby entram viewers; durante a partida, comandos
    if (estado === 'lobby' && Math.random() < 0.5) simularEntradas(1);
    else simularComandoAleatorio();
  }, 700);
  document.getElementById('btSimAuto').textContent = 'Automático: ligado';
}

function pararAutoSimulador() {
  clearInterval(intervaloAuto);
  intervaloAuto = null;
  document.getElementById('btSimAuto').textContent = 'Automático: desligado';
}

document.getElementById('btSimMais5').addEventListener('click', () => simularEntradas(5));
document.getElementById('btSimMais20').addEventListener('click', () => simularEntradas(20));
document.getElementById('btSimComando').addEventListener('click', simularComandoAleatorio);
document.getElementById('btSimAuto').addEventListener('click', () => {
  if (intervaloAuto) pararAutoSimulador();
  else ligarAutoSimulador();
});
document.getElementById('btSimLimpar').addEventListener('click', () => {
  if (estado !== 'lobby') return; // só limpa antes de começar
  viewers = viewers.filter(b => !b.simulado); // tira só os falsos
  atualizarContador();
});
