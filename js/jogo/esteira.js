// ===== Esteira =====
// Fases com "esteira": linhas que andam, reposição de tijolos pela borda e chefão que vai e volta.

// Esteira, no início da partida: quantos tijolos ainda vão entrar pela borda (total menos os que já estão)
function ajustarEsteira() {
  const esteira = FASES[faseIndex].esteira;
  if (!esteira || !esteira.total) return;
  const total = totalPorJogadores(ESTEIRA_MIN, esteira.total, viewers.length);
  chuvaRestante = Math.max(0, total - tijolosVivos);
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
