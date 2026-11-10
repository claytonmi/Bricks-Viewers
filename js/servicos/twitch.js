// ===== Chat da Twitch =====
// Conexão direta com o chat (leitura anônima, sem login).
// Cada mensagem vira um comando no jogo (ver processarComando em jogo/comandos.js).
// Se a conexão cair (a Twitch derruba de vez em quando), reconecta sozinho.

let timerReconexao = null;     // próxima tentativa de reconectar
let tentativasReconexao = 0;   // cada tentativa seguida espera um pouco mais (até 30 s)

// Botão Conectar
function conectarChat() {
  // aceita "#canal" e links como "twitch.tv/canal": fica só com o nome
  const canal = document.getElementById('canal').value.trim().toLowerCase()
    .split('?')[0].split('/').filter(Boolean).pop()?.replace(/^#+/, '') || '';
  const status = document.getElementById('status');
  if (!canal) {
    status.textContent = 'Digite o nome do canal (ex: hercules_sc).';
    return;
  }
  // Nome especial para testes: não conecta na Twitch, entra no modo simulação
  // (o que vem depois, ex: "simulador Hercules_SC", vira o nome dos viewers falsos)
  const [primeira, ...resto] = document.getElementById('canal').value.trim().split(/\s+/);
  if (MODOS_SIMULACAO.includes(primeira.toLowerCase())) {
    pararReconexao();
    ativarModoSimulacao(resto.join(' '));
    return;
  }
  desativarModoSimulacao();
  pararReconexao();
  nomeStreamer = canal; // modo intervalo: a bola do streamer leva o nome do canal
  document.getElementById('btIniciar').disabled = true; // só libera depois de conectar
  status.textContent = 'Conectando no chat de ' + canal + '...';
  abrirConexao(canal);
}

// Cancela uma reconexão agendada (o streamer conectou outro canal ou entrou no simulador)
function pararReconexao() {
  clearTimeout(timerReconexao);
  timerReconexao = null;
  tentativasReconexao = 0;
  chatReconectando = false;
}

function abrirConexao(canal) {
  const status = document.getElementById('status');
  const btIniciar = document.getElementById('btIniciar');
  if (clienteTwitch) clienteTwitch.close();

  const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
  clienteTwitch = ws;
  ws.onopen = () => {
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    ws.send('PASS SCHMOOPIIE');
    ws.send('NICK justinfan' + Math.floor(10000 + Math.random() * 80000));
    ws.send('JOIN #' + canal);
  };
  ws.onmessage = ev => {
    for (const linha of String(ev.data).split('\r\n')) {
      if (!linha) continue;
      if (linha.startsWith('PING')) {
        ws.send('PONG :tmi.twitch.tv');
        continue;
      }
      // Mensagem de chat: @tags :login!login@login.tmi.twitch.tv PRIVMSG #canal :texto
      // (vem antes das outras checagens: o texto do viewer pode ter qualquer coisa)
      const m = linha.match(/^@(\S+) :([^!\s]+)!\S* PRIVMSG #\S+ :(.*)$/);
      if (m) {
        const tags = {};
        m[1].split(';').forEach(p => {
          const i = p.indexOf('=');
          if (i > 0) tags[p.slice(0, i)] = p.slice(i + 1);
        });
        // streamer ou moderador (as tags vêm da Twitch, o viewer não consegue falsificar)
        const autoridade = tags.mod === '1' || /(^|,)broadcaster\//.test(tags.badges || '');
        // nome de exibição; se vier vazio, usa o login (que sempre existe)
        // o login vai junto: o ban (CLEARCHAT) chega pelo login, que pode ser diferente do nome de exibição
        processarComando(tags['display-name'] || m[2], m[3], autoridade, m[2]);
        continue;
      }
      // Ban ou timeout: a Twitch manda CLEARCHAT com o login do viewer (sem login, é a limpeza do chat inteiro)
      const banimento = linha.match(/^(?:@\S+ )?:tmi\.twitch\.tv CLEARCHAT #\S+ :(\S+)/);
      if (banimento) {
        removerViewer(banimento[1]);
        continue;
      }
      if (linha.includes(' JOIN #') || linha.includes(' 366 ')) {
        status.textContent = 'Conectado no chat de ' + canal + '. Pode digitar !entrar.';
        btIniciar.disabled = false;
        tentativasReconexao = 0;
        chatReconectando = false;
        // link do OBS: conectou, já começa
        if (iniciarAoConectar && estado === 'menu' && fonteAtiva) {
          iniciarAoConectar = false;
          iniciarPartida();
        }
        continue;
      }
      // A Twitch avisa antes de derrubar a conexão: fecha e reconecta logo
      if (/^(:\S+ )?RECONNECT/.test(linha)) {
        ws.close();
        continue;
      }
      if (linha.includes('NOTICE') && linha.includes('Login authentication failed')) {
        status.textContent = 'Não consegui entrar no chat. Tente de novo.';
      }
    }
  };
  ws.onerror = () => {
    status.textContent = 'Erro de conexão com a Twitch. Tentando de novo...';
  };
  ws.onclose = () => {
    // conexão antiga fechada de propósito (outro canal ou simulador): não faz nada
    if (clienteTwitch !== ws) return;
    clienteTwitch = null;
    chatReconectando = true;
    tentativasReconexao++;
    const espera = Math.min(3000 * tentativasReconexao, 30000);
    status.textContent = 'Chat desconectado. Reconectando em ' + Math.round(espera / 1000) + ' s...';
    timerReconexao = setTimeout(() => abrirConexao(canal), espera);
  };
}
