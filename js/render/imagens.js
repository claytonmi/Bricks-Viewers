// ===== Imagens =====
// Carrega as imagens e pinta bolas e tijolos com a cor pedida (guardando em cache).

// Carrega todas as imagens antes de começar
function carregarImagens() {
  return Promise.all(Object.entries(ARQUIVOS).map(([chave, src]) => new Promise((ok, erro) => {
    const im = new Image();
    im.onload = () => { imgs[chave] = im; ok(); };
    im.onerror = () => erro(new Error('Não achei a imagem: ' + src));
    im.src = src;
  })));
}

// Bola branca pintada com a cor do viewer (guarda em cache)
function bolaColorida(cor) {
  if (cacheCor.has(cor)) return cacheCor.get(cor);
  const c = document.createElement('canvas');
  c.width = imgs.bola.width;
  c.height = imgs.bola.height;
  const cx = c.getContext('2d');
  cx.drawImage(imgs.bola, 0, 0);
  cx.globalCompositeOperation = 'source-in';
  cx.fillStyle = cor;
  cx.fillRect(0, 0, c.width, c.height);
  // bola escura (preta, azul-marinho...) some no fundo escuro: ganha um contorno branco
  if (corEscura(cor)) {
    cx.globalCompositeOperation = 'source-over';
    const linha = Math.max(1.5, c.width * 0.1);
    cx.strokeStyle = '#ffffff';
    cx.lineWidth = linha;
    cx.beginPath();
    cx.arc(c.width / 2, c.height / 2, c.width / 2 - linha / 2, 0, Math.PI * 2);
    cx.stroke();
  }
  cacheCor.set(cor, c);
  return c;
}

// A cor é escura demais para aparecer no fundo? (brilho percebido abaixo de 60, numa escala de 0 a 255)
const cxCor = document.createElement('canvas').getContext('2d');
function corEscura(cor) {
  cxCor.fillStyle = '#000000';
  cxCor.fillStyle = cor; // o navegador devolve sempre "#rrggbb" (ou rgba, com transparência)
  const v = cxCor.fillStyle;
  let r, g, b;
  if (v[0] === '#') {
    r = parseInt(v.slice(1, 3), 16);
    g = parseInt(v.slice(3, 5), 16);
    b = parseInt(v.slice(5, 7), 16);
  } else {
    [r, g, b] = (v.match(/\d+(\.\d+)?/g) || [255, 255, 255]).map(Number);
  }
  return 0.299 * r + 0.587 * g + 0.114 * b < 60;
}

// Tijolo com a cor da fase (mantém o desenho e a transparência do sprite)
function tijoloColorido(chave, cor) {
  const src = imgs[chave];
  if (!cor || !src) return src;
  const k = chave + '|' + cor;
  if (cacheCor.has(k)) return cacheCor.get(k);
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const cx = c.getContext('2d');
  cx.drawImage(src, 0, 0);
  cx.globalCompositeOperation = 'color'; // troca a cor, mantém o brilho do tijolo
  cx.fillStyle = cor;
  cx.fillRect(0, 0, c.width, c.height);
  cx.globalCompositeOperation = 'destination-in'; // volta a transparência original
  cx.drawImage(src, 0, 0);
  cacheCor.set(k, c);
  return c;
}
