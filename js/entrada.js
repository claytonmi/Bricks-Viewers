// ===== Entrada: teclado e mouse =====

// Converte a posição do mouse para o tamanho do canvas (1200x680)
function pontoNoCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height)
  };
}

// Setas e A/D movem a raquete
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') teclas.esq = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') teclas.dir = true;
  if (e.key.startsWith('Arrow')) e.preventDefault();
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') teclas.esq = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') teclas.dir = false;
});

let timerBarraVolume = null;   // esconde a barra de volume no celular depois de um tempo

// Ponto dentro de um retângulo da tela
function dentroDe(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// Muda o volume conforme a posição X na barra
function volumePelaPosicao(x) {
  const t = trilhoVolume();
  definirVolume((x - t.x0) / (t.x1 - t.x0));
}

// Mouse move: mostra a barra de volume, arrasta a bolinha e move a raquete (só depois do Pronto)
canvas.addEventListener('pointermove', e => {
  const p = pontoNoCanvas(e);
  mostrarVolume = estado !== 'menu' && (dentroDe(p, BOTAO_SOM) || dentroDe(p, BARRA_VOL));
  if (arrastandoVolume) {
    volumePelaPosicao(p.x);
    return;
  }
  if (estado !== 'contagem' && estado !== 'jogando') return;
  paddleX = p.x;
});

canvas.addEventListener('pointerleave', e => {
  if (e.pointerType === 'touch') return; // no celular a barra some sozinha (ver abaixo)
  if (!arrastandoVolume) mostrarVolume = false;
});

// Clique na barra de volume começa a arrastar
canvas.addEventListener('pointerdown', e => {
  const p = pontoNoCanvas(e);
  if (estado !== 'menu' && dentroDe(p, BARRA_VOL)) {
    arrastandoVolume = true;
    canvas.setPointerCapture(e.pointerId);
    volumePelaPosicao(p.x);
  }
  // no celular não existe "mouse em cima": toque no botão Som mostra a barra por 2,5 s
  if (e.pointerType === 'touch' && estado !== 'menu' && dentroDe(p, BOTAO_SOM)) {
    mostrarVolume = true;
    clearTimeout(timerBarraVolume);
    timerBarraVolume = setTimeout(() => {
      if (!arrastandoVolume) mostrarVolume = false;
    }, 2500);
  }
});

// Soltar o mouse em qualquer lugar termina o arraste
window.addEventListener('pointerup', () => {
  arrastandoVolume = false;
});

// Cliques: botão de som e botão Pronto
canvas.addEventListener('click', e => {
  const p = pontoNoCanvas(e);
  const m = BOTAO_SOM;
  if (estado !== 'menu' && dentroDe(p, m)) {
    alternarSom();
    return;
  }
  if (estado !== 'lobby') return;
  const b = BOTAO_PRONTO;
  if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
    iniciarContagem();
  }
});
