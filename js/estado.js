// ===== Estado do jogo =====
// Todas as variáveis que mudam durante a partida ficam aqui.

const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');

let estado = 'menu';          // 'menu' | 'lobby' | 'contagem' | 'jogando' | 'fim'
let viewers = [];             // cada viewer é uma bola
let tijolos = [];
let tijolosVivos = 0;
let chuvaRestante = 0;        // tijolos que ainda vão cair (fase com chuva)
let proximaGota = 0;          // quando cai o próximo tijolo da chuva
let chuvaItens = 0;           // quantos dos tijolos que faltam cair ainda vão soltar item
let chefaoCaiu = false;       // o tijolo chefão já caiu nesta partida (fase com chuva)
let copias = [];              // cópias das bolas do item multibola (pontos vão para o dono)
let anuncio = '';             // texto grande no meio da tela durante a partida ("Tijolo chefão!")
let anuncioAte = 0;
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
let itensCaindo = [];         // itens soltos pelos tijolos marcados, caindo até a raquete
let explosoes = [];           // explosões de !bomb e !gravity (só para desenhar)
let camposGrav = [];          // campos do !gravity ativos (puxando bolas até explodir)
let raiosChoque = [];         // raios do !shock entre a bola eletrizada e a atingida (só para desenhar)

const imgs = {};              // imagens carregadas
const cacheCor = new Map();   // bolas e tijolos já pintados com cada cor
let clienteTwitch = null;     // conexão com o chat da Twitch
let chatReconectando = false; // true quando o chat caiu e o jogo está reconectando (aviso na tela)
