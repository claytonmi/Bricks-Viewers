// ===== Modo intervalo =====
// Fases em carrossel, ranking entre as fases e regra do ausente.

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
  // empate no pódio: o desempate roda antes do ranking entre as fases (desempate.js); depois, a pausa segue
  iniciarDesempate(montarLinhas(), () => {
    estado = 'pausa';
    pausaAte = agoraJogo() + PAUSA_RANKING;
  });
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
  ordensDesempate = new Map(); // cada fase tem o seu ranking: o desempate de uma não vale na seguinte
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
  if (estado === 'desempate') { suspenderDesempate(); return; } // no meio do desempate: Continuar ou Cancelar
  finalizar();
}
