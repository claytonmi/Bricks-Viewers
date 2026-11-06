// ===== Partida =====
// Ciclo da partida: menu, lobby, contagem, jogo e ranking final.

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
  atualizarEspaco(dt, agora); // fase 6: meteoros novos e buraco de minhoca
  atualizarAnoNovo(dt, agora); // Ano Novo: dragão, moedas da sorte e fogos do chão

  // na chuva, só acaba depois do último tijolo e do chefão
  const chefaoFalta = faseTemChefao() && !chefaoCaiu;
  // Natal: espera também os presentinhos do saco sumirem
  if (tijolosVivos === 0 && chuvaRestante === 0 && !chefaoFalta && !natalPendente()) {
    liberarBuracos(); // bola que ainda estiver no buraco sai antes do fim da fase
    if (modoIntervalo) terminarFase(agora); // intervalo: ranking e depois a próxima fase
    else finalizar();
  }
}

// Vai da tela de menu para o lobby (viewers entram com !entrar)
function iniciarPartida() {
  if (!faseLiberada(indiceFase)) return; // fase de evento fora do mês dela
  reinicioEm = 0;
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
  ajustarEspaco(); // fase 6: idem (os meteoros que faltam)
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

// Mostra o ranking final (viewers e, se marcado, o streamer; no intervalo, sem a bola do streamer)
function finalizar() {
  estado = 'fim';
  pararMusica();
  liberarBuracos(); // bola na espiral não fica parada no meio do caminho
  reinicioEm = 0;
  const lista = viewers.filter(b => !b.streamer).map(b => ({ nome: b.nome, pontos: b.pontos, streamer: false }));
  if (streamerPontua) lista.push({ nome: 'Streamer', pontos: streamerPts, streamer: true });
  lista.sort((a, b) => b.pontos - a.pontos);
  mostrarRankingFinal(lista); // tela: ver ranking.js
}

// Atualiza o contador de viewers (campo opcional na página)
function atualizarContador() {
  const el = document.getElementById('contador');
  if (el) el.textContent = `Viewers: ${viewers.length}/${maxViewers}`;
}
