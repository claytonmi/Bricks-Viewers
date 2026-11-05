// ===== Chuva de tijolos =====
// Fases com "chuva": total conforme os jogadores, pilhas por coluna e o chefão que cai no fim.

// Total da chuva: até 15 jogadores → CHUVA_MIN; 100 → total da fase
function totalChuva(jogadores) {
  return totalPorJogadores(CHUVA_MIN, FASES[faseIndex].chuva.total, jogadores);
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
