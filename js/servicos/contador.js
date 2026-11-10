// ===== Contador de acessos (GoatCounter) =====
// Conta as visitas à página e dois eventos: "copiou o link do OBS" e "abriu no OBS".
// Não envia nome de canal nem de ninguém: o endereço vai sem o "?canal=...", e os eventos só têm o nome do evento.
// O GoatCounter não usa cookies e não conta quem abre pelo próprio computador (localhost).
// Desligado enquanto CONTADOR_CODIGO estiver vazio. Para ligar: crie o site em goatcounter.com e coloque aqui
// o código do endereço (o "xxx" de https://xxx.goatcounter.com).

const CONTADOR_CODIGO = '';

const eventosPendentes = []; // eventos que chegaram antes do script do contador carregar

function ligarContador() {
  if (!CONTADOR_CODIGO) return;
  // sem a parte depois do "?": o link do OBS tem o nome do canal, que não pode ir para o contador
  window.goatcounter = { path: () => location.pathname || '/' };
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${CONTADOR_CODIGO}.goatcounter.com/count`;
  s.onload = () => eventosPendentes.splice(0).forEach(enviarEvento);
  document.head.appendChild(s);
}

// Conta um evento (ex: 'copiou-link-obs'). Sem código configurado, não faz nada.
function contarEvento(nome) {
  if (!CONTADOR_CODIGO) return;
  if (window.goatcounter && typeof window.goatcounter.count === 'function') enviarEvento(nome);
  else eventosPendentes.push(nome);
}

function enviarEvento(nome) {
  try {
    window.goatcounter.count({ path: nome, title: nome, event: true });
  } catch (e) {
    // contador fora do ar ou bloqueado (bloqueador de anúncios): o jogo segue normal
  }
}

ligarContador();
