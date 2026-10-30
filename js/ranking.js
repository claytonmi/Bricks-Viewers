// ===== Ranking ao lado do jogo =====
// Mostra os 5 primeiros durante a partida. Só mexe na tela quando a lista muda.

let chaveRankingLateral = '';   // guarda a última lista desenhada (evita refazer à toa)

function atualizarRankingLateral() {
  const painel = document.getElementById('rankingLateral');
  const lista = document.getElementById('rankingTopo');
  if (!painel || !lista) return;

  // aparece na contagem e durante a partida; some no menu e no ranking final
  const visivel = estado === 'lobby' || estado === 'contagem' || estado === 'jogando';
  painel.style.visibility = visivel ? 'visible' : 'hidden';
  if (!visivel) return;

  const itens = viewers.map(b => ({ nome: b.nome, pontos: b.pontos, streamer: false }));
  if (streamerPontua) itens.push({ nome: 'Streamer', pontos: streamerPts, streamer: true });
  itens.sort((a, b) => b.pontos - a.pontos);
  const top = itens.slice(0, 5);

  const chave = top.map(j => j.nome + ':' + j.pontos).join('|');
  if (chave === chaveRankingLateral) return;
  chaveRankingLateral = chave;

  lista.innerHTML = '';
  top.forEach((j, i) => {
    const li = document.createElement('li');
    const nome = document.createElement('span');
    nome.textContent = `${i + 1}º ${j.nome}`; // textContent: nome vem do chat
    const pts = document.createElement('span');
    pts.textContent = j.pontos;
    if (j.streamer) li.classList.add('streamer');
    li.append(nome, pts);
    lista.appendChild(li);
  });
}
