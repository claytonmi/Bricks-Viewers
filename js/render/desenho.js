// ===== Desenho na tela =====
// desenhar() chama uma função por parte da tela, na ordem em que as coisas aparecem (de trás para a frente).

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

// Nome do viewer embaixo da bola (no modo intervalo, o que aparece no OBS)
function etiquetaAbaixo(texto, x, y) {
  ctx.font = '11px sans-serif';
  const w = ctx.measureText(texto).width + 8;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(x - w / 2, y + 2, w, 14);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(texto, x, y + 13);
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

// Tijolo chefão: dourado e brilhando, com a vida que falta escrita no meio
function desenharChefao(t, agora) {
  const max = t.vidaMax || CHEFAO_VIDA;
  const sprite = t.vida > max * 2 / 3 ? 'tijolo' : t.vida > max / 3 ? 'tijolo3' : 'tijolo4';
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

// Fase 6: meteoro redondo e irregular, girando devagar (só visual). As trincas aparecem conforme perde vida.
function desenharMeteoro(t, agora) {
  ctx.save();
  ctx.translate(t.cx, t.cy);
  ctx.rotate(t.giro + agora / 9000);
  ctx.beginPath();
  t.forma.forEach((f, i) => {
    const a = (i / t.forma.length) * Math.PI * 2;
    const x = Math.cos(a) * t.r * f;
    const y = Math.sin(a) * t.r * f;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = t.cor;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (const c of t.crateras) {
    ctx.beginPath();
    ctx.arc(Math.cos(c.a) * t.r * c.d, Math.sin(c.a) * t.r * c.d, t.r * c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  const trincas = Math.min(t.trincas.length, t.vidaMax - t.vida);
  ctx.strokeStyle = 'rgba(20, 10, 0, 0.8)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < trincas; i++) {
    const a = t.trincas[i];
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * t.r * 0.25, Math.sin(a) * t.r * 0.25);
    ctx.lineTo(Math.cos(a + 0.4) * t.r * 0.7, Math.sin(a + 0.4) * t.r * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

// Fase 6: a entrada (escura, com espiral) e a saída (clara). Aparecem e somem aos poucos.
function desenharBuraco(agora) {
  if (!buraco || !buraco.entrada) return;
  const f = buraco.fase;
  const alfa = f === 'aparecendo' ? buraco.t / BURACO_SURGE : f === 'sumindo' ? 1 - buraco.t / BURACO_SOME : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
  const e = buraco.entrada;
  const grad = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, BURACO_R * 1.8);
  grad.addColorStop(0, '#000');
  grad.addColorStop(0.6, 'rgba(40, 10, 70, 0.9)');
  grad.addColorStop(1, 'rgba(90, 40, 160, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(e.x, e.y, BURACO_R * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(196, 181, 253, 0.8)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const a0 = agora / 300 + k * Math.PI * 2 / 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, BURACO_R * 0.9, a0, a0 + 1.2);
    ctx.stroke();
  }
  const s = buraco.saida;
  const brilho = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, BURACO_R * 1.8);
  brilho.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  brilho.addColorStop(0.5, 'rgba(34, 211, 238, 0.6)');
  brilho.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = brilho;
  ctx.beginPath();
  ctx.arc(s.x, s.y, BURACO_R * (1.8 + 0.08 * Math.sin(agora / 200)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ----- Partes da tela (desenhar chama todas, na ordem) -----

// Fundo da fase, escurecido para as coisas se destacarem
function desenharFundo(agora) {
  ctx.clearRect(0, 0, W, H);
  const fundo = imgs['fundo' + faseIndex];
  if (fundo) ctx.drawImage(fundo, 0, 0, W, H);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, W, H);
  if (faseNatal()) desenharNeve(agora); // Natal: neve caindo atrás dos tijolos
  if (espacoAtiva()) desenharBuraco(agora); // Fase 6: o buraco fica embaixo dos meteoros
}

// Tijolos, sacos do Natal, chefão e meteoros
function desenharTijolos(agora) {
  // meteoros que estão chegando passam por trás dos que já estão parados (desenhados primeiro)
  for (const t of tijolos) if (t.circ && t.entrando && t.vivo) desenharMeteoro(t, agora);
  for (const t of tijolos) {
    if (!t.vivo) continue;
    if (t.dragao) { desenharSegmentoDragao(t, agora); continue; } // Ano Novo
    if (t.tipo) { desenharTijoloAnoNovo(t, agora); continue; }   // Ano Novo: lanterna, envelope, fogos
    if (t.circ) { if (!t.entrando) desenharMeteoro(t, agora); continue; }
    if (t.saco) { desenharSaco(t, agora); continue; }
    if (t.chefao) { desenharChefao(t, agora); continue; }
    const img = tijoloColorido(SPRITE_TIJOLO[t.vida] || 'tijolo', t.cor);
    if (!img) continue;
    // esteira: tijolo novo entrando pela borda aparece aos poucos
    if (t.surgiu && agora - t.surgiu < ESTEIRA_SURGE) ctx.globalAlpha = Math.max(0, (agora - t.surgiu) / ESTEIRA_SURGE);
    ctx.drawImage(img, t.x, t.y, t.w, t.h);
    // esteira: o pedaço que passou da borda direita aparece na esquerda
    if (t.x + t.w > W) ctx.drawImage(img, t.x - W, t.y, t.w, t.h);
    if (faseNatal()) desenharFitaPresente(t, t.x); // Natal: o tijolo vira presente
    ctx.globalAlpha = 1;
  }
}

// Paredes da fase (retas ou inclinadas)
function desenharParedes() {
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
}

// Modo intervalo: chão-parede no lugar da raquete (embaixo dele fica escuro)
function desenharChao() {
  if (!modoIntervalo || estado === 'menu') return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, PISO_Y, W, H - PISO_Y);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, PISO_Y, W, 6);
}

// Raquete do streamer (brilha quando ele ganha ponto; no modo intervalo não tem)
function desenharRaquete(agora) {
  if (!imgs.paddle || modoIntervalo) return;
  if (agora < paddleBrilhoAte) {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;
  }
  if (faseNatal()) desenharBengala(paddleX - PADDLE_W / 2, PADDLE_Y); // Natal: a raquete vira bengala doce
  else ctx.drawImage(imgs.paddle, paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H);
  ctx.shadowBlur = 0;
}

// Campos do !gravity: círculo azul que pulsa e encolhe até a explosão
function desenharCamposGravidade(agora) {
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
}

// Cópias do multibola: mais transparentes, piscando nos 2 últimos segundos
function desenharCopias(agora) {
  for (const c of copias) {
    const falta = c.ate - agora;
    ctx.globalAlpha = falta < 2000 && Math.floor(agora / 150) % 2 ? 0.3 : 0.65;
    ctx.drawImage(bolaColorida(c.cor), c.x - TAM_BOLA / 2, c.y - TAM_BOLA / 2, TAM_BOLA, TAM_BOLA);
    ctx.globalAlpha = 1;
  }
}

// Bolas dos viewers e o que cada uma mostra (poderes prontos, efeitos)
function desenharBolas(agora) {
  for (const b of viewers) {
    if (b.estado === 'caiu') continue;
    // bola que acabou de usar !bomb brilha em vermelho
    if (agora < b.brilhoBombaAte) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
    }
    if (b.fantasma) ctx.globalAlpha = 0.4; // atordoada na frente do dragão: passa por dentro dele
    ctx.drawImage(bolaColorida(b.cor), b.x - TAM_BOLA / 2, b.y - TAM_BOLA / 2, TAM_BOLA, TAM_BOLA);
    ctx.globalAlpha = 1;
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
    // modo intervalo (link do OBS): nome de cada viewer embaixo da bola, o streamer incluído
    // ciclo: aparece por 15 s (some aos poucos nos últimos 2), fica escondido 15 s e volta
    if (modoIntervalo && estado === 'jogando') {
      if (!b.nomeDesde) b.nomeDesde = agora; // começa no primeiro quadro da partida em que o nome aparece
      const fase = (agora - b.nomeDesde) % (NOME_MOSTRA + NOME_ESCONDIDO);
      if (fase < NOME_MOSTRA) {
        const sumindo = fase > NOME_MOSTRA - NOME_SUMIR;
        ctx.globalAlpha = sumindo ? (NOME_MOSTRA - fase) / NOME_SUMIR : 1;
        etiquetaAbaixo(b.nome, b.x, b.y + TAM_BOLA / 2);
        ctx.globalAlpha = 1;
      }
    }
  }
}

// Raios do !shock ligando a bola eletrizada às que ela atordoou
function desenharRaiosChoque() {
  for (const r of raiosChoque) {
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    linhaEletrica(r.de.x, r.de.y, r.para.x, r.para.y, 5);
    ctx.shadowBlur = 0;
  }
}

// "Fulano usou !bomb": fica 2 s em cima da bola e some (por cima das outras bolas)
function desenharAvisos(agora) {
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
}

// Itens caindo (a raquete pega): amarelo com "+" = pontos do streamer; azul com "×2" = multibola
function desenharItens() {
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
}

// Explosões (anel que some): laranja do !bomb, azul do !gravity
function desenharExplosoes(agora) {
  for (const e of explosoes) {
    const f = Math.min(1, (agora - e.inicio) / (e.tempo || BOMBA_TEMPO));
    ctx.globalAlpha = 1 - f;
    ctx.strokeStyle = e.cor || '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // !bomb: o anel para exatamente no alcance da explosão, para o chat ver até onde pegou
    ctx.arc(e.x, e.y, e.raio ? e.raio * (0.5 + f) : BOMBA_RAIO * (0.5 + 0.5 * f), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// Partes só do Natal: rena voando, presentinhos do saco e os "+1"
function desenharExtrasNatal(agora) {
  if (!faseNatal()) return;
  desenharRena(agora);
  desenharPresentinhos(agora);
}

// Nomes nas bolas (só antes do Pronto) e o botão Pronto (no modo intervalo a partida começa sozinha)
function desenharLobby(agora) {
  if (estado === 'lobby') {
    for (const b of viewers) etiqueta(b.nome, b.x, b.y);
  }
  if (estado === 'lobby' && !modoIntervalo) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(BOTAO_PRONTO.x, BOTAO_PRONTO.y, BOTAO_PRONTO.w, BOTAO_PRONTO.h);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pronto', BOTAO_PRONTO.x + BOTAO_PRONTO.w / 2, BOTAO_PRONTO.y + 23);
    ctx.textAlign = 'left';
  }
}

// Textos de estado: contagem do lobby, tijolos/meteoros e vagas durante a partida, avisos
function desenharTextos(agora) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  if (estado === 'lobby' && modoIntervalo) {
    const jogadores = viewers.filter(b => !b.streamer).length;
    const falta = Math.max(0, Math.ceil((comecaEm - agora) / 1000));
    ctx.fillText(`Modo intervalo: digite !entrar  (${jogadores}/${maxViewers})`, 20, 30);
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    const txt = `${FASES[faseIndex].nome} começa em ${falta} s`;
    ctx.strokeText(txt, W / 2, PISO_Y - 170);
    ctx.fillText(txt, W / 2, PISO_Y - 170);
    ctx.textAlign = 'left';
    ctx.font = '16px sans-serif';
  } else if (estado === 'lobby') {
    ctx.fillText(`Aguardando viewers: digite !entrar  (${viewers.length}/${maxViewers})`, 20, 30);
    if (agora < avisoAte) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(aviso, 20, 56);
    }
  }
  if (estado === 'jogando') {
    const noAr = viewers.filter(b => b.estado === 'jogando').length;
    const extra = streamerPontua ? `   Ponto do streamer: ${streamerPts}` : '';
    // na chuva e na esteira, conta os que ainda vão aparecer (e o chefão, até ele cair)
    const chefaoFalta = faseTemChefao() && !chefaoCaiu ? 1 : 0;
    const fase = modoIntervalo ? `${FASES[faseIndex].nome}   ` : '';
    const rotulo = espacoAtiva() ? 'Meteoros' : 'Tijolos'; // fase 6: conta meteoros
    ctx.fillText(`${fase}${rotulo}: ${tijolosVivos + chuvaRestante + chefaoFalta}${extra}`, 20, 30);
    ctx.textAlign = 'right';
    // no intervalo as bolas nunca caem: mostra as vagas, porque dá para entrar no meio da fase
    const vagas = `Jogadores: ${viewers.filter(b => !b.streamer).length}/${maxViewers}`;
    ctx.fillText(modoIntervalo ? vagas : `Bolas no ar: ${noAr}/${viewers.length}`, W - 20, 30);
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
}

// Botão de som (topo direito, ao lado das bolas) e a barra de volume quando o mouse passa por cima
function desenharBotaoSom() {
  if (estado === 'menu') return;
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

// Contagem regressiva antes da partida
function desenharContagem() {
  if (estado !== 'contagem') return;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(contagemTexto, W / 2, H / 2);
  ctx.textAlign = 'left';
}

// Desenho de um quadro completo: uma função por parte da tela, de trás para a frente
function desenhar(agora) {
  desenharFundo(agora);
  desenharTijolos(agora);
  desenharParedes();
  desenharChao();
  desenharRaquete(agora);
  desenharCamposGravidade(agora);
  desenharCopias(agora);
  desenharBolas(agora);
  desenharExtrasNatal(agora);
  desenharExtrasAnoNovo(agora);
  desenharRaiosChoque();
  desenharAvisos(agora);
  desenharItens();
  desenharExplosoes(agora);
  desenharLobby(agora);
  desenharTextos(agora);
  desenharBotaoSom();
  desenharContagem();
  if (estado === 'pausa') desenharRankingPausa(agora);
}

// Modo intervalo: ranking entre as fases (top 10, pontos de todas as fases) com a contagem em cima.
// Cabe dentro da tela do jogo.
function desenharRankingPausa(agora) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, W, H);

  const lista = viewers.filter(b => !b.streamer).slice().sort((a, b) => b.pontos - a.pontos).slice(0, 10);
  const cx = W / 2;
  const caixaW = 560;
  const linhaH = 38;
  const caixaH = 150 + Math.max(1, lista.length) * linhaH + (ausentesFase.length ? 34 : 0);
  const x = cx - caixaW / 2;
  const y = Math.max(10, (H - caixaH) / 2);

  ctx.fillStyle = 'rgba(28, 28, 34, 0.95)';
  ctx.fillRect(x, y, caixaW, caixaH);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, caixaW, caixaH);

  // contagem para a próxima fase (em cima do ranking)
  const falta = Math.max(0, Math.ceil((pausaAte - agora) / 1000));
  const proxima = FASES[proximaFaseLiberada(faseIndex)].nome; // a mesma conta da troca de fase (pula as escondidas)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${proxima} em ${falta} s`, cx, y + 34);
  // barrinha do tempo
  const f = Math.max(0, Math.min(1, (pausaAte - agora) / PAUSA_RANKING));
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(x + 40, y + 46, caixaW - 80, 6);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(x + 40, y + 46, (caixaW - 80) * f, 6);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`${FASES[faseIndex].nome} concluída - Ranking`, cx, y + 88);

  // top 10: 1º ouro, 2º prata, 3º bronze
  const CORES_PODIO = ['#facc15', '#e2e8f0', '#f59e0b'];
  ctx.font = '20px sans-serif';
  if (lista.length === 0) {
    ctx.fillStyle = '#aaa';
    ctx.fillText('Ninguém entrou ainda: digite !entrar', cx, y + 130);
  }
  lista.forEach((b, i) => {
    const ly = y + 128 + i * linhaH;
    if (i < 3) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.fillRect(x + 20, ly - 26, caixaW - 40, linhaH - 4);
    }
    ctx.fillStyle = i < 3 ? CORES_PODIO[i] : '#ffffff';
    ctx.font = i < 3 ? 'bold 20px sans-serif' : '20px sans-serif';
    ctx.textAlign = 'left';
    const marca = i < 3 && b.pontos > 0 ? MEDALHAS[i] : `${i + 1}º`;
    let nome = b.nome;
    while (ctx.measureText(`${marca}  ${nome}`).width > caixaW - 160 && nome.length > 3) nome = nome.slice(0, -2);
    if (nome !== b.nome) nome += '…';
    ctx.fillText(`${marca}  ${nome}`, x + 36, ly);
    ctx.textAlign = 'right';
    ctx.fillText(`${b.pontos} pts`, x + caixaW - 36, ly);
  });

  // quem ficou ausente nesta fase (tinha poder e não usou nenhum): perdeu os pontos da fase
  if (ausentesFase.length) {
    const nomes = ausentesFase.map(a => a.perdeu ? `${a.nome} (-${a.perdeu})` : a.nome);
    let texto = 'Ausentes: ' + nomes.join(', ');
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    while (ctx.measureText(texto).width > caixaW - 40 && texto.length > 20) texto = texto.slice(0, -2);
    if (texto.length < ('Ausentes: ' + nomes.join(', ')).length) texto += '…';
    ctx.fillStyle = '#f97316';
    ctx.fillText(texto, cx, y + caixaH - 18);
  }
  ctx.textAlign = 'left';
}
