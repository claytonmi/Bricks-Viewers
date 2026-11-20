// ===== Selo de fundador =====
// Canais que conectaram no jogo nos primeiros meses ganham um selo no canto das telas.
// Sem login: ao conectar no chat, o jogo avisa o servidor. Dentro do prazo, o canal vira fundador;
// depois do prazo, o servidor só responde se ele já é. Quem decide é sempre o servidor.

// Endereço do servidor. Abrindo pelo próprio computador, usa o servidor local de testes.
const FUNDADOR_SERVIDOR = location.hostname === 'localhost'
  ? 'http://localhost:8787'
  : 'https://bricks-viewers-servidor.bricks-viewers-servidor.workers.dev';

let fundadorCanalPedido = '';

// Selo em inglês ("FOUNDER"). Enquanto a arte não existir, fica vazio e o inglês usa o selo em português.
// Quando a imagem chegar: salvar em assets/imagens/interface/selo-fundador-en.png e colocar o caminho aqui.
const SELO_FUNDADOR_EN = '';
if (SELO_FUNDADOR_EN) {
  const img = new Image();
  img.onload = () => {
    imgs.seloFundadorEn = img;
    document.documentElement.classList.add('selo-en'); // o CSS troca o selo das telas
  };
  img.src = SELO_FUNDADOR_EN;
}

// Selo do idioma atual, para o que é desenhado no jogo (ranking entre as fases)
function seloFundadorAtual() {
  return idiomaAtual === 'en' && imgs.seloFundadorEn ? imgs.seloFundadorEn : imgs.seloFundador;
}

// Mostra ou esconde o selo em todas as telas (menu, informações, ranking e pausa)
function mostrarSeloFundador(sim) {
  document.body.classList.toggle('fundador', !!sim);
}

// Chamado ao conectar no chat
async function verificarFundador(canal) {
  canal = String(canal || '').toLowerCase();
  if (canal === fundadorCanalPedido) return;  // reconexão no mesmo canal: mantém o selo
  fundadorCanalPedido = canal;
  mostrarSeloFundador(false);
  if (!FUNDADOR_SERVIDOR || !canal) return;
  try {
    const resp = await fetch(FUNDADOR_SERVIDOR + '/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canal }),
    });
    const dados = await resp.json();
    // a resposta só vale se o streamer não trocou de canal enquanto esperava
    if (canal === fundadorCanalPedido) mostrarSeloFundador(dados.fundador === true);
  } catch (e) {
    // servidor fora do ar: o jogo segue normal, só sem o selo
  }
  // depois do registro (que guarda o ID do canal), pede as skins do servidor que o canal pode usar
  if (canal === fundadorCanalPedido) carregarSkinsServidor(canal);
}
