// ===== Regras da partida =====
// Montar a fase, entrada de viewers, comandos do chat, pontos e fim de jogo.

// Monta os tijolos da fase atual (sem os que encostam nas paredes)
function montarFase() {
  tijolos = [];
  itensCaindo = [];
  explosoes = [];
  paredesAtuais = FASES[faseIndex].paredes || [];
  FASES[faseIndex].padrao.forEach((linha, r) => {
    [...linha].forEach((c, col) => {
      if (c === '.') return;
      const t = {
        x: col * CELULA_W + (CELULA_W - TIJOLO_W) / 2,
        y: TIJOLO_TOPO + r * 30,
        w: TIJOLO_W,
        h: TIJOLO_H,
        vida: Number(c),
        vivo: true,
        item: false,
        cor: FASES[faseIndex].cores ? FASES[faseIndex].cores[r % FASES[faseIndex].cores.length] : null
      };
      // Tijolo que encosta na parede não nasce (deixa espaço para a bola passar)
      if (tocaParede(t, RAIO + 6)) return;
      tijolos.push(t);
    });
  });
  // Itens: só com "Streamer pontua" marcado, sorteia 20% dos tijolos da fase
  if (streamerPontua) {
    const ordem = tijolos.map((_, i) => i);
    for (let i = ordem.length - 1; i > 0; i--) { // embaralha (Fisher-Yates)
      const j = Math.floor(Math.random() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    ordem.slice(0, Math.floor(tijolos.length * ITENS_PORCENTO)).forEach(i => { tijolos[i].item = true; });
  }
  tijolosVivos = tijolos.length;
}

// Confere se um tijolo está perto de alguma parede (retângulo ou segmento)
function tocaParede(t, margem) {
  return paredesAtuais.some(p => {
    if (p.x1 === undefined) {
      return t.x < p.x + p.w + margem && t.x + t.w > p.x - margem &&
             t.y < p.y + p.h + margem && t.y + t.h > p.y - margem;
    }
    // segmento inclinado: confere alguns pontos ao longo da linha
    const m = margem + p.espessura / 2;
    const passos = Math.ceil(Math.hypot(p.x2 - p.x1, p.y2 - p.y1) / 3);
    for (let i = 0; i <= passos; i++) {
      const px = p.x1 + (p.x2 - p.x1) * i / passos;
      const py = p.y1 + (p.y2 - p.y1) * i / passos;
      if (px > t.x - m && px < t.x + t.w + m && py > t.y - m && py < t.y + t.h + m) return true;
    }
    return false;
  });
}

// Cria a bola de um viewer no lobby
function entrar(nome) {
  if (viewers.length >= maxViewers) return;
  if (viewers.some(b => b.nome === nome)) return;
  const p = posicaoSlot(viewers.length);
  viewers.push({
    nome,
    cor: '#ffffff',
    x: p.x,
    y: p.y,
    vx: 0,
    vy: 0,
    estado: 'lobby',
    esperaAte: 0,
    velExtraAte: 0,
    pontos: 0,
    carga: 0,
    corAteT: 0,
    batidas: 0,     // vezes que a bola encostou em tijolo (a cada 10 ganha 1 bomba)
    bombas: 0,
    brilhoBombaAte: 0, // brilho vermelho depois de usar !bomb
    aviso: '',         // "Fulano usou !bomb" em cima da bola (o chat aprende vendo os outros)
    avisoAte: 0
  });
  atualizarContador();
}

// Recebe uma mensagem do chat (ou do teste) e age conforme o comando
function processarComando(usuario, mensagem) {
  const partes = String(mensagem || '').trim().split(/\s+/);
  const cmd = (partes[0] || '').toLowerCase();
  const agora = performance.now();

  if (cmd === '!entrar') {
    if (estado === 'lobby') entrar(usuario);
  } else if (corDoComando(partes)) {
    // Cor da bola: !azul, !#ff8800, !cor 255 136 0... (pode trocar durante a partida)
    if (estado === 'menu' || estado === 'fim') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b || agora < b.corAteT) return; // cooldown de 5 s entre trocas
    b.cor = corDoComando(partes);
    b.corAteT = agora + COOLDOWN_COR;
  } else if (cmd === '!speed') {
    if (estado !== 'jogando') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b || b.estado === 'caiu') return;
    if (b.carga >= CARGA_SPEED && agora >= b.velExtraAte) {
      b.velExtraAte = agora + DURACAO_SPEED;
      b.carga = 0;
      mostrarAviso(b, '!speed', agora);
    }
  } else if (cmd === '!bomb') {
    // Gasta 1 bomba (ganha 1 a cada 10 tijolos) e empurra as bolas perto
    if (estado !== 'jogando') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b || b.estado !== 'jogando' || b.bombas <= 0) return;
    b.bombas--;
    explodirBomba(b, agora);
    mostrarAviso(b, '!bomb', agora);
  }
}

