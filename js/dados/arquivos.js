// Imagens que o jogo carrega ao abrir (fundos entram pela fase)
const ARQUIVOS = {
  bola: 'assets/imagens/sprites/bola.png',
  paddle: 'assets/imagens/sprites/raquete.png',
  tijolo: 'assets/imagens/sprites/tijolo-vida-3.png',
  tijolo3: 'assets/imagens/sprites/tijolo-vida-2.png',
  tijolo4: 'assets/imagens/sprites/tijolo-vida-1.png'
};
FASES.forEach((f, i) => { ARQUIVOS['fundo' + i] = f.fundo; });
