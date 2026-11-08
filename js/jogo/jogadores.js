// ===== Jogadores =====
// Entrada de viewers, pontos e avisos em cima da bola.

// Cria a bola de um viewer no lobby
// (modo intervalo: dá para entrar a qualquer momento; durante a fase, a bola já sai jogando)
function entrar(nome, streamer = false) {
  const jogadores = viewers.filter(b => !b.streamer).length; // a bola do streamer não ocupa vaga
  if (!streamer && jogadores >= maxViewers) return;
  if (viewers.some(b => b.nome.toLowerCase() === String(nome).toLowerCase())) return;
  const p = posicaoSlot(viewers.length);
  const b = {
    streamer,        // modo intervalo: bola do streamer (fora do ranking e da regra do ausente)
    pontosFase: 0,   // modo intervalo: pontos feitos na fase atual (o ausente perde estes)
    usouNaFase: false, // modo intervalo: usou algum poder na fase atual
    poderDesde: 0,   // modo intervalo: desde quando tem um poder pronto nesta fase (0 = nenhum)
    nome,
    cor: '#ffffff',
    x: p.x,
    y: p.y,
    vx: 0,
    vy: 0,
    estado: 'lobby',
    esperaAte: 0,
    velExtraAte: 0,
    pontos: 0,
    carga: 0,
    corAteT: 0,
    batidas: 0,     // encostos em tijolo desde a última bomba (a cada 10 ganha 1, até 2 guardadas)
    bombas: 0,
    batidasGrav: 0,  // encostos em tijolo desde o último !gravity (com 12 ganha o poder)
    gravidade: false, // tem o !gravity pronto (só 1, não acumula)
    presoEm: null,    // campo do !gravity que está segurando esta bola
    buraco: null,     // fase 6: na espiral de um buraco de minhoca (ver espaco.js)
    batidasChoque: 0, // encostos em tijolo desde o último !shock (com 13 ganha o poder)
    choque: false,    // tem o !shock pronto (só 1, não acumula)
    choqueAte: 0,     // até quando a bola está eletrizada (atordoa as bolas perto)
    atordoadaAte: 0,  // até quando a bola está atordoada (1% da velocidade)
    imuneChoqueAte: 0, // depois de atordoada, fica imune a outro !shock até aqui
    efeitoAte: 0,     // sofreu o poder de outra bola: só usa poder de novo a partir daqui
    impulsoAte: 0,    // empurrada por !bomb: fica mais rápida até aqui
    poderAte: 0,      // até quando o poder em uso está ativo (enquanto isso, os outros poderes não pegam nela)
    fila: [],         // poderes pedidos enquanto outro estava ativo (rodam um depois do outro)
    brilhoBombaAte: 0, // brilho vermelho depois de usar !bomb
    aviso: '',         // "Fulano usou !bomb" em cima da bola (o chat aprende vendo os outros)
    avisoAte: 0
  };
  viewers.push(b);
  // modo intervalo com a fase rolando: nasce no chão, num lugar ao acaso, e já é lançada
  if (modoIntervalo && estado === 'jogando') {
    const agora = agoraJogo();
    b.x = W * (0.2 + Math.random() * 0.6);
    b.y = PISO_Y - RAIO - 2;
    b.estado = 'jogando';
    lancar(b);
    b.aviso = `${b.nome} entrou`;
    b.avisoAte = agora + DURACAO_AVISO + AVISO_SOME;
  }
  atualizarContador();
}

// Tira a bola de um viewer banido ou em timeout (a Twitch avisa pelo CLEARCHAT): ele some do jogo e do ranking.
// Os tijolos que ele já quebrou continuam quebrados; os pontos dele saem junto com a bola.
function removerViewer(nome) {
  const alvo = String(nome).toLowerCase();
  const b = viewers.find(v => !v.streamer && v.nome.toLowerCase() === alvo);
  if (!b) return;
  b.estado = 'removida'; // quem ainda tiver referência a esta bola deixa de tratá-la como jogando
  b.presoEm = null;
  b.buraco = null;
  viewers = viewers.filter(v => v !== b);
  copias = copias.filter(c => c.dono !== b); // a cópia do multibola some junto
  camposGrav.forEach(c => {
    c.presas = c.presas.filter(p => p.b !== b);
    if (c.dono === b) c.fim = 0; // o campo que ele criou explode já e solta as bolas presas
  });
  atualizarContador();
}

// Ponto para o viewer (modo intervalo: também guarda os pontos da fase, para a regra do ausente)
function darPontos(b, n) {
  b.pontos += n;
  b.pontosFase = (b.pontosFase || 0) + n;
}

// Texto "Fulano usou !comando" que sobe e some em cima da bola
function mostrarAviso(b, cmd, agora) {
  b.aviso = `${b.nome} usou ${cmd}`;
  b.avisoAte = agora + DURACAO_AVISO + AVISO_SOME;
}
