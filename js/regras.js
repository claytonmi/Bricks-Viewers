// ===== Regras da partida =====
// Montar a fase, entrada de viewers, comandos do chat, pontos e fim de jogo.

// Monta os tijolos da fase atual (sem os que encostam nas paredes)
function montarFase() {
  tijolos = [];
  itensCaindo = [];
  explosoes = [];
  camposGrav = [];
  raiosChoque = [];
  copias = [];
  paredesAtuais = FASES[faseIndex].paredes || [];
  chuvaRestante = 0;
  chefaoCaiu = false;
  // Fase com chuva: começa sem tijolos; eles caem do céu (ver atualizarChuva).
  // No lobby cai pelo total da fase; no início da partida o total se ajusta aos jogadores (ajustarChuva).
  if (FASES[faseIndex].chuva) {
    chuvaRestante = FASES[faseIndex].chuva.total;
    chuvaItens = Math.floor(chuvaRestante * ITENS_PORCENTO);
    proximaGota = 0;
    tijolosVivos = 0;
    return;
  }
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
  // Itens: sorteia 20% dos tijolos da fase (o tipo do item é sorteado quando o tijolo quebra)
  const ordem = tijolos.map((_, i) => i);
  for (let i = ordem.length - 1; i > 0; i--) { // embaralha (Fisher-Yates)
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  ordem.slice(0, Math.floor(tijolos.length * ITENS_PORCENTO)).forEach(i => { tijolos[i].item = true; });
  tijolosVivos = tijolos.length;
}

// Total da chuva pelo número de jogadores: até 10 → CHUVA_MIN; 100 → total da fase (no meio, proporcional)
function totalChuva(jogadores) {
  const max = FASES[faseIndex].chuva.total;
  const f = Math.max(0, Math.min(1, (jogadores - 10) / 90));
  return Math.round(CHUVA_MIN + (max - CHUVA_MIN) * f);
}

// No início da partida: acerta quantos tijolos ainda caem (descontando os que já caíram no lobby)
function ajustarChuva() {
  if (!FASES[faseIndex].chuva) return;
  const total = totalChuva(viewers.length);
  const jaCairam = FASES[faseIndex].chuva.total - chuvaRestante;
  chuvaRestante = Math.max(0, total - jaCairam);
  const comItem = tijolos.filter(t => t.item).length;
  chuvaItens = Math.min(chuvaRestante, Math.max(0, Math.floor(total * ITENS_PORCENTO) - comItem));
}

// ----- Chuva de tijolos (fase com "chuva") -----
// Cada coluna é uma pilha de até CHUVA_LINHAS tijolos, apoiada numa linha invisível
// (a mesma altura da última linha das fases normais). O tijolo cai até encostar no de
// baixo; se o de baixo quebra, os de cima descem e se ajustam. Nunca um entra no outro.

const CHUVA_BASE_Y = TIJOLO_TOPO + (CHUVA_LINHAS - 1) * 30; // topo do tijolo de baixo da pilha

// Roda a cada quadro (lobby, contagem e partida): solta tijolos novos e faz as pilhas descerem
function atualizarChuva(dt, agora) {
  if (!FASES[faseIndex].chuva) return;
  tijolos = tijolos.filter(t => t.vivo); // tira os quebrados (a lista não cresce à toa)

  // pilhas por coluna, de baixo para cima (o chefão fica por cima de tudo e é tratado à parte)
  const colunas = Array.from({ length: 16 }, () => []);
  for (const t of tijolos) if (!t.chefao) colunas[t.col].push(t);
  for (const pilha of colunas) {
    pilha.sort((a, b) => b.y - a.y);
    pilha.forEach((t, i) => {
      const alvo = CHUVA_BASE_Y - i * 30;          // lugar dele na pilha
      const limite = i > 0 ? pilha[i - 1].y - 30 : alvo; // nunca encosta dentro do de baixo
      const novoY = Math.min(t.y + CHUVA_VEL * dt, alvo, limite);
      // bola logo embaixo: o tijolo espera ela sair (não esmaga a bola contra o tijolo de baixo)
      if (novoY > t.y && bolaEmbaixo(t, novoY)) return;
      t.y = novoY;
    });
  }

  // chefão: ocupa 2 colunas e se apoia no tijolo mais alto delas (ou na linha invisível)
  const chefao = tijolos.find(t => t.chefao);
  if (chefao) {
    let alvo = CHUVA_BASE_Y + TIJOLO_H - CHEFAO_H;
    for (const pilha of [colunas[chefao.col], colunas[chefao.col + 1]]) {
      if (pilha.length) alvo = Math.min(alvo, pilha[pilha.length - 1].y - (30 - TIJOLO_H) - CHEFAO_H);
    }
    const novoY = Math.min(chefao.y + CHUVA_VEL * dt, alvo);
    if (!(novoY > chefao.y && bolaEmbaixo(chefao, novoY))) chefao.y = Math.max(chefao.y, novoY);
  } else if (estado === 'jogando' && chuvaRestante <= 0 && !chefaoCaiu && tijolosVivos <= CHEFAO_QUANDO) {
    soltarChefao(colunas, agora);
  }

  // tijolo novo: quanto mais tijolos na tela, mais devagar a chuva
  if (chuvaRestante <= 0 || agora < proximaGota) return;
  const cheio = tijolos.length / (16 * CHUVA_LINHAS); // 0 = vazia, 1 = cheia
  const livres = colunas
    .map((pilha, col) => ({ pilha, col }))
    // coluna com espaço e com o tijolo de cima já longe do topo (não nasce um dentro do outro)
    .filter(c => c.pilha.length < CHUVA_LINHAS &&
                 (c.pilha.length === 0 || c.pilha[c.pilha.length - 1].y >= 30 - TIJOLO_H));
  if (livres.length === 0) return;
  const { col } = livres[Math.floor(Math.random() * livres.length)];
  const vidas = FASES[faseIndex].padrao.join('').replace(/\./g, '');
  const item = Math.random() < chuvaItens / chuvaRestante; // sorteio que fecha em 20% no total
  if (item) chuvaItens--;
  tijolos.push({
    x: col * CELULA_W + (CELULA_W - TIJOLO_W) / 2,
    y: -TIJOLO_H,
    w: TIJOLO_W,
    h: TIJOLO_H,
    vida: Number(vidas[Math.floor(Math.random() * vidas.length)]),
    vivo: true,
    item,
    cor: null,
    col
  });
  chuvaRestante--;
  tijolosVivos++;
  proximaGota = agora + CHUVA_RAPIDA + (CHUVA_LENTA - CHUVA_RAPIDA) * cheio * cheio;
}

// Tijolo chefão: grande e dourado, cai nas 2 colunas vizinhas com menos tijolos (todo mundo junto num alvo só)
function soltarChefao(colunas, agora) {
  let menor = Infinity, opcoes = [];
  for (let col = 0; col < 15; col++) {
    const n = colunas[col].length + colunas[col + 1].length;
    if (n < menor) { menor = n; opcoes = []; }
    if (n === menor) opcoes.push(col);
  }
  const col = opcoes[Math.floor(Math.random() * opcoes.length)];
  tijolos.push({
    x: col * CELULA_W + (CELULA_W - TIJOLO_W) / 2,
    y: -CHEFAO_H,
    w: CELULA_W + TIJOLO_W,
    h: CHEFAO_H,
    vida: CHEFAO_VIDA,
    vivo: true,
    item: false,
    cor: '#facc15',
    col,
    chefao: true
  });
  chefaoCaiu = true;
  tijolosVivos++;
  anunciar('Tijolo chefão!', agora);
}

// Texto grande no meio da tela por 2,5 s ("Tijolo chefão!", "Multibola!")
function anunciar(texto, agora) {
  anuncio = texto;
  anuncioAte = agora + 2500;
}

// Alguma bola em jogo encostaria no tijolo se ele descesse até novoY? (só bolas abaixo do meio dele)
function bolaEmbaixo(t, novoY) {
  const embaixo = (x, y, r) => y > t.y + t.h / 2 &&
    x > t.x - r && x < t.x + t.w + r &&
    y - r < novoY + t.h + 1;
  // campo do !gravity: espera acima do giro inteiro, para as bolas presas girarem livres
  return viewers.concat(copias).some(b => b.estado !== 'caiu' && embaixo(b.x, b.y, RAIO)) ||
    camposGrav.some(c => embaixo(c.x, c.y, GRAV_PERTO + RAIO));
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
    batidas: 0,     // encostos em tijolo desde a última bomba (a cada 10 ganha 1, até 2 guardadas)
    bombas: 0,
    batidasGrav: 0,  // encostos em tijolo desde o último !gravity (com 12 ganha o poder)
    gravidade: false, // tem o !gravity pronto (só 1, não acumula)
    presoEm: null,    // campo do !gravity que está segurando esta bola
    batidasChoque: 0, // encostos em tijolo desde o último !shock (com 13 ganha o poder)
    choque: false,    // tem o !shock pronto (só 1, não acumula)
    choqueAte: 0,     // até quando a bola está eletrizada (atordoa as bolas perto)
    atordoadaAte: 0,  // até quando a bola está atordoada (1% da velocidade)
    imuneChoqueAte: 0, // depois de atordoada, fica imune a outro !shock até aqui
    poderAte: 0,      // até quando o poder em uso está ativo (enquanto isso, os outros poderes não pegam nela)
    fila: [],         // poderes pedidos enquanto outro estava ativo (rodam um depois do outro)
    brilhoBombaAte: 0, // brilho vermelho depois de usar !bomb
    aviso: '',         // "Fulano usou !bomb" em cima da bola (o chat aprende vendo os outros)
    avisoAte: 0
  });
  atualizarContador();
}

