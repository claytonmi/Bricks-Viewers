// ===== Fases =====
// Para criar uma fase nova, copie um bloco abaixo e ajuste.
//
// padrao:  números = batidas que o tijolo aguenta (1, 2 ou 3). "." = vazio.
// paredes: retângulos (x, y, w, h) ou segmentos inclinados (x1, y1, x2, y2, espessura).
//          Colidem com a bola, não quebram e não dão ponto.
// fundo:   imagem de fundo da fase (também aparece na miniatura do menu).
// cores:   cores dos tijolos, em ciclo por linha. null = tijolos cinza.
// chuva:   (opcional) os tijolos caem do céu em vez de começarem prontos. total = quantos caem
//          na partida; eles se empilham nas 16 colunas, até 6 de altura. A vida de cada tijolo
//          é sorteada entre os números do padrao.
// esteira: (opcional) as linhas de tijolos andam para os lados, cada uma num sentido; o tijolo
//          que sai por uma borda volta pela outra. vel = velocidade base (px por segundo).
//          Use sem paredes (os tijolos passariam por dentro delas). total = quantos tijolos a fase tem
//          com 100 jogadores (com até 15, são 100): começa com os do padrao e, durante a partida,
//          os que faltam vão entrando pela borda nos buracos das esteiras.
// mes:     (opcional) fase de evento: só fica liberada nesse mês (ex: 12 = dezembro).
// natal:   (opcional) tijolos viram presentes (cores sorteadas), neve caindo, chefão saco do Papai
//          Noel no fim e uma rena que passa voando de vez em quando (ver natal.js).
// chefaoIntervalo: (opcional, só no modo intervalo) quando todos os tijolos quebram, cai um chefão
//          com 30 de vida no centro da parede indicada (parede = posição na lista de paredes).

// Padrão de tijolos usado pelas fases 2 em diante
const PADRAO_TIJOLOS = [
  '1111111111111111',
  '2222222222222222',
  '2.2.2.2.2.2.2.2.',
  '3333333333333333',
  '3.3.3.3.3.3.3.3.',
  '1111111111111111'
];

const FASES = [
  {
    nome: 'Fase 1',
    fundo: 'assets/Fase1.png',
    cores: null,
    paredes: [],
    padrao: PADRAO_TIJOLOS,
    chuva: { total: 250 }
  },
  {
    nome: 'Fase 2',
    fundo: 'assets/Fase2.png',
    cores: ['#facc15', '#ef4444', '#3b82f6'], // amarelo, vermelho, azul
    paredes: [
      { x: 110, y: 224, w: 171, h: 8 },
      { x: 386, y: 152, w: 8, h: 196 },
      { x: 495, y: 245, w: 177, h: 8 },
      { x: 769, y: 146, w: 8, h: 200 },
      { x: 878, y: 245, w: 171, h: 8 }
    ],
    padrao: PADRAO_TIJOLOS
  },
  {
    nome: 'Fase 3',
    fundo: 'assets/Fase3.png',
    cores: ['#22c55e', '#a855f7', '#f97316'], // verde, roxo, laranja
    paredes: [
      { x1: 149, y1: 248, x2: 300, y2: 164, espessura: 8 },
      { x1: 500, y1: 253, x2: 697, y2: 253, espessura: 8 },
      { x1: 918, y1: 153, x2: 1033, y2: 248, espessura: 8 }
    ],
    padrao: PADRAO_TIJOLOS,
    chefaoIntervalo: { parede: 1 } // modo intervalo: no fim, o chefão cai em cima da parede do meio
  },
  {
    nome: 'Fase 4',
    fundo: 'assets/Fase4.png',
    cores: ['#22d3ee', '#ec4899', '#facc15'], // ciano, rosa, amarelo
    paredes: [
      { x1: 194, y1: 126, x2: 337, y2: 218, espessura: 8 },
      { x1: 445, y1: 244, x2: 525, y2: 350, espessura: 8 },
      { x1: 655, y1: 352, x2: 723, y2: 251, espessura: 8 },
      { x1: 875, y1: 228, x2: 1002, y2: 126, espessura: 8 }
    ],
    padrao: PADRAO_TIJOLOS
  },
  {
    nome: 'Fase 5',
    fundo: 'assets/Fase5.png',
    cores: ['#f97316', '#94a3b8', '#facc15'], // laranja, aço, amarelo
    paredes: [],
    padrao: PADRAO_TIJOLOS,
    esteira: { vel: 40, total: 150 }
  },
  {
    // Evento de Natal: só aparece liberada em dezembro (no simulador fica liberada para testar)
    nome: 'Fase Natalina',
    fundo: 'assets/FaseNatal.png',
    cores: ['#dc2626', '#16a34a', '#facc15', '#3b82f6', '#ec4899'], // presentes: vermelho, verde, dourado, azul, rosa
    paredes: [],
    padrao: [
      '11.....33.....11',
      '22....2222....22',
      '11...222222...11',
      '22..11111111..22',
      '1..1111111111..1',
      '2.111111111111.2'
    ],
    mes: 12,   // só liberada em dezembro
    natal: true // tijolos de presente, neve, chefão saco do Papai Noel e rena voando
  }
];

// A fase está liberada? (fase de evento só no mês dela; no simulador, sempre, para testar)
function faseLiberada(i) {
  const f = FASES[i];
  if (!f.mes) return true;
  const simulador = !document.getElementById('simulador').classList.contains('escondido');
  return simulador || new Date().getMonth() + 1 === f.mes;
}

// Imagens que o jogo carrega ao abrir (fundos entram pela fase)
const ARQUIVOS = {
  bola: 'assets/ball.png',
  paddle: 'assets/player.png',
  tijolo: 'assets/brick.png',
  tijolo3: 'assets/brick3.png',
  tijolo4: 'assets/brick4.png'
};
FASES.forEach((f, i) => { ARQUIVOS['fundo' + i] = f.fundo; });
