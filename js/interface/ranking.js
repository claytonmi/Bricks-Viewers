// ===== Ranking ao lado do jogo =====
// Mostra todos os jogadores durante a partida (a lista rola se for grande). Quando a ordem muda, as linhas deslizam
// suavemente para a nova posição (técnica FLIP). Só mexe na tela quando a lista muda.

const MEDALHAS = ['🥇', '🥈', '🥉'];   // ouro, prata, bronze
// Texto do top 3 para o streamer colar no chat (viewers e, se marcado, o streamer)
function textoTop3() {
  const itens = montarLinhas(); // mesma ordem do ranking, com o desempate
  const linhas = itens.slice(0, 3).map((j, i) => `${MEDALHAS[i]} ${j.nome} - ${j.pontos} pts`);
  return ['🏆 Bricks Viewers - Top 3', ...linhas].join('\n');
}

// Copia o top 3 para a área de transferência
function copiarTop3() {
  const texto = textoTop3();
  const botao = document.getElementById('btCopiar');
  const feedback = () => {
    botao.textContent = 'Copiado!';
    setTimeout(() => { botao.textContent = 'Copiar top 3'; }, 2000);
  };
  // navigator.clipboard só funciona em https; se falhar, usa o método antigo
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(feedback).catch(() => copiarAntigo(texto, feedback));
  } else {
    copiarAntigo(texto, feedback);
  }
}

function copiarAntigo(texto, feedback) {
  const area = document.createElement('textarea');
  area.value = texto;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
  feedback();
}

document.getElementById('btCopiar').addEventListener('click', copiarTop3);

// Aviso curto embaixo do ranking lateral (some sozinho depois de uns segundos)
let timerAvisoLateral = null;
function mostrarAvisoLateral(texto, ms = 5000) {
  const el = document.getElementById('avisoEntrada');
  if (!el) return;
  el.textContent = texto;
  el.classList.remove('escondido');
  clearTimeout(timerAvisoLateral);
  timerAvisoLateral = setTimeout(() => el.classList.add('escondido'), ms);
}

// Quem tenta entrar no meio da partida (modo normal)
function mostrarAvisoEntrada(nome) {
  mostrarAvisoLateral(`${nome} só pode entrar na próxima rodada`);
}

// Ranking final (ao lado do jogo): a lista e os botões. Aberto pelo link do OBS, sem botões e com a dica do comando.
function mostrarRankingFinal(lista) {
  document.getElementById('btVoltei').classList.add('escondido');
  document.getElementById('avisoVoltei').classList.add('escondido');
  document.getElementById('btCopiar').classList.toggle('escondido', modoAutomatico);
  document.getElementById('btVoltar').classList.toggle('escondido', modoAutomatico);
  document.getElementById('rankingDica').classList.toggle('escondido', !modoAutomatico);
  atualizarDicaRanking(agoraJogo());
  document.querySelector('#ranking h2').textContent = modoIntervalo ? 'Ranking do intervalo' : 'Ranking final';

  const ol = document.getElementById('rankingLista');
  ol.innerHTML = '';
  // sem clique também não dá para rolar a lista: mostra os 10 primeiros inteiros
  ol.classList.toggle('completa', modoAutomatico);
  const mostrados = modoAutomatico ? lista.slice(0, 10) : lista;
  mostrados.forEach((j, i) => {
    const li = document.createElement('li');
    li.textContent = `${j.posicao || i + 1}º  ${j.nome}  -  ${j.pontos} pts`; // textContent: nome vem do chat
    if (i < 3) li.classList.add('top3');
    if (j.streamer) li.classList.add('streamer');
    ol.appendChild(li);
  });
  if (lista.length > mostrados.length) {
    const li = document.createElement('li');
    li.classList.add('mais-jogadores');
    li.textContent = `e mais ${lista.length - mostrados.length} jogadores`;
    ol.appendChild(li);
  }
  document.getElementById('ranking').classList.remove('escondido');
}

let chaveRankingLateral = '';          // guarda a última lista desenhada
const linhasRanking = new Map();       // chave (nome) -> <li> já criado, para reaproveitar

function atualizarRankingLateral() {
  const painel = document.getElementById('rankingLateral');
  const lista = document.getElementById('rankingTopo');
  if (!painel || !lista) return;

  // aparece na contagem e durante a partida; some no menu e no ranking final
  const visivel = estado === 'lobby' || estado === 'contagem' || estado === 'jogando' || estado === 'pausa' || estado === 'desempate';
  painel.style.visibility = visivel ? 'visible' : 'hidden';
  if (!visivel) return;

  // modo intervalo: a bola do streamer não entra no ranking
  const top = montarLinhas(); // todos os jogadores, na ordem do ranking com o desempate (a lista rola se for grande)

  const chave = top.map(j => j.chave + ':' + j.pontos + ':' + j.posicao).join('|');
  if (chave === chaveRankingLateral) return;
  chaveRankingLateral = chave;

  // 1) posição de cada linha antes da mudança
  const antes = new Map();
  for (const li of lista.children) antes.set(li, li.getBoundingClientRect().top);

  // 2) reaproveita ou cria as linhas e coloca na nova ordem
  const novas = top.map((j, i) => {
    let li = linhasRanking.get(j.chave);
    if (!li) {
      li = document.createElement('li');
      li.classList.add('entrou'); // efeito de entrada na primeira vez
      // tira a classe depois do efeito: senão, mover a linha reinicia a animação
      li.addEventListener('animationend', () => li.classList.remove('entrou'), { once: true });
      li.append(document.createElement('span'), document.createElement('span'));
      linhasRanking.set(j.chave, li);
    }
    li.classList.toggle('streamer', j.streamer);
    // 🥇🥈🥉 só para os três primeiros que já têm ponto
    const marca = (i < 3 && j.pontos > 0) ? MEDALHAS[i] : `${i + 1}º`;
    li.children[0].textContent = `${marca} ${j.nome}`; // textContent: nome vem do chat
    li.children[1].textContent = j.pontos;
    return li;
  });
  for (const li of [...lista.children]) if (!novas.includes(li)) li.remove();
  novas.forEach(li => lista.appendChild(li));

  // quem saiu do jogo é esquecido
  for (const [k, li] of linhasRanking) if (!top.some(j => j.chave === k)) linhasRanking.delete(k);

  // 3) desliza cada linha da posição antiga para a nova
  novas.forEach(li => {
    const posAntes = antes.get(li);
    if (posAntes === undefined) return; // linha nova: aparece sem deslizar
    const dy = (posAntes - li.getBoundingClientRect().top) / escalaTela; // medida na tela; o deslize é antes da escala
    if (Math.abs(dy) < 1) return;
    li.style.transition = 'none';
    li.style.transform = `translateY(${dy}px)`;
    li.offsetHeight; // força o navegador a aplicar a posição antiga antes da animação
    li.style.transition = 'transform 0.5s ease';
    li.style.transform = '';
  });
}