// Cor pedida no chat: !azul, !#ff8800, !#f80, !cor #ff8800, !cor 255 136 0 (null se não for cor)
function corDoComando(partes) {
  const cmd = (partes[0] || '').toLowerCase();
  if (!cmd.startsWith('!')) return null;
  if (CORES[cmd.slice(1)]) return CORES[cmd.slice(1)];
  if (cmd.startsWith('!#')) return corHex(cmd.slice(1)); // atalho exige o # (senão !bad viraria cor)
  if (cmd !== '!cor') return null;
  const resto = partes.slice(1).map(p => p.toLowerCase());
  if (CORES[resto[0]]) return CORES[resto[0]];
  if (resto.length === 1 && !resto[0].includes(',')) return corHex(resto[0]);
  // !cor 255 136 0 (também aceita 255,136,0)
  const n = resto.join(' ').split(/[\s,]+/).filter(Boolean);
  if (n.length !== 3 || !n.every(v => /^\d{1,3}$/.test(v) && Number(v) <= 255)) return null;
  return `rgb(${n.join(', ')})`;
}

// "#ff8800", "ff8800" ou "#f80" → "#ff8800" (null se não for hex)
function corHex(txt) {
  const h = String(txt || '').replace(/^#/, '');
  if (/^[0-9a-f]{6}$/.test(h)) return '#' + h;
  if (/^[0-9a-f]{3}$/.test(h)) return '#' + [...h].map(c => c + c).join('');
  return null;
}

// Texto "Fulano usou !comando" que sobe e some em cima da bola
function mostrarAviso(b, cmd, agora) {
  b.aviso = `${b.nome} usou ${cmd}`;
  b.avisoAte = agora + DURACAO_AVISO;
}

// Regras a cada quadro: move as bolas e checa o ponto do streamer
function atualizarJogo(dt, agora) {
  for (const b of viewers) {
    if (b.estado !== 'lobby') atualizarBola(b, dt, agora);
  }

  // Streamer: a cada 5 s, +1 ponto se mais de 50% das bolas estiverem no ar
  // (os viewers não perdem ponto quando o streamer falha)
  if (agora - ultimoCheckT >= INTERVALO_STREAMER) {
    ultimoCheckT = agora;
    const total = viewers.length;
    const noAr = viewers.filter(b => b.estado === 'jogando').length;
    if (streamerPontua && total > 0 && noAr > total / 2) {
      streamerPts++;
      paddleBrilhoAte = agora + 600; // raquete brilha quando o streamer ganha ponto
    }
  }

  atualizarItens(dt, agora);

  if (tijolosVivos === 0) finalizar();
}

// Vai da tela de menu para o lobby (viewers entram com !entrar)
function iniciarPartida() {
  maxViewers = Number(document.getElementById('qtd').value);
  streamerPontua = document.getElementById('pontuaStreamer').checked; // antes de montar, pois define os itens
  montarFase();
  viewers = [];
  streamerPts = 0;
  paddleX = W / 2;
  estado = 'lobby';
  tocarMusica();
  document.getElementById('menu').classList.add('escondido');
  document.getElementById('ranking').classList.add('escondido');
  atualizarContador();
}

// Volta para a configuração (o chat continua conectado)
function voltarMenu() {
  estado = 'menu';
  pararMusica();
  viewers = [];
  document.getElementById('ranking').classList.add('escondido');
  document.getElementById('menu').classList.remove('escondido');
  atualizarContador();
}

// Contagem regressiva ao clicar em Pronto
function iniciarContagem() {
  if (viewers.length === 0) {
    aviso = 'Espera pelo menos 1 viewer digitar !entrar';
    avisoAte = performance.now() + 3000;
    return;
  }
  estado = 'contagem';
  contagemFila = [['Iniciando jogo...', 1200], ['3', 800], ['2', 800], ['1', 800], ['Valendo..', 700]];
  contagemIdx = 0;
  contagemTexto = contagemFila[0][0];
  contagemFim = performance.now() + contagemFila[0][1];
}

function atualizarContagem(agora) {
  if (agora < contagemFim) return;
  contagemIdx++;
  if (contagemIdx >= contagemFila.length) {
    iniciarJogo(agora);
    return;
  }
  contagemTexto = contagemFila[contagemIdx][0];
  contagemFim = agora + contagemFila[contagemIdx][1];
}

// Solta todas as bolas
function iniciarJogo(agora) {
  estado = 'jogando';
  ultimoCheckT = agora;
  for (const b of viewers) {
    b.estado = 'jogando';
    lancar(b);
  }
}

// Mostra o ranking final (viewers e, se marcado, o streamer)
function finalizar() {
  estado = 'fim';
  pararMusica();
  const lista = viewers.map(b => ({ nome: b.nome, pontos: b.pontos, streamer: false }));
  if (streamerPontua) lista.push({ nome: 'Streamer', pontos: streamerPts, streamer: true });
  lista.sort((a, b) => b.pontos - a.pontos);

  const ol = document.getElementById('rankingLista');
  ol.innerHTML = '';
  lista.forEach((j, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}º  ${j.nome}  -  ${j.pontos} pts`; // textContent: nome vem do chat
    if (i < 3) li.classList.add('top3');
    if (j.streamer) li.classList.add('streamer');
    ol.appendChild(li);
  });
  document.getElementById('ranking').classList.remove('escondido');
}

// Atualiza o contador de viewers (campo opcional na página)
function atualizarContador() {
  const el = document.getElementById('contador');
  if (el) el.textContent = `Viewers: ${viewers.length}/${maxViewers}`;
}
