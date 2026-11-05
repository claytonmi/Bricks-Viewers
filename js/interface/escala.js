// ----- Tamanho da tela -----
// A tela é montada em 1920x1080 e a imagem inteira aumenta ou diminui, então fica igual em 720p, 1080p ou 4K.
// O jogo continua sendo desenhado em 1200x680, para não pesar mais em PC fraco.
// No OBS vale sempre. No navegador só aumenta: diminuir deixaria o texto pequeno para quem joga no monitor.
function ajustarEscala() {
  const larg = window.innerWidth;
  const alt = window.innerHeight;
  const esc = Math.min(larg / TELA_BASE_W, alt / TELA_BASE_H);
  const usar = larg > TELA_MIN_ESCALA && (esc > 1 || modoAutomatico || !!window.obsstudio);
  const raiz = document.documentElement;
  const layout = document.querySelector('.layout');
  escalaTela = usar ? esc : 1;
  raiz.classList.toggle('escalada', usar);
  raiz.style.setProperty('--larg', usar ? `${larg / esc}px` : '100vw');
  raiz.style.setProperty('--alt', usar ? `${alt / esc}px` : '100vh');
  layout.style.transform = usar ? `scale(${esc})` : '';
}
window.addEventListener('resize', ajustarEscala);
ajustarEscala();
