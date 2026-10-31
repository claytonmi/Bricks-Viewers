// ===== Simulador (para testes) =====
// Modo simulação: o streamer digita um destes nomes no campo do canal (em vez de um canal da Twitch).
// Não conecta no chat, mostra o painel e cria viewers falsos com o mesmo processarComando.

const MODOS_SIMULACAO = ['simulador', 'simulacao', 'simulação', 'dev'];
let intervaloAuto = null;          // roda os comandos sozinho quando o automático está ligado
let contadorSimulado = 0;

const NOMES_SIMULADOS = ['Ana', 'Bruno', 'Carla', 'Davi', 'Eva', 'Fábio', 'Gabi', 'Hugo', 'Iara', 'João',
                         'Kaio', 'Lara', 'Mário', 'Nina', 'Otávio', 'Paula', 'Rafael', 'Sofia', 'Tiago', 'Vera'];
const COMANDOS_SIMULADOS = ['!azul', '!vermelho', '!amarelo', '!verde', '!branco', '!roxo',
                            '!laranja', '!rosa', '!ciano', '!speed', '!bomb'];

// Liga o modo simulação: fecha o chat (se estiver aberto), mostra o painel e libera o Iniciar
function ativarModoSimulacao() {
  if (clienteTwitch) {
    clienteTwitch.close();
    clienteTwitch = null;
  }
  document.getElementById('simulador').classList.remove('escondido');
  document.getElementById('status').textContent = 'Modo simulação ligado (sem chat da Twitch). Pode clicar em Iniciar.';
  document.getElementById('btIniciar').disabled = false;
}

// Cria viewers falsos com !entrar (só funciona no lobby, como no chat)
function simularEntradas(qtd) {
  for (let i = 0; i < qtd; i++) {
    contadorSimulado++;
    const base = NOMES_SIMULADOS[Math.floor(Math.random() * NOMES_SIMULADOS.length)];
    const nome = `${base} ${contadorSimulado}`;
    processarComando(nome, '!entrar');
    const novo = viewers.find(v => v.nome === nome);
    if (novo) novo.simulado = true; // marca para o botão Limpar tirar só os falsos
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
