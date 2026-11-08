// ===== Início e loop principal =====
// Este arquivo é o último a carregar: liga as imagens e começa o jogo.

let ultimoFrame = agoraJogo();
let ultimoRanking = 0;          // última atualização do ranking lateral

// Com a janela escondida (minimizada, atrás de outra janela ou aba em segundo plano) o navegador para o
// requestAnimationFrame, e o jogo congelava. Nesse caso um timer num Worker (que não é limitado) chama o loop.
let quadroPendente = false;
let pararTimerEscondido = null;

function agendarFrame() {
  if (quadroPendente) return;
  quadroPendente = true;
  requestAnimationFrame(() => { quadroPendente = false; loop(); });
}

function ligarTimerEscondido() {
  if (pararTimerEscondido) return;
  try {
    const url = URL.createObjectURL(new Blob(['setInterval(function () { postMessage(0); }, 16);'], { type: 'text/javascript' }));
    const worker = new Worker(url);
    worker.onmessage = () => { if (document.hidden) loop(); };
    pararTimerEscondido = () => { worker.terminate(); URL.revokeObjectURL(url); };
  } catch (e) {
    // navegador sem Worker: o timer da página é limitado a 1 s, mas ainda anda
    const id = setInterval(() => { if (document.hidden) loop(); }, 16);
    pararTimerEscondido = () => clearInterval(id);
  }
}

function desligarTimerEscondido() {
  if (!pararTimerEscondido) return;
  pararTimerEscondido();
  pararTimerEscondido = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) ligarTimerEscondido();
  else desligarTimerEscondido();
});

function loop() {
  const agora = agoraJogo();
  const dt = Math.min((agora - ultimoFrame) / 1000, 0.05);
  ultimoFrame = agora;

  // link do OBS com a cena fora do ar: não calcula nem desenha nada, para não pesar no PC do streamer
  if (!fonteAtiva) {
    agendarFrame();
    return;
  }

  // pausado (Esc): o jogo fica parado; o menu de pausa é um elemento da página por cima do canvas
  if (pausadoJogo) {
    agendarFrame();
    return;
  }

  // Controle do streamer só começa depois do Pronto
  if (estado === 'contagem' || estado === 'jogando' || estado === 'desempate') {
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
  if (estado === 'desempate') atualizarDesempate(dt, agora); // mini-jogo de empate no pódio (desempate.js)
  if (estado === 'pausa') atualizarPausa(agora);
  if (estado === 'fim') atualizarReinicio(agora);

  desenhar(agora);

  // ranking lateral: atualiza no máximo 4 vezes por segundo
  if (agora - ultimoRanking > 250) {
    atualizarRankingLateral();
    atualizarPainelComandos();
    atualizarBotaoLink();
    atualizarListaSimulador();
    ultimoRanking = agora;
  }
  agendarFrame();
}

carregarImagens()
  .then(() => {
    mostrarFase();
    inicioPeloLink(); // link do OBS: já conecta e começa sozinho
    if (document.hidden) ligarTimerEscondido(); // a página pode abrir já escondida
    agendarFrame();
  })
  .catch(err => {
    alert(err.message);
  });