// Recebe uma mensagem do chat (ou do teste) e age conforme o comando
function processarComando(usuario, mensagem) {
  // 7TV/Chatterino põem um caractere invisível no fim de mensagens repetidas: tira antes de ler
  const texto = String(mensagem || '').replace(/[\u{E0000}​-‍⁠﻿]/gu, ' ');
  const partes = texto.trim().split(/\s+/);
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
  } else if (PODERES.includes(cmd)) {
    // !speed, !bomb, !gravity, !shock: com outro poder ativo, entra na fila
    if (estado !== 'jogando') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b || !temPoder(b, cmd)) return;
    if (podeUsarAgora(b, agora)) usarPoder(b, cmd, agora);
    else if (!b.fila.includes(cmd)) b.fila.push(cmd); // repetido na fila não entra
  }
}

const PODERES = ['!speed', '!bomb', '!gravity', '!shock'];

// O viewer tem a carga desse poder?
function temPoder(b, cmd) {
  if (cmd === '!speed') return b.carga >= batidasPara(CARGA_SPEED);
  if (cmd === '!bomb') return b.bombas > 0;
  if (cmd === '!gravity') return b.gravidade;
  if (cmd === '!shock') return b.choque;
  return false;
}

// Bola com algum poder ativo (!speed, !bomb, !gravity ou !shock): os poderes dos outros não pegam nela
function usandoPoder(b, agora) {
  return agora < b.poderAte;
}

