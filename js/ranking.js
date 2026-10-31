// ===== Ranking ao lado do jogo =====
// Mostra os 5 primeiros durante a partida. Quando a ordem muda, as linhas deslizam
// suavemente para a nova posição (técnica FLIP). Só mexe na tela quando a lista muda.

const MEDALHAS = ['🥇', '🥈', '🥉'];   // ouro, prata, bronze
// Texto do top 3 para o streamer colar no chat (viewers e, se marcado, o streamer)
function textoTop3() {
  const itens = viewers.map(b => ({ nome: b.nome, pontos: b.pontos }));
  if (streamerPontua) itens.push({ nome: 'Streamer', pontos: streamerPts });
  itens.sort((a, b) => b.pontos - a.pontos);
  const linhas = itens.slice(0, 3).map((j, i) => `${MEDALHAS[i]} ${j.nome} - ${j.pontos} pts`);
  return ['🏆 Bricks Twitch - Top 3', ...linhas].join('\n');
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

let chaveRankingLateral = '';          // guarda a última lista desenhada
const linhasRanking = new Map();       // chave (nome) -> <li> já criado, para reaproveitar

function atualizarRankingLateral() {
  const painel = document.getElementById('rankingLateral');
  const lista = document.getElementById('rankingTopo');
  if (!painel || !lista) return;

  // aparece na contagem e durante a partida; some no menu e no ranking final
  const visivel = estado === 'lobby' || estado === 'contagem' || estado === 'jogando';
  painel.style.visibility = visivel ? 'visible' : 'hidden';
  if (!visivel) return;

  const itens = viewers.map(b => ({ chave: b.nome, nome: b.nome, pontos: b.pontos, streamer: false }));
  if (streamerPontua) itens.push({ chave: '__streamer__', nome: 'Streamer', pontos: streamerPts, streamer: true });
  itens.sort((a, b) => b.pontos - a.pontos); // sort é estável: quem entrou antes fica na frente em empate
  const top = itens; // todos os jogadores (a lista rola se for grande)

  const chave = top.map(j => j.chave + ':' + j.pontos).join('|');
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

  // quem saiu do top 5 é esquecido
  for (const [k, li] of linhasRanking) if (!top.some(j => j.chave === k)) linhasRanking.delete(k);

  // 3) desliza cada linha da posição antiga para a nova
  novas.forEach(li => {
    const posAntes = antes.get(li);
    if (posAntes === undefined) return; // linha nova: aparece sem deslizar
    const dy = posAntes - li.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    li.style.transition = 'none';
    li.style.transform = `translateY(${dy}px)`;
    li.offsetHeight; // força o navegador a aplicar a posição antiga antes da animação
    li.style.transition = 'transform 0.5s ease';
    li.style.transform = '';
  });
}
