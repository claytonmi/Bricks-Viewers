// ===== Comandos do chat =====
// Lê cada mensagem do chat e age conforme o comando. O jogo só lê o chat: nunca envia mensagens.

// Recebe uma mensagem do chat (ou do teste) e age conforme o comando
// (autoridade = quem mandou é o streamer ou um moderador)
// (login = nome de login na Twitch; o ban chega por ele)
function processarComando(usuario, mensagem, autoridade = false, login = usuario) {
  // 7TV/Chatterino põem um caractere invisível no fim de mensagens repetidas: tira antes de ler
  const texto = String(mensagem || '').replace(/[\u{E0000}​-‍⁠﻿]/gu, ' ');
  const partes = texto.trim().split(/\s+/);
  const cmd = (partes[0] || '').toLowerCase();
  const agora = agoraJogo();

  if (cmd === '!voltei') {
    // o mesmo que o botão Voltei, para quando o jogo está no OBS e não dá para clicar
    if (autoridade) pararIntervalo();
  } else if (cmd === '!recomecar' || cmd === '!recomeçar') {
    // aberto pelo link do OBS: começa outro intervalo depois do ranking final, sem precisar clicar
    if (autoridade && modoAutomatico && estado === 'fim' && fonteAtiva) iniciarPartida();
  } else if (cmd === '!mudo' || cmd === '!som') {
    // som por comando, para quando o jogo está no OBS e não dá para clicar no botão
    if (autoridade) definirSom(cmd === '!som');
  } else if (cmd === '!volume') {
    // !volume 30 (de 0 a 100); pedir um volume também tira do mudo
    const v = Number(partes[1]);
    if (autoridade && /^\d{1,3}$/.test(partes[1] || '') && v <= 100) {
      definirVolume(v / 100);
      if (v > 0 && !somLigado) definirSom(true);
    }
  } else if (cmd === '!vagas') {
    // quantas vagas tem: o streamer usa no OBS, onde não dá para ver o menu (aparece no painel do ranking)
    if (estado === 'menu') return;
    const jogadores = viewers.filter(b => !b.streamer).length;
    mostrarAvisoLateral(`Vagas: ${jogadores}/${maxViewers}`, 6000);
  } else if (cmd === '!entrar') {
    // modo intervalo: entra a qualquer momento (no meio da fase, no ranking entre as fases...)
    // no desempate ninguém entra: o mini-jogo só tem as bolas que estão disputando
    if (estado === 'desempate') return;
    if (estado === 'lobby' || (modoIntervalo && estado !== 'menu' && estado !== 'fim')) entrar(usuario, false, login);
    else if (!modoIntervalo && (estado === 'contagem' || estado === 'jogando')) mostrarAvisoEntrada(usuario);
  } else if (corDoComando(partes)) {
    // Cor da bola: !azul, !#ff8800, !cor 255 136 0... (pode trocar durante a partida)
    if (estado === 'menu' || estado === 'fim') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b) return;
    if (agora < b.corAteT) {
      // trocou antes de 5 s: avisa em cima da bola, no máximo uma vez a cada 10 s por viewer
      if (agora >= (b.msgCorAte || 0)) {
        b.msgCorAte = agora + 10000;
        b.aviso = `${b.nome}, calma! Tá trocando de roupa rápido demais`;
        b.avisoAte = agora + 4000 + AVISO_SOME;
      }
      return;
    }
    b.cor = corDoComando(partes);
    b.corAteT = agora + COOLDOWN_COR;
  } else if (PODERES.includes(cmd)) {
    // !speed, !bomb, !gravity, !shock: com outro poder ativo, entra na fila
    if (estado !== 'jogando') return;
    const b = viewers.find(v => v.nome === usuario);
    if (!b) return;
    if (!temPoder(b, cmd)) { avisarFaltaBatidas(b, cmd, agora); return; }
    if (podeUsarAgora(b, agora)) usarPoder(b, cmd, agora);
    else {
      if (!b.fila.includes(cmd)) b.fila.push(cmd); // repetido na fila não entra
      b.usouNaFase = true; // pediu o poder: está presente, mesmo se a fase acabar antes de ele sair
    }
  }
}

// Cor pedida no chat: !azul, !#ff8800, !#f80, !cor #ff8800, !cor 255 136 0 (null se não for cor)
function corDoComando(partes) {
  const cmd = (partes[0] || '').toLowerCase();
  if (!cmd.startsWith('!')) return null;
  if (CORES[cmd.slice(1)]) return CORES[cmd.slice(1)];
  if (cmd.startsWith('!#')) return corHex(cmd.slice(1)); // atalho exige o # (senão !bad viraria cor)
  if (cmd !== '!cor') return null;
  const resto = partes.slice(1).map(p => p.toLowerCase());
  if (CORES[resto[0]]) return CORES[resto[0]];
  if (resto.length === 1 && !resto[0].includes(',')) return corHex(resto[0]);
  // !cor 255 136 0 (também aceita 255,136,0)
  const n = resto.join(' ').split(/[\s,]+/).filter(Boolean);
  if (n.length !== 3 || !n.every(v => /^\d{1,3}$/.test(v) && Number(v) <= 255)) return null;
  return `rgb(${n.join(', ')})`;
}

// "#ff8800", "ff8800" ou "#f80" → "#ff8800" (null se não for hex)
function corHex(txt) {
  const h = String(txt || '').replace(/^#/, '');
  if (/^[0-9a-f]{6}$/.test(h)) return '#' + h;
  if (/^[0-9a-f]{3}$/.test(h)) return '#' + [...h].map(c => c + c).join('');
  return null;
}
