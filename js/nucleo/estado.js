// ===== Estado do jogo =====
// Todas as variáveis que mudam durante a partida ficam aqui.

const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');

let estado = 'menu';          // 'menu' | 'lobby' | 'contagem' | 'jogando' | 'pausa' (intervalo) | 'fim'
let viewers = [];             // cada viewer é uma bola
let tijolos = [];
let tijolosVivos = 0;
let ultimoToqueTijolo = 0;    // última vez que alguma bola encostou num tijolo (fim de fase travado)
let chuvaRestante = 0;        // tijolos que ainda vão cair (chuva) ou entrar pela borda (esteira)
let esteiraDesloc = [];       // esteira: quanto cada linha já andou (para achar os lugares vazios)
let proximaGota = 0;          // quando cai o próximo tijolo da chuva
let chuvaItens = 0;           // quantos dos tijolos que faltam cair ainda vão soltar item
let chefaoCaiu = false;       // o tijolo chefão já caiu nesta partida (fase com chuva)
let espacoTotal = 0;          // fase 6: meteoros que a fase tem nesta partida (define as cores)
let espacoSeq = 0;            // fase 6: quantos meteoros já foram criados (ordem de chegada)
let buraco = null;            // fase 6: o buraco de minhoca atual (ver espaco.js)
let copias = [];            // cópias das bolas do item multibola (pontos vão para o dono)
let anuncio = '';             // texto grande no meio da tela durante a partida ("Tijolo chefão!")
let anuncioAte = 0;
let maxViewers = 5;
let modoIntervalo = false;    // modo intervalo: sem raquete, chão vira parede, fases em carrossel
let nomeStreamer = 'Streamer'; // nome da bola do streamer no modo intervalo (canal conectado)
let comecaEm = 0;             // intervalo: quando o lobby termina e a partida começa sozinha
let pausaAte = 0;             // intervalo: fim do ranking entre as fases
let ausentesFase = [];        // intervalo: quem ficou ausente na fase que acabou (perdeu os pontos dela)
let iniciarAoConectar = false; // link do OBS: começa a partida sozinha assim que o chat conectar
let modoAutomatico = false;   // aberto pelo link do intervalo: ninguém clica na tela, tudo é por comando no chat
let escalaTela = 1;           // quanto a tela inteira está aumentada ou diminuída (ver ajustarEscala)
// Relógio do jogo: igual ao do navegador, mas para enquanto o jogo está pausado (Esc no navegador).
// Assim os poderes, os efeitos e os avisos não andam durante a pausa.
let pausadoJogo = false;      // o jogo está pausado (menu de pausa aberto)
let pausadoEm = 0;            // momento em que a pausa começou (relógio do navegador)
let descontoPausa = 0;        // tempo total já pausado, em ms
function agoraJogo() {
  return (pausadoJogo ? pausadoEm : performance.now()) - descontoPausa;
}
let fonteAtiva = true;       // link do OBS: a cena do jogo está no ar? (fora do ar, o jogo fica parado)
let reinicioEm = 0;           // link do OBS: quando o jogo novo começa, depois do ranking (0 = sem contagem)
let mesSimulado = 0;         // simulador: mês para as fases de evento (0 = todas liberadas)
let inicioFase = 0;          // intervalo: quando a fase atual começou
let faseIndex = 0;            // fase que está sendo jogada
let indiceFase = 0;           // fase escolhida no menu (setas < e >)
let streamerPts = 0;
let streamerPontua = false;   // o streamer escolhe se pontua e aparece no ranking
let itensPontosRestantes = 0; // itens de pontos que ainda podem cair nesta partida (ver ITENS_PONTOS_PARTIDA)
let rebatidasStreamer = 0;    // rebatidas da raquete desde o último ponto do streamer (ver REBATIDAS_POR_PONTO)
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
