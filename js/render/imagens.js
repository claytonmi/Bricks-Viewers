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
  cacheCor.set(cor, c);
  return c;
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
