// ===== Estado do jogo =====
// Todas as variáveis que mudam durante a partida ficam aqui.

const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');

let estado = 'menu';          // 'menu' | 'lobby' | 'contagem' | 'jogando' | 'fim'
let viewers = [];             // cada viewer é uma bola
let tijolos = [];
let tijolosVivos = 0;
let maxViewers = 5;
let faseIndex = 0;            // fase que está sendo jogada
let indiceFase = 0;           // fase escolhida no menu (setas < e >)
let streamerPts = 0;
let streamerPontua = false;   // o streamer escolhe se pontua e aparece no ranking
let ultimoCheckT = 0;         // última vez que o streamer foi checado
let paddleBrilhoAte = 0;      // brilho da raquete quando o streamer ganha ponto
let paddleX = W / 2;
let teclas = { esq: false, dir: false };
let contagemFila = [];
let contagemIdx = 0;
let contagemFim = 0;
let contagemTexto = '';
let aviso = '';
let avisoAte = 0;
let paredesAtuais = [];

const imgs = {};              // imagens carregadas
const cacheCor = new Map();   // bolas e tijolos já pintados com cada cor
let clienteTwitch = null;     // conexão com o chat da Twitch
