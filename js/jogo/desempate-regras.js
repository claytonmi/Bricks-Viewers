// ===== Desempate: regras puras =====
// Sem desenho nem páginas: só contas sobre pontos, posições e tijolo. Testadas em dev/testes-desempate.js.
// Um jogador "decidido" tem uma ordem do desempate (0 = 1º do grupo); quem não jogou não tem.

const DESEMPATE_ATE = 3;      // só jogam o desempate os empates que envolvem o pódio: grupo que começa em 1º, 2º ou 3º
                              // (3º com 4º joga; 4º com 5º não)
const DESEMPATE_MIN_PONTOS = 1; // quem tem 0 pontos não disputa (ninguém pontuou, não há o que desempatar)

// Ordena as linhas do ranking: mais pontos primeiro. Em empate: quem já tem ordem do desempate vem na ordem dele;
// senão, o streamer fica atrás dos viewers e o resto segue a ordem de entrada (sort estável).
function ordenarLinhas(linhas) {
  return linhas
    .map((l, i) => ({ l, i }))
    .sort((a, b) => {
      if (b.l.pontos !== a.l.pontos) return b.l.pontos - a.l.pontos;
      const oa = a.l.ordem, ob = b.l.ordem;
      if (oa !== undefined && ob !== undefined && oa !== ob) return oa - ob;
      if (oa !== undefined && ob === undefined) return -1; // quem decidiu o desempate fica na frente de quem não jogou
      if (oa === undefined && ob !== undefined) return 1;
      if (!!a.l.streamer !== !!b.l.streamer) return a.l.streamer ? 1 : -1;
      return a.i - b.i;
    })
    .map(x => x.l);
}

// Posição mostrada: sem pular número (dois em 4º → o próximo é 5º). Empatados sem desempate dividem a posição.
// Recebe linhas já ordenadas e grava `posicao` em cada uma.
function rotularLinhas(linhas) {
  let pos = 0;
  let anterior = null;
  for (const l of linhas) {
    if (!anterior || l.pontos !== anterior.pontos || l.ordem !== anterior.ordem) pos++;
    l.posicao = pos;
    anterior = l;
  }
  return linhas;
}

// Grupos que vão para o desempate: mesma pontuação (com pontos), começando em 1º a 4º, e ainda sem ordem.
// Recebe linhas já ordenadas. Devolve uma lista de grupos (cada um é uma lista de linhas, na ordem atual).
function gruposDesempate(linhas) {
  const grupos = [];
  let i = 0;
  while (i < linhas.length) {
    let j = i + 1;
    while (j < linhas.length && linhas[j].pontos === linhas[i].pontos) j++;
    const grupo = linhas.slice(i, j);
    const tem = grupo.length >= 2 && linhas[i].pontos >= DESEMPATE_MIN_PONTOS && i + 1 <= DESEMPATE_ATE;
    if (tem && grupo.every(l => l.ordem === undefined)) grupos.push(grupo);
    i = j;
  }
  return grupos;
}

// Texto das posições disputadas: "2º × 3º lugar", "1º, 2º e 3º lugar" (usa a posição de cada linha no grupo)
function rotuloDisputa(inicioIndice, tamanho) {
  const nums = [];
  for (let k = 0; k < tamanho; k++) nums.push(`${inicioIndice + k + 1}º`);
  if (nums.length === 2) return `${nums[0]} × ${nums[1]} lugar`;
  return `${nums.slice(0, -1).join(', ')} e ${nums[nums.length - 1]} lugar`;
}

// ----- Disputa de um grupo: o tijolo tem vida igual ao número de jogadores que sobraram -----
// d.restantes: quem ainda disputa (na ordem do grupo); d.pontos: encostos desta etapa; d.vida: vida do tijolo;
// d.ordem: quem já foi decidido, na ordem (1º primeiro); d.fim: grupo resolvido.
function criarDisputa(chaves) {
  return { restantes: chaves.slice(), pontos: {}, vida: chaves.length, ordem: [], fim: false, empates: 0 };
}

// Uma bola encostou no tijolo: 1 ponto de desempate para ela e 1 de vida a menos.
// Devolve null (nada decidido), { empate: true } (o tijolo ganha 1 vida a mais) ou { decidido, fim }.
function tocarTijolo(d, chave) {
  if (d.fim || !d.restantes.includes(chave)) return null;
  d.pontos[chave] = (d.pontos[chave] || 0) + 1;
  d.vida--;
  if (d.vida > 0) return null;
  const max = Math.max(...d.restantes.map(k => d.pontos[k] || 0));
  const topo = d.restantes.filter(k => (d.pontos[k] || 0) === max);
  if (topo.length > 1) { // quebrou empatado: o tijolo ganha mais 1 vida e segue
    d.vida = 1;
    d.empates++;
    return { empate: true };
  }
  return decidirPosicao(d, topo[0]);
}

// Fecha a posição de quem tocou por último (sem empate) e começa a próxima etapa com o resto
function decidirPosicao(d, chave) {
  d.ordem.push(chave);
  d.restantes = d.restantes.filter(k => k !== chave);
  d.pontos = {};
  if (d.restantes.length <= 1) {
    d.ordem.push(...d.restantes);
    d.restantes = [];
    d.fim = true;
    return { decidido: chave, fim: true };
  }
  d.vida = d.restantes.length;
  return { decidido: chave, fim: false };
}

// Acabou o tempo: quem não foi decidido fica na ordem que tinha antes do desempate
function fecharPorTempo(d) {
  if (d.fim) return;
  d.ordem.push(...d.restantes);
  d.restantes = [];
  d.fim = true;
}
