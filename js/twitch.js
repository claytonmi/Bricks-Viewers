// ===== Chat da Twitch =====
// Conexão direta com o chat (leitura anônima, sem login).
// Cada mensagem vira um comando no jogo (ver processarComando em regras.js).

function conectarChat() {
  const canal = document.getElementById('canal').value.trim().toLowerCase();
  const status = document.getElementById('status');
  const btIniciar = document.getElementById('btIniciar');
  if (!canal) {
    status.textContent = 'Digite o nome do canal (ex: hercules_sc).';
    return;
  }
  if (clienteTwitch) clienteTwitch.close();
  btIniciar.disabled = true; // só libera depois de conectar
  status.textContent = 'Conectando no chat de ' + canal + '...';

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
      if (linha.includes(' JOIN #') || linha.includes(' 366 ')) {
        status.textContent = 'Conectado no chat de ' + canal + '. Pode digitar !entrar.';
        btIniciar.disabled = false;
        continue;
      }
      if (linha.includes('NOTICE') && linha.includes('Login authentication failed')) {
        status.textContent = 'Não consegui entrar no chat. Tente de novo.';
        continue;
      }
      // Mensagem de chat: @tags :usuario PRIVMSG #canal :texto
      const m = linha.match(/^@(\S+) :\S+ PRIVMSG #\S+ :(.*)$/);
      if (!m) continue;
      const tags = {};
      m[1].split(';').forEach(p => {
        const i = p.indexOf('=');
        if (i > 0) tags[p.slice(0, i)] = p.slice(i + 1);
      });
      processarComando(tags['display-name'] || 'anonimo', m[2]);
    }
  };
  ws.onerror = () => {
    btIniciar.disabled = true;
    status.textContent = 'Erro de conexão com a Twitch. Verifique a internet e tente de novo.';
  };
  ws.onclose = () => {
    if (clienteTwitch === ws) {
      btIniciar.disabled = true;
      status.textContent = 'Chat desconectado. Clique em Conectar para tentar de novo.';
    }
  };
}
