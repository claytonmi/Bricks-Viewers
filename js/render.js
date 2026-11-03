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

// Linha em zigue-zague (raio elétrico) de (x1, y1) até (x2, y2); muda a cada quadro
function linhaEletrica(x1, y1, x2, y2, tremor) {
  const passos = 6;
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i < passos; i++) {
    const t = i / passos;
    const d = (Math.random() * 2 - 1) * tremor;
    ctx.lineTo(x1 + (x2 - x1) * t + nx / len * d, y1 + (y2 - y1) * t + ny / len * d);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Círculo tremido (contorno elétrico) em volta de (x, y)
function circuloEletrico(x, y, raio, tremor) {
  const pontos = 18;
  ctx.beginPath();
  for (let i = 0; i <= pontos; i++) {
    const a = (i / pontos) * Math.PI * 2;
    const r = raio + (Math.random() * 2 - 1) * tremor;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.stroke();
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
// Tijolo chefão: dourado e brilhando, com a vida que falta escrita no meio
function desenharChefao(t, agora) {
  const sprite = t.vida > CHEFAO_VIDA * 2 / 3 ? 'tijolo' : t.vida > CHEFAO_VIDA / 3 ? 'tijolo3' : 'tijolo4';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 14 + Math.sin(agora / 150) * 6;
  const img = tijoloColorido(sprite, t.cor);
  if (img) ctx.drawImage(img, t.x, t.y, t.w, t.h);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';
  ctx.strokeText(t.vida, t.x + t.w / 2, t.y + t.h / 2 + 7);
  ctx.fillStyle = '#fff';
  ctx.fillText(t.vida, t.x + t.w / 2, t.y + t.h / 2 + 7);
  ctx.textAlign = 'left';
}

function desenhar(agora) {
  ctx.clearRect(0, 0, W, H);
  const fundo = imgs['fundo' + faseIndex];
  if (fundo) ctx.drawImage(fundo, 0, 0, W, H);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, W, H);

  // tijolos
  for (const t of tijolos) {
    if (!t.vivo) continue;
    if (t.chefao) { desenharChefao(t, agora); continue; }
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

  // campos do !gravity: círculo azul que pulsa e encolhe até a explosão
  for (const c of camposGrav) {
    const f = Math.min(1, (agora - c.inicio) / GRAV_TEMPO); // 0 → 1
    const r = GRAV_RAIO * (1 - 0.35 * f) + Math.sin(agora / 80) * 2;
    const brilho = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    brilho.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
    brilho.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    ctx.fillStyle = brilho;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -agora / 30; // tracejado girando
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // cópias do multibola: mais transparentes, piscando nos 2 últimos segundos
  for (const c of copias) {
    const falta = c.ate - agora;
    ctx.globalAlpha = falta < 2000 && Math.floor(agora / 150) % 2 ? 0.3 : 0.65;
    ctx.drawImage(bolaColorida(c.cor), c.x - TAM_BOLA / 2, c.y - TAM_BOLA / 2, TAM_BOLA, TAM_BOLA);
    ctx.globalAlpha = 1;
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
    // !shock: bola eletrizada (aura amarela tremendo no raio do choque)
    if (agora < b.choqueAte) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.9)';
      ctx.lineWidth = 2;
      circuloEletrico(b.x, b.y, TAM_BOLA / 2 + 4, 3);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.lineWidth = 1;
      circuloEletrico(b.x, b.y, CHOQUE_RAIO, 2);
      ctx.shadowBlur = 0;
    }
    // atordoada: faíscas amarelas piscando em volta
    if (agora < b.atordoadaAte && Math.random() < 0.7) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      circuloEletrico(b.x, b.y, TAM_BOLA / 2 + 2, 3);
    }
    // o que o viewer pode usar (só durante a partida): ⚡ = !speed pronto, 💣N = bombas, 🌀 = !gravity, 🔋 = !shock
    if (estado === 'jogando') {
      const speedPronto = b.carga >= batidasPara(CARGA_SPEED) && agora >= b.velExtraAte;
      const marcas = (speedPronto ? '⚡' : '') + (b.bombas > 0 ? '💣' + b.bombas : '') +
                     (b.gravidade ? '🌀' : '') + (b.choque ? '🔋' : '');
      if (marcas) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(marcas, b.x, b.y - 12);
        ctx.textAlign = 'left';
      }
    }
  }

  // raios do !shock ligando a bola eletrizada às que ela atordoou
  for (const r of raiosChoque) {
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    linhaEletrica(r.de.x, r.de.y, r.para.x, r.para.y, 5);
    ctx.shadowBlur = 0;
  }

  // "Fulano usou !bomb": fica 2 s em cima da bola e some (por cima das outras bolas)
  for (const b of viewers) {
    if (agora >= b.avisoAte || b.estado === 'caiu') continue;
    const y = b.y - 26;
    ctx.globalAlpha = Math.min(1, (b.avisoAte - agora) / AVISO_SOME);
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.strokeText(b.aviso, b.x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(b.aviso, b.x, y);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // itens caindo (a raquete pega)
  // amarelo com "+" = pontos do streamer; azul com "×2" = multibola
  for (const it of itensCaindo) {
    const multi = it.tipo === 'multibola';
    ctx.fillStyle = multi ? '#22d3ee' : '#facc15';
    ctx.beginPath();
    ctx.arc(it.x, it.y, ITEM_TAM / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = multi ? 'bold 10px sans-serif' : 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(multi ? '×2' : '+', it.x, it.y + (multi ? 4 : 5));
    ctx.textAlign = 'left';
  }

  // explosões (anel que some): laranja do !bomb, azul do !gravity
  for (const e of explosoes) {
    const f = Math.min(1, (agora - e.inicio) / (e.tempo || BOMBA_TEMPO));
    ctx.globalAlpha = 1 - f;
    ctx.strokeStyle = e.cor || '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, (e.raio || BOMBA_RAIO) * (0.5 + f), 0, Math.PI * 2);
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
    // na chuva, conta os que ainda vão cair (e o chefão, até ele cair)
    const chefaoFalta = FASES[faseIndex].chuva && !chefaoCaiu ? 1 : 0;
    ctx.fillText(`Tijolos: ${tijolosVivos + chuvaRestante + chefaoFalta}${extra}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Bolas no ar: ${noAr}/${viewers.length}`, W - 20, 30);
    ctx.textAlign = 'left';
    // "Tijolo chefão!", "Multibola!": grande no meio da tela, some aos poucos
    if (agora < anuncioAte) {
      ctx.globalAlpha = Math.min(1, (anuncioAte - agora) / 500);
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.strokeText(anuncio, W / 2, H / 2 + 40);
      ctx.fillStyle = '#facc15';
      ctx.fillText(anuncio, W / 2, H / 2 + 40);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // chat caiu: avisa na tela (o status do menu fica escondido durante a partida)
  if (chatReconectando && estado !== 'menu') {
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chat da Twitch caiu, reconectando...', W / 2, 62);
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
