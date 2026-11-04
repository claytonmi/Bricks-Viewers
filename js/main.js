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
  // chuva de tijolos (fase 1): já cai no lobby, enquanto os viewers entram
  if (estado === 'lobby' || estado === 'contagem' || estado === 'jogando') {
    atualizarChuva(dt, agora);
    atualizarEsteira(dt, agora); // esteira (fase 5): as linhas de tijolos andam
    atualizarChefaoParede(dt, agora); // modo intervalo (fase 3): chefão cai na parede do meio
  }
  // modo intervalo: o lobby termina sozinho (sem botão Pronto)
  if (estado === 'lobby' && modoIntervalo && agora >= comecaEm) iniciarContagem();
  if (estado === 'contagem') atualizarContagem(agora);
  if (estado === 'jogando') {
    atualizarNatal(dt, agora); // fase de Natal: saco do Papai Noel, presentinhos e rena
    atualizarJogo(dt, agora);
  }
  if (estado === 'pausa') atualizarPausa(agora);

  desenhar(agora);

  // ranking lateral: atualiza no máximo 4 vezes por segundo
  if (agora - ultimoRanking > 250) {
    atualizarRankingLateral();
    atualizarPainelComandos();
    atualizarListaSimulador();
    ultimoRanking = agora;
  }
  requestAnimationFrame(loop);
}

carregarImagens()
  .then(() => {
    mostrarFase();
    inicioPeloLink(); // link do OBS: já conecta e começa sozinho
    requestAnimationFrame(loop);
  })
  .catch(err => {
    alert(err.message);
  });
