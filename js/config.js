// ===== Configuração geral do jogo =====
// Medidas do canvas, velocidades, tempos e botões.

const W = 1200;
const H = 680;
const RAIO = 8;                  // raio da bola (colisão)
const TAM_BOLA = 16;             // tamanho desenhado da bola
const VEL_BASE = 300;            // pixels por segundo
const VEL_PADDLE = 520;          // velocidade da raquete com teclado
const PADDLE_W = 150;
const PADDLE_H = 16;
const PADDLE_Y = H - 40;
const ESPACO_BOLA = 19;          // distância entre bolas na mesma linha
const BOLAS_POR_LINHA = 20;
const MAX_VIEWERS = 100;         // 5 linhas de 20 bolas
const INTERVALO_STREAMER = 3000; // a cada 3 s: +1 ponto do streamer se mais de 50% das bolas estiverem no ar
const ESPERA_QUEDA = 1000;       // 1 s até a bola voltar ao centro
const DURACAO_SPEED = 5000;      // !speed dura 5 s
const CARGA_SPEED = 5;           // batidas necessárias para usar !speed de novo
const COOLDOWN_COR = 5000;       // 5 s entre uma troca de cor e a próxima do mesmo viewer
const MULT_SPEED = 2;            // !speed: 100% mais rápido (dobro)

const CELULA_W = W / 16;         // 16 colunas de tijolos
const TIJOLO_W = 70;
const TIJOLO_H = 24;
const TIJOLO_TOPO = 110;

// Botão Pronto: centro da tela, logo acima da raquete
const BOTAO_PRONTO = { x: W / 2 - 65, y: PADDLE_Y - 46, w: 130, h: 32 };
// Botão de som no topo direito, ao lado do contador de bolas
const BOTAO_SOM = { x: W - 300, y: 10, w: 110, h: 28 };
// Barra de volume: aparece embaixo do botão Som quando o mouse passa por cima
const BARRA_VOL = { x: W - 300, y: 44, w: 110, h: 24 };

// Cores que o viewer pode escolher com !azul, !vermelho...
const CORES = {
  azul: '#3b82f6', vermelho: '#ef4444', amarelo: '#facc15', verde: '#22c55e',
  branco: '#ffffff', roxo: '#a855f7', laranja: '#f97316', rosa: '#ec4899', ciano: '#22d3ee'
};

// Qual imagem de tijolo mostrar conforme a vida restante
const SPRITE_TIJOLO = { 3: 'tijolo', 2: 'tijolo3', 1: 'tijolo4' };
