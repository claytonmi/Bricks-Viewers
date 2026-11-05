// ===== Música e som =====

let somLigado = true;
let volumeMusica = 0.4;          // volume da música, de 0 a 1
let mostrarVolume = false;       // barra aparece quando o mouse está sobre o botão Som
let arrastandoVolume = false;    // true enquanto o streamer arrasta a bolinha
const musica = new Audio('assets/audio/musica.mp3');
musica.loop = true;
musica.volume = volumeMusica;

// Muda o volume (0 a 1) sem mexer no mudo
function definirVolume(v) {
  volumeMusica = Math.max(0, Math.min(1, v));
  musica.volume = volumeMusica;
}

// Onde começa e termina o trilho dentro da barra de volume (deixa espaço pro número)
function trilhoVolume() {
  return { x0: BARRA_VOL.x + 10, x1: BARRA_VOL.x + BARRA_VOL.w - 36 };
}

function tocarMusica() {
  if (somLigado) musica.play().catch(() => {});
}

function pararMusica() {
  musica.pause();
  musica.currentTime = 0;
}

// Liga ou desliga o som. A música só toca com uma partida em andamento (o ranking entre as fases também conta).
function definirSom(ligado) {
  somLigado = ligado;
  if (somLigado && (estado === 'lobby' || estado === 'contagem' || estado === 'jogando' || estado === 'pausa')) tocarMusica();
  else musica.pause();
}

// Botão "Som" no topo do jogo
function alternarSom() {
  definirSom(!somLigado);
}
