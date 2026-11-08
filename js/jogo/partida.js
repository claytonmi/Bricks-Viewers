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


  atualizarItens(dt, agora);
  atualizarEspaco(dt, agora); // fase 6: meteoros novos e buraco de minhoca
  atualizarAnoNovo(dt, agora); // Ano Novo: dragão, moedas da sorte e fogos do chão
  atualizarFimTravado(agora); // fim de fase parado: uma bola é atraída para os últimos tijolos (chefao.js)

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
  // link do OBS no intervalo: cada vez que a cena abre, sorteia uma fase diferente da última (sem as de evento)
  if (modoAutomatico && document.getElementById('modoIntervalo').checked) indiceFase = sortearFaseIntervalo();
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
  ordensDesempate = new Map(); // partida nova: nenhum desempate decidido ainda
  paddleX = W / 2;
  estado = 'lobby';
  // modo intervalo: o streamer já entra como uma bola e a partida começa sozinha em 20 s
  if (modoIntervalo) {
    entrar(nomeStreamer, true);
    viewers[0].cor = '#22d3ee';
    comecaEm = agoraJogo() + INTERVALO_ESPERA;
  }
  tocarMusica();
  document.getElementById('menu').classList.add('escondido');
  document.getElementById('ranking').classList.add('escondido');
  // botão Voltei só onde dá para clicar; aberto pelo link, vira um aviso do comando no chat
  document.getElementById('btVoltei').classList.toggle('escondido', !modoIntervalo || modoAutomatico);
  document.getElementById('avisoVoltei').classList.toggle('escondido', !modoAutomatico);
  atualizarContador();
}

document.getElementById('btContinuar').onclick = () => continuarJogo();
document.getElementById('btVoltarPausa').onclick = () => voltarMenu();

// Fase do intervalo pelo link do OBS: sorteia entre as normais, diferente da última aberta
let ultimaFaseIntervalo = -1;
function sortearFaseIntervalo() {
  const opcoes = FASES.map((f, i) => i)
    .filter(i => !FASES[i].natal && !FASES[i].anoNovo && !FASES[i].mes && i !== ultimaFaseIntervalo);
  const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)];
  ultimaFaseIntervalo = escolhida;
  return escolhida;
}

// ----- Pausa (Esc no navegador) -----
// Menu no centro com o ranking atual, Continuar e Voltar ao menu. O relógio do jogo para junto.
function alternarPausa() {
  if (pausadoJogo) { continuarJogo(); return; }
  if (estado !== 'lobby' && estado !== 'contagem' && estado !== 'jogando' && estado !== 'desempate') return;
  pausadoJogo = true;
  pausadoEm = performance.now();
  mostrarMenuPausa();
}

function continuarJogo() {
  if (!pausadoJogo) return;
  descontoPausa += performance.now() - pausadoEm;
  pausadoJogo = false;
  document.getElementById('menuPausa').classList.add('escondido');
}

// Lista o ranking atual (top 10) no menu de pausa
function mostrarMenuPausa() {
  const ol = document.getElementById('pausaRanking');
  ol.innerHTML = '';
  const lista = montarLinhas().slice(0, 10); // mesma ordem do ranking (inclui o desempate)
  if (lista.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Ninguém entrou ainda';
    ol.appendChild(li);
  }
  lista.forEach((b, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}º  ${b.nome}  -  ${b.pontos} pts`; // textContent: nome vem do chat
    ol.appendChild(li);
  });
  document.getElementById('menuPausa').classList.remove('escondido');
}

// Volta para a configuração (o chat continua conectado)
function voltarMenu() {
  if (pausadoJogo) continuarJogo();
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
    avisoAte = agoraJogo() + 3000;
    return;
  }
  estado = 'contagem';
  const titulo = modoIntervalo ? FASES[faseIndex].nome : 'Iniciando jogo...';
  contagemFila = [[titulo, 1200], ['3', 800], ['2', 800], ['1', 800], ['Valendo..', 700]];
  contagemIdx = 0;
  contagemTexto = contagemFila[0][0];
  contagemFim = agoraJogo() + contagemFila[0][1];
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
  rebatidasStreamer = 0;
  ajustarChuva(); // fase com chuva: total de tijolos conforme os jogadores
  ajustarEsteira(); // esteira: idem (os que faltam entram pela borda)
  ajustarEspaco(); // fase 6: idem (os meteoros que faltam)
  inicioFase = agora;
  ultimoToqueTijolo = agora;
  itensPontosRestantes = ITENS_PONTOS_PARTIDA;
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
// semDesempate: true quando não pode mais haver mini-jogo (trocou de cena, ou o streamer cancelou)
function finalizar(semDesempate = false) {
  if (estado === 'desempate') { descartarDesempate(); semDesempate = true; } // trocou de cena no meio do desempate
  if (pausadoJogo) continuarJogo(); // o ranking final não pode ficar atrás do menu de pausa
  estado = 'fim';
  desempateSuspenso = null;
  esconderEscolhaDesempate();
  pararMusica();
  liberarBuracos(); // bola na espiral não fica parada no meio do caminho
  reinicioEm = 0;
  const linhas = montarLinhas(); // pontos, ordem do desempate e posição de cada um (desempate.js)
  // empate no pódio: o ranking aparece primeiro, com a mensagem, e depois o mini-jogo; no fim, o ranking atualizado
  if (!semDesempate && gruposDesempate(linhas).length) {
    mostrarRankingFinal(linhas);
    iniciarDesempate(linhas, () => { estado = 'fim'; mostrarRankingFinal(montarLinhas()); });
    return;
  }
  mostrarRankingFinal(linhas); // tela: ver ranking.js
}

// Atualiza o contador de viewers (campo opcional na página)
function atualizarContador() {
  const el = document.getElementById('contador');
  if (el) el.textContent = `Viewers: ${viewers.length}/${maxViewers}`;
}
