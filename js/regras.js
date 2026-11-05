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
  esteiraDesloc = FASES[faseIndex].padrao.map(() => 0);
  proximaGota = 0;
  resetarNatal();
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
        cor: corDoTijolo(r),
        linha: r, // na esteira, cada linha anda numa direção
        slot: col // na esteira, o lugar dele na linha (para achar os lugares vazios)
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

// Cor do tijolo da linha r: em ciclo pelas cores da fase (no Natal, cada presente sorteia a sua)
function corDoTijolo(r) {
  const f = FASES[faseIndex];
  if (!f.cores) return null;
  if (f.natal) return f.cores[Math.floor(Math.random() * f.cores.length)];
  return f.cores[r % f.cores.length];
}

// Total pelo número de jogadores: até 15 → mínimo; 100 → máximo (no meio, proporcional)
function totalPorJogadores(min, max, jogadores) {
  const f = Math.max(0, Math.min(1, (jogadores - CHUVA_MIN_JOGADORES) / (100 - CHUVA_MIN_JOGADORES)));
  return Math.round(min + (max - min) * f);
}

// Total da chuva: até 15 jogadores → CHUVA_MIN; 100 → total da fase
function totalChuva(jogadores) {
  return totalPorJogadores(CHUVA_MIN, FASES[faseIndex].chuva.total, jogadores);
}

