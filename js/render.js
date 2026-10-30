// ===== Desenho na tela =====

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

// Nome do viewer em cima da bola (só na tela de espera)
function etiqueta(texto, x, y) {
  ctx.font = '12px sans-serif';
  const w = ctx.measureText(texto).width + 10;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(x - w / 2, y - 26, w, 16);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(texto, x, y - 14);
  ctx.textAlign = 'left';
}

// Barrinha de volume embaixo do botão Som
function desenharBarraVolume() {
  const b = BARRA_VOL;
  const t = trilhoVolume();
  const meio = b.y + b.h / 2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(b.x, b.y, b.w, b.h);

  // trilho cinza e parte preenchida
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(t.x0, meio);
  ctx.lineTo(t.x1, meio);
  ctx.stroke();
  const xBolinha = t.x0 + (t.x1 - t.x0) * volumeMusica;
  ctx.strokeStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(t.x0, meio);
  ctx.lineTo(xBolinha, meio);
  ctx.stroke();

  // bolinha
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(xBolinha, meio, 6, 0, Math.PI * 2);
  ctx.fill();

  // porcentagem
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(volumeMusica * 100) + '%', b.x + b.w - 4, meio + 4);
  ctx.textAlign = 'left';
}

// Desenha um quadro completo
function desenhar(agora) {
  ctx.clearRect(0, 0, W, H);
  const fundo = imgs['fundo' + faseIndex];
  if (fundo) ctx.drawImage(fundo, 0, 0, W, H);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, W, H);

  // tijolos
  for (const t of tijolos) {
    if (!t.vivo) continue;
    const img = tijoloColorido(SPRITE_TIJOLO[t.vida] || 'tijolo', t.cor);
    if (img) ctx.drawImage(img, t.x, t.y, t.w, t.h);
  }

  // paredes da fase
  for (const p of paredesAtuais) {
    if (p.x1 !== undefined) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = p.espessura;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }

  // raquete do streamer (brilha quando ele ganha ponto)
  if (imgs.paddle) {
    if (agora < paddleBrilhoAte) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 30;
    }
    ctx.drawImage(imgs.paddle, paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;
  }

  // bolas
  for (const b of viewers) {
    if (b.estado === 'caiu') continue;
    // bola que acabou de usar !bomb brilha em vermelho
    if (agora < b.brilhoBombaAte) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
    }
    ctx.drawImage(bolaColorida(b.cor), b.x - TAM_BOLA / 2, b.y - TAM_BOLA / 2, TAM_BOLA, TAM_BOLA);
    ctx.shadowBlur = 0;
    // quantas bombas o viewer tem (aparece só durante a partida)
    if (estado === 'jogando' && b.bombas > 0) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💣' + b.bombas, b.x, b.y - 12);
      ctx.textAlign = 'left';
    }
  }

  // itens caindo (a raquete pega)
  for (const it of itensCaindo) {
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(it.x, it.y, ITEM_TAM / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', it.x, it.y + 5);
    ctx.textAlign = 'left';
  }

  // explosões das bombas (anel que some)
  for (const e of explosoes) {
    const f = (agora - e.inicio) / BOMBA_TEMPO;
    ctx.globalAlpha = 1 - f;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, BOMBA_RAIO * (0.5 + f), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // nomes nas bolas (só antes do Pronto)
  if (estado === 'lobby') {
    for (const b of viewers) etiqueta(b.nome, b.x, b.y);
  }

  // botão Pronto
  if (estado === 'lobby') {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(BOTAO_PRONTO.x, BOTAO_PRONTO.y, BOTAO_PRONTO.w, BOTAO_PRONTO.h);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pronto', BOTAO_PRONTO.x + BOTAO_PRONTO.w / 2, BOTAO_PRONTO.y + 23);
    ctx.textAlign = 'left';
  }

  // textos de estado
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  if (estado === 'lobby') {
    ctx.fillText(`Aguardando viewers: digite !entrar  (${viewers.length}/${maxViewers})`, 20, 30);
    if (agora < avisoAte) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(aviso, 20, 56);
    }
  }
  if (estado === 'jogando') {
    const noAr = viewers.filter(b => b.estado === 'jogando').length;
    const extra = streamerPontua ? `   Ponto do streamer: ${streamerPts}` : '';
    ctx.fillText(`Tijolos: ${tijolosVivos}${extra}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Bolas no ar: ${noAr}/${viewers.length}`, W - 20, 30);
    ctx.textAlign = 'left';
  }

  // botão de som (topo direito, ao lado das bolas)
  if (estado !== 'menu') {
    const m = BOTAO_SOM;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(m.x, m.y, m.w, m.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(somLigado ? '🔊 Som' : '🔇 Mudo', m.x + m.w / 2, m.y + 19);
    ctx.textAlign = 'left';

    // barra de volume (aparece com o mouse em cima ou arrastando)
    if (mostrarVolume || arrastandoVolume) desenharBarraVolume();
  }

  if (estado === 'contagem') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(contagemTexto, W / 2, H / 2);
    ctx.textAlign = 'left';
  }
}