// Pode soltar um poder agora? (bola em jogo, nenhum poder ativo, não presa num campo)
function podeUsarAgora(b, agora) {
  return b.estado === 'jogando' && !usandoPoder(b, agora) && !b.presoEm;
}

// Gasta a carga e solta o poder
function usarPoder(b, cmd, agora) {
  if (cmd === '!speed') {
    b.carga = 0;
    b.velExtraAte = agora + DURACAO_SPEED;
    b.poderAte = b.velExtraAte;
  } else if (cmd === '!bomb') {
    b.bombas--;
    b.poderAte = agora + BOMBA_TEMPO;
    explodirBomba(b, agora);
  } else if (cmd === '!gravity') {
    b.gravidade = false;
    b.poderAte = agora + GRAV_TEMPO;
    criarCampoGravidade(b, agora);
  } else if (cmd === '!shock') {
    b.choque = false;
    b.choqueAte = agora + CHOQUE_TEMPO;
    b.poderAte = b.choqueAte;
  }
  mostrarAviso(b, cmd, agora);
}

// Fila: quando o poder anterior acaba, solta o próximo pedido (se ainda tiver a carga)
function atualizarFilas(agora) {
  for (const b of viewers) {
    if (b.fila.length === 0 || !podeUsarAgora(b, agora)) continue;
    const cmd = b.fila.shift();
    if (temPoder(b, cmd)) usarPoder(b, cmd, agora);
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
  b.avisoAte = agora + DURACAO_AVISO + AVISO_SOME;
}

// Regras a cada quadro: move as bolas e checa o ponto do streamer
function atualizarJogo(dt, agora) {
  for (const b of viewers) {
    if (b.estado !== 'lobby' && !b.presoEm) atualizarBola(b, dt, agora); // presa: o campo move
  }
  // cópias do multibola: andam como bolas normais e somem ao cair ou quando o tempo acaba
  for (const c of copias) atualizarBola(c, dt, agora);
  copias = copias.filter(c => c.estado === 'jogando' && agora < c.ate);
  atualizarCamposGravidade(dt, agora);
  atualizarChoques(agora);
  atualizarFilas(agora);

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

  // na chuva, só acaba depois do último tijolo e do chefão
  const chefaoFalta = FASES[faseIndex].chuva && !chefaoCaiu;
  if (tijolosVivos === 0 && chuvaRestante === 0 && !chefaoFalta) finalizar();
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
  ajustarChuva(); // fase com chuva: total de tijolos conforme os jogadores
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
