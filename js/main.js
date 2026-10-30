// ===== Início e loop principal =====
// Este arquivo é o último a carregar: liga as imagens e começa o jogo.

let ultimoFrame = performance.now();
let ultimoRanking = 0;          // última atualização do ranking lateral

function loop() {
  const agora = performance.now();
  const dt = Math.min((agora - ultimoFrame) / 1000, 0.05);
  ultimoFrame = agora;

  // Controle do streamer só começa depois do Pronto
  if (estado === 'contagem' || estado === 'jogando') {
    if (teclas.esq) paddleX -= VEL_PADDLE * dt;
    if (teclas.dir) paddleX += VEL_PADDLE * dt;
    paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, paddleX));
  }
  if (estado === 'contagem') atualizarContagem(agora);
  if (estado === 'jogando') atualizarJogo(dt, agora);

  desenhar(agora);

  // ranking lateral: atualiza no máximo 4 vezes por segundo
  if (agora - ultimoRanking > 250) {
    atualizarRankingLateral();
    ultimoRanking = agora;
  }
  requestAnimationFrame(loop);
}

carregarImagens()
  .then(() => {
    mostrarFase();
    requestAnimationFrame(loop);
  })
  .catch(err => {
    alert(err.message);
  });