// Esteira, no início da partida: quantos tijolos ainda vão entrar pela borda (total menos os que já estão)
function ajustarEsteira() {
  const esteira = FASES[faseIndex].esteira;
  if (!esteira || !esteira.total) return;
  const total = totalPorJogadores(ESTEIRA_MIN, esteira.total, viewers.length);
  chuvaRestante = Math.max(0, total - tijolosVivos);
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

// Fases que terminam com o tijolo chefão (a partida só acaba depois que ele quebra)
function faseTemChefao() {
  const f = FASES[faseIndex];
  return !!(f.chuva || f.esteira || f.natal || (modoIntervalo && f.chefaoIntervalo));
}

// ----- Chefão na parede (modo intervalo, fase com "chefaoIntervalo") -----
// Quando todos os tijolos quebram, o chefão cai do teto no centro da parede indicada e fica parado em cima dela.
function atualizarChefaoParede(dt, agora) {
  const cfg = FASES[faseIndex].chefaoIntervalo;
  if (!modoIntervalo || !cfg) return;
  const p = paredesAtuais[cfg.parede];
  if (!p) return;
  const chefao = tijolos.find(t => t.vivo && t.chefao);
  if (chefao) {
    const topo = p.x1 !== undefined ? Math.min(p.y1, p.y2) - p.espessura / 2 : p.y;
    const alvo = topo - CHEFAO_H;
    if (chefao.y < alvo) {
      const novoY = Math.min(chefao.y + CHUVA_VEL * dt, alvo);
      if (!bolaEmbaixo(chefao, novoY)) chefao.y = novoY; // bola embaixo: espera ela sair
    }
  } else if (estado === 'jogando' && !chefaoCaiu && tijolosVivos === 0) {
    const w = CELULA_W + TIJOLO_W;
    const centro = p.x1 !== undefined ? (p.x1 + p.x2) / 2 : p.x + p.w / 2;
    tijolos.push({
      x: centro - w / 2, y: -CHEFAO_H, w, h: CHEFAO_H,
      vida: CHEFAO_PAREDE_VIDA, vidaMax: CHEFAO_PAREDE_VIDA,
      vivo: true, item: false, cor: '#facc15', chefao: true
    });
    chefaoCaiu = true;
    tijolosVivos++;
    anunciar('Tijolo chefão!', agora);
  }
}

// ----- Esteira (fase com "esteira") -----
// Cada linha de tijolos anda para um lado (pares para a direita, ímpares para a esquerda) e o tijolo
// que sai por uma borda volta pela outra. No fim, o chefão desce e anda de um lado para o outro.

const ESTEIRA_RITMO = [1, -1.3, 0.8, -1.1, 1.2, -0.9]; // velocidade e sentido de cada linha

// Roda a cada quadro (lobby, contagem e partida)
function atualizarEsteira(dt, agora) {
  const esteira = FASES[faseIndex].esteira;
  if (!esteira) return;
  const velLinha = r => esteira.vel * ESTEIRA_RITMO[r % ESTEIRA_RITMO.length];
  esteiraDesloc = esteiraDesloc.map((d, r) => d + velLinha(r) * dt);
  for (const t of tijolos) {
    if (!t.vivo || t.chefao) continue;
    const vel = velLinha(t.linha);
    t.x = ((t.x + vel * dt) % W + W) % W;
    empurrarBolas(t, Math.sign(vel));
  }
  if (estado === 'jogando') reporEsteira(agora);

  const chefao = tijolos.find(t => t.vivo && t.chefao);
  if (chefao) {
    if (chefao.y < CHEFAO_ESTEIRA_Y) {
      // descendo do teto: espera se tiver bola embaixo
      const novoY = Math.min(chefao.y + CHUVA_VEL * dt, CHEFAO_ESTEIRA_Y);
      if (!bolaEmbaixo(chefao, novoY)) chefao.y = novoY;
    } else {
      // vai e volta, mais rápido conforme perde vida
      const vel = CHEFAO_ESTEIRA_VEL * (1 + 2 * (1 - chefao.vida / CHEFAO_VIDA));
      chefao.x += chefao.dir * vel * dt;
      if (chefao.x < 0) { chefao.x = 0; chefao.dir = 1; }
      if (chefao.x > W - chefao.w) { chefao.x = W - chefao.w; chefao.dir = -1; }
      empurrarBolas(chefao, chefao.dir);
    }
  } else if (estado === 'jogando' && !chefaoCaiu && chuvaRestante <= 0 && tijolosVivos <= CHEFAO_QUANDO) {
    const w = CELULA_W + TIJOLO_W;
    tijolos.push({
      x: Math.random() * (W - w), y: -CHEFAO_H, w, h: CHEFAO_H,
      vida: CHEFAO_VIDA, vivo: true, item: false, cor: '#facc15',
      chefao: true, dir: Math.random() < 0.5 ? -1 : 1
    });
    chefaoCaiu = true;
    tijolosVivos++;
    anunciar('Tijolo chefão!', agora);
  }
}

// Esteira: os tijolos que faltam entram pela borda da tela, no lugar vazio de uma linha que está
// passando pela borda (nunca em cima de uma bola). Quanto mais tijolos na tela, mais devagar.
function reporEsteira(agora) {
  if (chuvaRestante <= 0 || agora < proximaGota) return;
  const f = FASES[faseIndex];
  const opcoes = [];
  esteiraDesloc.forEach((d, r) => {
    for (let k = 0; k < 16; k++) {
      const x = ((k * CELULA_W + (CELULA_W - TIJOLO_W) / 2 + d) % W + W) % W;
      if (x < W - TIJOLO_W) continue; // só o lugar que está atravessando a borda
      if (tijolos.some(t => t.vivo && !t.chefao && t.linha === r && t.slot === k)) continue;
      const novo = { x, y: TIJOLO_TOPO + r * 30, w: TIJOLO_W, h: TIJOLO_H };
      const temBola = viewers.concat(copias).some(b => {
        if (b.estado !== 'jogando') return false;
        const tx = xDoTijolo(novo, b.x);
        const cx = Math.max(tx, Math.min(b.x, tx + novo.w));
        const cy = Math.max(novo.y, Math.min(b.y, novo.y + novo.h));
        return (b.x - cx) ** 2 + (b.y - cy) ** 2 < (RAIO + 4) ** 2;
      });
      if (!temBola) opcoes.push({ ...novo, r, k });
    }
  });
  if (opcoes.length === 0) return;
  const o = opcoes[Math.floor(Math.random() * opcoes.length)];
  const vidas = f.padrao.join('').replace(/\./g, '');
  tijolos.push({
    x: o.x, y: o.y, w: o.w, h: o.h,
    vida: Number(vidas[Math.floor(Math.random() * vidas.length)]),
    vivo: true,
    item: Math.random() < ITENS_PORCENTO,
    cor: f.cores ? f.cores[o.r % f.cores.length] : null,
    linha: o.r,
    slot: o.k,
    surgiu: agora // efeito de aparecer (render)
  });
  chuvaRestante--;
  tijolosVivos++;
  const cheio = tijolosVivos / (16 * f.padrao.length);
  proximaGota = agora + CHUVA_RAPIDA + (CHUVA_LENTA - CHUVA_RAPIDA) * cheio * cheio;
}

// Tijolo andando encostou numa bola: empurra a bola para fora (sem dano; a batida só conta quando
// a bola vai contra o tijolo). Se a bola ficaria fora da tela, sai por cima ou por baixo do tijolo.
function empurrarBolas(t, dir) {
  for (const b of viewers.concat(copias)) {
    if (b.estado !== 'jogando' || b.presoEm) continue;
    const tx = xDoTijolo(t, b.x);
    const cx = Math.max(tx, Math.min(b.x, tx + t.w));
    const cy = Math.max(t.y, Math.min(b.y, t.y + t.h));
    if ((b.x - cx) ** 2 + (b.y - cy) ** 2 >= RAIO * RAIO) continue;
    const nx = dir > 0 ? tx + t.w + RAIO : tx - RAIO;
    if (nx >= RAIO && nx <= W - RAIO) {
      b.x = nx;
      b.vx = dir * Math.abs(b.vx);
    } else if (b.y < t.y + t.h / 2) {
      b.y = t.y - RAIO;
      b.vy = -Math.abs(b.vy);
    } else {
      b.y = t.y + t.h + RAIO;
      b.vy = Math.abs(b.vy);
    }
  }
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
// (modo intervalo: dá para entrar a qualquer momento; durante a fase, a bola já sai jogando)
function entrar(nome, streamer = false) {
  const jogadores = viewers.filter(b => !b.streamer).length; // a bola do streamer não ocupa vaga
  if (!streamer && jogadores >= maxViewers) return;
  if (viewers.some(b => b.nome.toLowerCase() === String(nome).toLowerCase())) return;
  const p = posicaoSlot(viewers.length);
  const b = {
    streamer,        // modo intervalo: bola do streamer (fora do ranking e da regra do ausente)
    pontosFase: 0,   // modo intervalo: pontos feitos na fase atual (o ausente perde estes)
    usouNaFase: false, // modo intervalo: usou algum poder na fase atual
    poderDesde: 0,   // modo intervalo: desde quando tem um poder pronto nesta fase (0 = nenhum)
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
    efeitoAte: 0,     // sofreu o poder de outra bola: só usa poder de novo a partir daqui
    impulsoAte: 0,    // empurrada por !bomb: fica mais rápida até aqui
    poderAte: 0,      // até quando o poder em uso está ativo (enquanto isso, os outros poderes não pegam nela)
    fila: [],         // poderes pedidos enquanto outro estava ativo (rodam um depois do outro)
    brilhoBombaAte: 0, // brilho vermelho depois de usar !bomb
    aviso: '',         // "Fulano usou !bomb" em cima da bola (o chat aprende vendo os outros)
    avisoAte: 0
  };
  viewers.push(b);
  // modo intervalo com a fase rolando: nasce no chão, num lugar ao acaso, e já é lançada
  if (modoIntervalo && estado === 'jogando') {
    const agora = performance.now();
    b.x = W * (0.2 + Math.random() * 0.6);
    b.y = PISO_Y - RAIO - 2;
    b.estado = 'jogando';
    lancar(b);
    b.aviso = `${b.nome} entrou`;
    b.avisoAte = agora + DURACAO_AVISO + AVISO_SOME;
  }
  atualizarContador();
}

// Ponto para o viewer (modo intervalo: também guarda os pontos da fase, para a regra do ausente)
function darPontos(b, n) {
  b.pontos += n;
  b.pontosFase = (b.pontosFase || 0) + n;
}

// O viewer tem algum poder pronto para usar?
function temAlgumPoder(b) {
  return PODERES.some(cmd => temPoder(b, cmd));
}

// Modo intervalo: anota desde quando o viewer tem um poder pronto nesta fase. Se ele perdeu o poder
// (o !speed pede mais batidas quando entra gente e passa de 15 jogadores), a contagem recomeça do zero.
function marcarPoderPronto(b, agora) {
  if (!modoIntervalo) return;
  if (!temAlgumPoder(b)) b.poderDesde = 0;
  else if (!b.poderDesde) b.poderDesde = agora;
}

// Recebe uma mensagem do chat (ou do teste) e age conforme o comando
// (autoridade = quem mandou é o streamer ou um moderador)
function processarComando(usuario, mensagem, autoridade = false) {
  // 7TV/Chatterino põem um caractere invisível no fim de mensagens repetidas: tira antes de ler
  const texto = String(mensagem || '').replace(/[\u{E0000}​-‍⁠﻿]/gu, ' ');
  const partes = texto.trim().split(/\s+/);
  const cmd = (partes[0] || '').toLowerCase();
  const agora = performance.now();

  if (cmd === '!voltei') {
    // o mesmo que o botão Voltei, para quando o jogo está no OBS e não dá para clicar
    if (autoridade) pararIntervalo();
  } else if (cmd === '!recomecar' || cmd === '!recomeçar') {
    // aberto pelo link do OBS: começa outro intervalo depois do ranking final, sem precisar clicar
    if (autoridade && modoAutomatico && estado === 'fim') iniciarPartida();
  } else if (cmd === '!mudo' || cmd === '!som') {
    // som por comando, para quando o jogo está no OBS e não dá para clicar no botão
    if (autoridade) definirSom(cmd === '!som');
  } else if (cmd === '!volume') {
    // !volume 30 (de 0 a 100); pedir um volume também tira do mudo
    const v = Number(partes[1]);
    if (autoridade && /^\d{1,3}$/.test(partes[1] || '') && v <= 100) {
      definirVolume(v / 100);
      if (v > 0 && !somLigado) definirSom(true);
    }
  } else if (cmd === '!entrar') {
    // modo intervalo: entra a qualquer momento (no meio da fase, no ranking entre as fases...)
    if (estado === 'lobby' || (modoIntervalo && estado !== 'menu' && estado !== 'fim')) entrar(usuario);
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
    else {
      if (!b.fila.includes(cmd)) b.fila.push(cmd); // repetido na fila não entra
      b.usouNaFase = true; // pediu o poder: está presente, mesmo se a fase acabar antes de ele sair
    }
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

// A bola sofreu o poder de outra (efeito acaba em fimDoEfeito): só usa poder 1,5 s depois disso.
// Se pedir antes, o pedido espera na fila e sai sozinho quando liberar.
function marcarEfeito(b, fimDoEfeito) {
  b.efeitoAte = Math.max(b.efeitoAte, fimDoEfeito + PODER_APOS_EFEITO);
}

// Pode soltar um poder agora? (bola em jogo, nenhum poder ativo, não presa num campo nem atordoada,
// e já passou a espera depois do efeito do poder de outra bola)
function podeUsarAgora(b, agora) {
  return b.estado === 'jogando' && !usandoPoder(b, agora) && !b.presoEm &&
    agora >= b.atordoadaAte && agora >= b.efeitoAte;
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
  b.usouNaFase = true; // modo intervalo: usou poder, não é ausente nesta fase
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

  // Streamer: a cada 7 s, +1 ponto se mais de 50% das bolas estiverem no ar
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
  const chefaoFalta = faseTemChefao() && !chefaoCaiu;
  // Natal: espera também os presentinhos do saco sumirem
  if (tijolosVivos === 0 && chuvaRestante === 0 && !chefaoFalta && !natalPendente()) {
    if (modoIntervalo) terminarFase(agora); // intervalo: ranking e depois a próxima fase
    else finalizar();
  }
}

// Vai da tela de menu para o lobby (viewers entram com !entrar)
function iniciarPartida() {
  if (!faseLiberada(indiceFase)) return; // fase de evento fora do mês dela
  maxViewers = Number(document.getElementById('qtd').value);
  modoIntervalo = document.getElementById('modoIntervalo').checked;
  // antes de montar, pois define os itens (no intervalo o streamer não pontua)
  streamerPontua = !modoIntervalo && document.getElementById('pontuaStreamer').checked;
  faseIndex = indiceFase;
  montarFase();
  viewers = [];
  streamerPts = 0;
  paddleX = W / 2;
  estado = 'lobby';
  // modo intervalo: o streamer já entra como uma bola e a partida começa sozinha em 20 s
  if (modoIntervalo) {
    entrar(nomeStreamer, true);
    viewers[0].cor = '#22d3ee';
    comecaEm = performance.now() + INTERVALO_ESPERA;
  }
  tocarMusica();
  document.getElementById('menu').classList.add('escondido');
  document.getElementById('ranking').classList.add('escondido');
  // botão Voltei só onde dá para clicar; aberto pelo link, vira um aviso do comando no chat
  document.getElementById('btVoltei').classList.toggle('escondido', !modoIntervalo || modoAutomatico);
  document.getElementById('avisoVoltei').classList.toggle('escondido', !modoAutomatico);
  atualizarContador();
}

// Volta para a configuração (o chat continua conectado)
function voltarMenu() {
  estado = 'menu';
  pararMusica();
  viewers = [];
  modoIntervalo = false;
  document.getElementById('btVoltei').classList.add('escondido');
  document.getElementById('ranking').classList.add('escondido');
  document.getElementById('menu').classList.remove('escondido');
  mostrarFase(); // a fase escolhida pode ter sido escondida nesse meio-tempo (mês mudou, simulador)
  atualizarContador();
}

// Contagem regressiva ao clicar em Pronto (modo intervalo: sozinha, com o nome da fase)
function iniciarContagem() {
  if (viewers.length === 0) {
    aviso = 'Espera pelo menos 1 viewer digitar !entrar';
    avisoAte = performance.now() + 3000;
    return;
  }
  estado = 'contagem';
  const titulo = modoIntervalo ? FASES[faseIndex].nome : 'Iniciando jogo...';
  contagemFila = [[titulo, 1200], ['3', 800], ['2', 800], ['1', 800], ['Valendo..', 700]];
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
  ajustarEsteira(); // esteira: idem (os que faltam entram pela borda)
  inicioFase = agora;
  for (const b of viewers) {
    b.estado = 'jogando';
    lancar(b);
    // modo intervalo: a regra do ausente recomeça a cada fase (poder guardado da fase anterior conta daqui)
    b.pontosFase = 0;
    b.usouNaFase = false;
    b.poderDesde = temAlgumPoder(b) ? agora : 0;
  }
}

// ----- Modo intervalo: fases em carrossel -----

// Acabaram os tijolos: confere os ausentes e mostra o ranking (top 10) por 15 s
// Ausente = tem um poder pronto há mais de 1 min 30 s e não usou nenhum na fase: perde os pontos da fase.
function terminarFase(agora) {
  ausentesFase = [];
  for (const b of viewers) {
    if (b.streamer || b.usouNaFase || !b.poderDesde) continue;
    if (!temAlgumPoder(b)) continue; // perdeu o poder no meio da fase: não tinha o que usar
    if (agora - b.poderDesde < AUSENTE_TOLERANCIA) continue; // ganhou o poder agora há pouco: não conta
    const perdeu = Math.min(b.pontos, b.pontosFase);
    b.pontos -= perdeu;
    ausentesFase.push({ nome: b.nome, perdeu });
  }
  estado = 'pausa';
  pausaAte = agora + PAUSA_RANKING;
}

// Roda a cada quadro durante o ranking entre as fases
function atualizarPausa(agora) {
  if (agora >= pausaAte) proximaFase();
}

// Fase seguinte no carrossel, pulando as de evento fora do mês (ex: Natal fora de dezembro)
function proximaFaseLiberada(i) {
  for (let k = 1; k <= FASES.length; k++) {
    const j = (i + k) % FASES.length;
    if (faseLiberada(j)) return j;
  }
  return i;
}

// Próxima fase do carrossel: as bolas voltam para o chão e a contagem começa (ninguém precisa entrar de novo)
function proximaFase() {
  faseIndex = proximaFaseLiberada(faseIndex);
  montarFase();
  viewers.forEach((b, i) => {
    const p = posicaoSlot(i);
    b.x = p.x;
    b.y = p.y;
    b.vx = 0;
    b.vy = 0;
    b.estado = 'lobby';
    b.presoEm = null;
    b.fila = [];
    b.poderAte = 0;
    b.velExtraAte = 0;
    b.choqueAte = 0;
    b.atordoadaAte = 0;
    b.efeitoAte = 0;
    b.impulsoAte = 0;
    // cada fase é uma partida nova: poderes e batidas zeram; só os pontos continuam somando
    b.carga = 0;
    b.batidas = 0;
    b.bombas = 0;
    b.batidasGrav = 0;
    b.gravidade = false;
    b.batidasChoque = 0;
    b.choque = false;
  });
  iniciarContagem();
}

// Botão "Voltei": o streamer voltou, o intervalo para e aparece o ranking com os pontos de todas as fases
function pararIntervalo() {
  if (!modoIntervalo || estado === 'menu' || estado === 'fim') return;
  finalizar();
}

// Mostra o ranking final (viewers e, se marcado, o streamer; no intervalo, sem a bola do streamer)
function finalizar() {
  estado = 'fim';
  pararMusica();
  document.getElementById('btVoltei').classList.add('escondido');
  document.getElementById('avisoVoltei').classList.add('escondido');
  // aberto pelo link ninguém clica: sem botões, com o aviso do comando para jogar de novo
  document.getElementById('btCopiar').classList.toggle('escondido', modoAutomatico);
  document.getElementById('btVoltar').classList.toggle('escondido', modoAutomatico);
  document.getElementById('rankingDica').classList.toggle('escondido', !modoAutomatico);
  document.querySelector('#ranking h2').textContent = modoIntervalo ? 'Ranking do intervalo' : 'Ranking final';
  const lista = viewers.filter(b => !b.streamer).map(b => ({ nome: b.nome, pontos: b.pontos, streamer: false }));
  if (streamerPontua) lista.push({ nome: 'Streamer', pontos: streamerPts, streamer: true });
  lista.sort((a, b) => b.pontos - a.pontos);

  const ol = document.getElementById('rankingLista');
  ol.innerHTML = '';
  // sem clique também não dá para rolar a lista: mostra os 10 primeiros inteiros
  ol.classList.toggle('completa', modoAutomatico);
  const mostrados = modoAutomatico ? lista.slice(0, 10) : lista;
  mostrados.forEach((j, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}º  ${j.nome}  -  ${j.pontos} pts`; // textContent: nome vem do chat
    if (i < 3) li.classList.add('top3');
    if (j.streamer) li.classList.add('streamer');
    ol.appendChild(li);
  });
  if (lista.length > mostrados.length) {
    const li = document.createElement('li');
    li.classList.add('mais-jogadores');
    li.textContent = `e mais ${lista.length - mostrados.length} jogadores`;
    ol.appendChild(li);
  }
  document.getElementById('ranking').classList.remove('escondido');
}

// Atualiza o contador de viewers (campo opcional na página)
function atualizarContador() {
  const el = document.getElementById('contador');
  if (el) el.textContent = `Viewers: ${viewers.length}/${maxViewers}`;
}
