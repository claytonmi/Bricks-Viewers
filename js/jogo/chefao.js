// ===== Tijolo chefão =====
// Quais fases têm chefão e o chefão que cai na parede no modo intervalo.

// Fases que terminam com o tijolo chefão (a partida só acaba depois que ele quebra)
function faseTemChefao() {
  const f = FASES[faseIndex];
  return !!(f.chuva || f.esteira || f.natal || f.anoNovo || (modoIntervalo && f.chefaoIntervalo));
}

// ----- Fim de fase travado (todas as fases) -----
// Ninguém encostando nos tijolos por FIM_TRAVADO_TEMPO: uma bola ao acaso sai mirando o tijolo mais perto na próxima
// batida dela (raquete, borda, teto ou parede). Não vira no meio do ar: quem assiste vê só uma batida com um bom ângulo.
function atualizarFimTravado(agora) {
  if (estado !== 'jogando' || chuvaRestante > 0) return; // na chuva ainda tem tijolo caindo
  if (tijolosVivos <= 0) return; // qualquer quantidade: na simulação, 9 tijolos no canto travaram a fase
  if (agora - ultimoToqueTijolo < FIM_TRAVADO_TEMPO) return;
  ultimoToqueTijolo = agora; // a próxima tentativa só depois de mais um tempo parado
  const bolas = viewers.filter(b => b.estado === 'jogando' && !b.streamer && !b.buraco && !b.presoEm);
  if (bolas.length === 0) return;
  const b = bolas[Math.floor(Math.random() * bolas.length)];
  b.mirarNaBatida = true;
}

// Bola marcada que acabou de bater em algo: sai reto para o tijolo vivo mais perto, mantendo a velocidade.
// Só mira num tijolo do lado para onde a bola já está saindo da batida (senão iria contra a parede em que acabou
// de bater); sem nenhum desse lado, espera a próxima batida. Vale uma vez só; depois segue a física normal
// (se errar, outra bola é escolhida mais tarde).
function mirarNoTijolo(b) {
  let alvo = null, menor = Infinity;
  for (const t of tijolos) {
    if (!t.vivo || t.circ || t.dragao || t.tipo) continue;
    const dx = t.x + t.w / 2 - b.x, dy = t.y + t.h / 2 - b.y;
    if (dx * b.vx + dy * b.vy <= 0) continue; // atrás da superfície em que a bola bateu
    const d = Math.hypot(dx, dy);
    if (d < menor) { menor = d; alvo = t; }
  }
  if (!alvo || menor < 1) return;
  b.mirarNaBatida = false;
  const vel = Math.hypot(b.vx, b.vy) || VEL_BASE;
  b.vx = (alvo.x + alvo.w / 2 - b.x) / menor * vel;
  b.vy = (alvo.y + alvo.h / 2 - b.y) / menor * vel;
}

// Chefão quebrado: os tijolos que ainda sobravam também quebram; quem deu a última batida ganha 1 ponto por tijolo
function quebrarRestantes(quem) {
  for (const t of tijolos) {
    if (!t.vivo || t.chefao || t.circ || t.dragao || t.tipo) continue;
    t.vivo = false;
    tijolosVivos--;
    darPontos(quem, 1);
    if (t.item) soltarItem(t);
  }
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
    anunciar('jogo.chefao', agora);
  }
}
