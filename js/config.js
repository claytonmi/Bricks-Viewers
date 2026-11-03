// ===== Configuração geral do jogo =====
// Medidas do canvas, velocidades, tempos e botões.

const W = 1200;
const H = 680;
const RAIO = 8;                  // raio da bola (colisão)
const TAM_BOLA = 16;             // tamanho desenhado da bola
const VEL_BASE = 240;            // pixels por segundo
const VEL_PADDLE = 520;          // velocidade da raquete com teclado
const PADDLE_W = 150;
const PADDLE_H = 16;
const PADDLE_Y = H - 40;
const ESPACO_BOLA = 19;          // distância entre bolas na mesma linha
const BOLAS_POR_LINHA = 20;
const MAX_VIEWERS = 100;         // 5 linhas de 20 bolas
const INTERVALO_STREAMER = 5000; // a cada 5 s: +1 ponto do streamer se mais de 50% das bolas estiverem no ar
const ESPERA_QUEDA = 1000;       // 1 s até a bola voltar ao centro
const DURACAO_SPEED = 5000;      // !speed dura 5 s
const CARGA_SPEED = 5;           // batidas necessárias para usar !speed de novo
const COOLDOWN_COR = 5000;       // 5 s entre uma troca de cor e a próxima do mesmo viewer
const MULT_SPEED = 2;            // !speed: 100% mais rápido (dobro)
const BOMBA_CADA = 10;           // a cada 10 encostos em tijolos, o viewer ganha 1 bomba
const BOMBA_MAX = 2;             // máximo de bombas guardadas por viewer
const BOMBA_RAIO = 45;           // raio da explosão (px) a partir da bola que deu !bomb
const GRAV_CADA = 12;            // encostos em tijolos para ganhar o !gravity (só 1 guardado)
const GRAV_RAIO = 60;            // raio do campo gravitacional (px)
const GRAV_TEMPO = 2000;         // tempo puxando as bolas até a explosão (ms)
const GRAV_PUXAO = 90;           // velocidade com que as bolas presas vão para o centro (px por segundo)
const GRAV_PERTO = 18;           // distância do centro onde as bolas presas ficam girando (px)
const GRAV_GIRO = 3;             // giro das bolas presas em volta do centro (radianos por segundo)
const GRAV_ANEL = 450;           // tempo do anel azul da explosão gravitacional (ms)
const CHOQUE_CADA = 13;          // encostos em tijolos para ganhar o !shock (só 1 guardado)
const CHOQUE_RAIO = 30;          // distância (px) em que a bola eletrizada atordoa as outras
const CHOQUE_TEMPO = 1500;       // tempo que a bola fica eletrizada (ms)
const ATORDOADA_TEMPO = 2000;    // tempo que a bola atingida fica atordoada (ms)
const ATORDOADA_VEL = 0.01;      // velocidade da bola atordoada (1% da normal)
const IMUNE_CHOQUE = 3000;       // depois do atordoamento, imune a outro !shock por 3 s
const ITENS_PORCENTO = 0.2;       // 20% dos tijolos da fase (sorteados) soltam item
const DURACAO_AVISO = 2000;      // tempo do texto "Fulano usou !bomb" parado em cima da bola (ms)
const AVISO_SOME = 300;          // depois disso, o texto some aos poucos (ms)
const BOMBA_TEMPO = 350;         // tempo da animação da explosão (ms)
const ITEM_VEL = 160;            // velocidade de queda do item (px por segundo)
const ITEM_TAM = 16;             // tamanho do item na tela
const ITEM_PONTOS = 5;           // pontos do streamer ao pegar um item com a raquete
const MULTIBOLA_CHANCE = 0.25;   // dos itens que caem, 1 em 4 é multibola (os outros dão pontos ao streamer)
const MULTIBOLA_TEMPO = 8000;    // multibola: cada bola ganha uma cópia por 8 s (os pontos da cópia vão para o dono)

// Poucos jogadores: poderes saem mais rápido (5→3, 10→6, 12→7, 13→8 batidas)
const POUCOS_JOGADORES = 15;     // abaixo disso, as batidas para ganhar poder diminuem
const POUCOS_FATOR = 7 / 12;     // 12 batidas viram 7; os outros poderes na mesma proporção

// Chuva de tijolos (fase 1)
const CHUVA_LINHAS = 6;          // altura máxima da pilha em cada coluna
const CHUVA_VEL = 150;           // velocidade de queda dos tijolos (px por segundo)
const CHUVA_RAPIDA = 80;         // intervalo entre tijolos com a tela vazia (ms)
const CHUVA_LENTA = 1200;        // intervalo com a tela quase cheia (ms): quanto mais tijolos, mais devagar
const CHUVA_MIN = 120;           // total da chuva com até 10 jogadores (com 100, é o total da fase)

// Tijolo chefão (fase com chuva): cai quando a chuva acabou e sobram poucos tijolos
const CHEFAO_QUANDO = 5;         // cai quando restam 5 tijolos ou menos na tela
const CHEFAO_VIDA = 20;
const CHEFAO_PONTOS = 5;         // pontos para quem der a última batida
const CHEFAO_H = 54;             // altura de 2 linhas de tijolos (largura de 2 colunas)

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
