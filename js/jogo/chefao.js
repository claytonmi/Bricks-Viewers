// ===== Tijolo chefão =====
// Quais fases têm chefão e o chefão que cai na parede no modo intervalo.

// Fases que terminam com o tijolo chefão (a partida só acaba depois que ele quebra)
function faseTemChefao() {
  const f = FASES[faseIndex];
  return !!(f.chuva || f.esteira || f.natal || f.anoNovo || (modoIntervalo && f.chefaoIntervalo));
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
