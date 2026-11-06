// ===== Montagem da fase =====
// Tijolos da fase atual, cálculo de totais e o que a fase precisa saber sobre tijolos e paredes.

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
  resetarAnoNovo();
  // Fase 6: meteoros e buraco de minhoca (ver espaco.js)
  if (FASES[faseIndex].espaco) { montarEspaco(); return; }
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
      const especial = TIPOS_ANO_NOVO[c]; // Ano Novo: lanterna, envelope e fogos (letras no padrao)
      const t = {
        x: col * CELULA_W + (CELULA_W - TIJOLO_W) / 2,
        y: TIJOLO_TOPO + r * 30,
        w: TIJOLO_W,
        h: TIJOLO_H,
        vida: especial ? especial.vida : Number(c),
        tipo: especial ? especial.tipo : null,
        vivo: true,
        item: false,
        cor: especial ? null : corDoTijolo(r),
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

// A fase está liberada? Fase de evento só no mês dela.
// No simulador, vale o mês escolhido no painel (0 = todas liberadas, o padrão, para testar).
function faseLiberada(i) {
  const f = FASES[i];
  const simulador = !document.getElementById('simulador').classList.contains('escondido');
  if (f.anoNovo) return simulador ? mesSimulado === 0 : anoNovoLiberado(); // Ano Novo: só perto da data
  if (!f.mes) return true;
  if (simulador) return mesSimulado === 0 || mesSimulado === f.mes;
  return new Date().getMonth() + 1 === f.mes;
}
