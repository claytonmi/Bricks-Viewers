// ===== Idiomas: todos os textos do jogo em português e inglês =====
// Cada frase tem um nome (chave). O HTML usa data-t="chave" e o JS usa t('chave', { valor }).
// Frase sem tradução no idioma atual aparece em português; chave que não existe aparece como a própria chave.
// Para um idioma novo: incluir o id em IDIOMAS, uma tabela em TEXTOS e uma bandeira no menu.
// Comandos do chat (!entrar, !speed...) e nomes de viewers/canal nunca passam por aqui.

const IDIOMAS = ['pt', 'en'];
const CHAVE_IDIOMA = 'bricksIdioma';
const LANG_HTML = { pt: 'pt-BR', en: 'en' };

const TEXTOS = {
  pt: {
    'menu.chat': 'Chat da Twitch',
    'menu.canalPlaceholder': 'nome do canal (ex: hercules_sc)',
    'menu.conectar': 'Conectar',
    'erro.imagem': 'Não achei a imagem: {src}',
    'status.inicial': 'Não conectado. Conecte o canal para liberar o Iniciar.',
    'status.digiteCanal': 'Digite o nome do canal (ex: hercules_sc).',
    'status.conectando': 'Conectando no chat de {canal}...',
    'status.conectado': 'Conectado no chat de {canal}. Pode digitar !entrar.',
    'status.falhaLogin': 'Não consegui entrar no chat. Tente de novo.',
    'status.erroConexao': 'Erro de conexão com a Twitch. Tentando de novo...',
    'status.reconectando': 'Chat desconectado. Reconectando em {s} s...',
    'status.canalParaLink': 'Digite o nome do canal para gerar o link do OBS.',
    'status.linkCopiado': 'Link copiado! No OBS: fonte Navegador, cole o link e use o tamanho da sua live (1280x720 ou 1920x1080).',
    'obs.dicaAmbos': 'Para gerar o link do OBS, conecte o canal e marque o Modo intervalo.',
    'obs.dicaConectar': 'Para gerar o link do OBS, conecte o canal.',
    'obs.dicaIntervalo': 'Para gerar o link do OBS, marque o Modo intervalo.',
    'obs.novoIntervalo': 'Novo intervalo em {s} s. Para começar já, o streamer ou um moderador digita !recomecar.',
    'obs.jogarDeNovo': 'Para jogar de novo, o streamer ou um moderador digita !recomecar no chat.',
    'menu.faseAnt': 'Fase anterior',
    'menu.faseProx': 'Próxima fase',
    'menu.faseMiniatura': 'Miniatura da fase',
    'menu.qtdViewers': 'Quantidade de viewers',
    'menu.pontua': 'Streamer pontua no ranking',
    'menu.intervalo': 'Modo intervalo (só o chat joga)',
    'menu.intervaloDica': 'Sem raquete: só o chat joga, as fases seguem em carrossel a partir da escolhida até você clicar em Voltei',
    'menu.skinRaquete': 'Skin da raquete',
    'menu.skinBarra': 'Skin da barra',
    'menu.skinDica': 'No modo intervalo, a skin vai para a barra de baixo, onde as bolas quicam',
    'menu.skinAnt': 'Skin anterior',
    'menu.skinProx': 'Próxima skin',
    'menu.corRaquete': 'Cor da raquete',
    'menu.corBarra': 'Cor da barra',
    'menu.corDica': 'No modo intervalo, a cor vai para a barra de baixo, onde as bolas quicam',
    'menu.corEscolher': 'Escolher a cor da raquete',
    'menu.padrao': 'Padrão',
    'menu.aparenciaAviso': 'Conecte o canal para escolher a raquete.',
    'menu.iniciar': 'Iniciar',
    'menu.info': 'Informações',
    'menu.linkObs': 'Copiar link para o OBS',
    'menu.linkObsDica': 'Copia um link para deixar o modo intervalo numa cena do OBS: o jogo conecta e começa sozinho.',
    'menu.feedback': 'Enviar feedback ou bug',
    'cmd.obsEntrarIntervalo': '(a qualquer momento, até {max} jogadores)',
    'cmd.obsEntrarAntes': '(antes de começar)',
    'cmd.obsSpeed': '(a cada {n} batidas em tijolos)',
    'cmd.obsBomb': '(1 bomba a cada {n} batidas, até {max})',
    'cmd.obsGrav': '(a cada {n} batidas, só 1)',
    'cmd.obsShock': '(a cada {n} batidas, só 1)',
    'fase.f1': 'Fase 1',
    'fase.f2': 'Fase 2',
    'fase.f3': 'Fase 3',
    'fase.f4': 'Fase 4',
    'fase.f5': 'Fase 5',
    'fase.f6': 'Fase 6: Espaço',
    'fase.natal': 'Fase Natalina',
    'fase.anoNovo': 'Fase Ano Novo Chinês',
    'skin.nenhuma': 'Sem skin (cor)',
    'skin.real': 'Real',
    'skin.lava': 'Lava',
    'skin.pixel': 'Pixel',
    'skin.neon': 'Neon',
    'skin.gelo': 'Gelo',
    'skin.madeira': 'Madeira',
    'skin.aco': 'Aço',
    'skin.toxica': 'Tóxica',
    'skin.oceano': 'Oceano',
    'skin.ametista': 'Ametista',
    'skin.sakura': 'Sakura',
    'skin.ouro': 'Ouro',
    'skin.camuflada': 'Camuflada',
    'skin.fundador': 'Fundador',
    'skin.eletrica': 'Elétrica',
    'skin.esmeralda': 'Esmeralda',
    'skin.galaxia': 'Galáxia',
    'skin.synthwave': 'Synthwave',
    'skin.disco': 'Disco Voador',
    'skin.bengala': 'Bengala Doce',
    'info.desenv': '<b>Desenvolvimento:</b> Clayton M.',
    'info.arte': '<b>Arte:</b> Daru',
    'info.abaJogo': 'Como jogar',
    'info.abaObs': 'Usar no OBS',
    'info.como': '<b>Como funciona:</b> o streamer controla a raquete. Cada viewer entra no jogo com uma bola pelo chat e tenta quebrar os tijolos. Quem quebrar mais tijolos fica no topo do ranking.',
    'info.cmdTitulo': '<b>Comandos no chat:</b>',
    'info.cmdEntrar': '<b>!entrar</b>: entra no jogo (antes de começar)',
    'info.cmdCor': '<b>!azul, !vermelho, !amarelo...</b>: muda a cor da sua bola',
    'info.cmdSpeed': '<b>!speed</b>: bola mais rápida por 5 segundos',
    'info.cmdBomb': '<b>!bomb</b>: empurra as bolas perto da sua e deixa elas mais rápidas por 1,5 segundo',
    'info.cmdGravity': '<b>!gravity</b>: puxa as bolas perto da sua por 2 segundos e depois lança todas para longe',
    'info.cmdShock': '<b>!shock</b>: sua bola fica elétrica por 1,5 segundo e atordoa (deixa quase paradas por 2 segundos) as bolas que passar perto',
    'info.extrasTitulo': '<b>Extras:</b>',
    'info.f1': 'Na Fase 1, os tijolos caem do céu como chuva e se empilham: 135 na partida com até 15 jogadores, aumentando até 250 com 100 jogadores. Quanto mais tijolos na tela, mais devagar a chuva.',
    'info.chefao': '<b>Tijolo chefão:</b> na Fase 1, quando a chuva acaba e sobram 4 tijolos ou menos, cai um tijolo grande e dourado com 40 de vida. Quem der a última batida ganha 5 pontos e derruba os tijolos que ainda sobravam. A partida só acaba depois que ele quebra.',
    'info.travado': '<b>Fim de fase travado:</b> se nenhuma bola encostar nos tijolos que sobraram por 10 s, uma bola escolhida ao acaso é atraída para o tijolo mais perto por 3 s.',
    'info.pausa': '<b>Pausa:</b> aperte <b>Esc</b> para pausar. Aparece o ranking atual com os botões Continuar e Voltar ao menu; o tempo do jogo para junto. Aperte Esc de novo (ou Continuar) para voltar. Funciona no lobby, na contagem, e durante a partida; nas telas de ranking não tem pausa. No OBS, a tecla não chega ao jogo.',
    'info.empate': '<b>Empate em pontos:</b> fica na frente quem chegou primeiro nessa pontuação, como num quiz em que leva quem responde antes. Se você e outra pessoa têm 5 pontos, quem fez o 5º ponto antes fica em cima; para passar, é preciso chegar no 6º antes. No modo intervalo, os pontos somam entre as fases e vale quando cada um chegou no total.',
    'info.f5': '<b>Fase 5 (fábrica):</b> as linhas de tijolos andam como esteiras, cada uma para um lado, e o tijolo que sai por uma borda volta pela outra. Durante a partida, entram mais tijolos pela borda: 100 no total com até 15 jogadores, até 150 com 100 jogadores. Quando sobram 4 tijolos ou menos, o chefão desce e fica indo e voltando, cada vez mais rápido conforme perde vida.',
    'info.f6': '<b>Fase 6 (espaço):</b> meteoros redondos espalhados pela tela. Os grandes precisam de 5 batidas e viram dois pedaços ao quebrar. Quando um acaba, outro entra pela parte de cima (no máximo 18 na tela). Meteoros que se encostam se empurram de leve. A raquete vira um disco voador. Um buraco de minhoca aparece de tempos em tempos: a bola que chega perto da entrada escura sai pela saída clara, na mesma direção em que entrou. Com 100 jogadores, são 150 meteoros.',
    'info.natal': '<b>Fase Natalina:</b> os tijolos são presentes e a neve cai. Quando sobram 4 tijolos ou menos, desce o saco do Papai Noel (40 de vida, balançando de um lado para o outro): quem der a última batida ganha 5 pontos e ele solta presentinhos que valem 1 ponto para a bola que pegar. De vez em quando passa uma rena voando lá em cima: acertar vale 10 pontos.',
    'info.anoNovo': '<b>Fase Ano Novo Chinês:</b> lanternas soltam moedas da sorte ao quebrar, envelopes vermelhos dão 2 pontos extras e fogos explodem e quebram os tijolos em volta. Moedas caem do céu (1 ponto para a bola que pegar) e fogos sobem do chão: a bola que passar por um ganha um poder pronto. Quando os tijolos acabam, entra o dragão com 40 de vida: quem der a última batida ganha 5 pontos. O fogo que ele solta atordoa as bolas, e se ele sair da tela a fase acaba.',
    'info.intervalo': '<b>Modo intervalo:</b> para quando você sai da live. Sem raquete, o chão vira parede e as bolas nunca caem. Você entra como uma bola (fora do ranking), a partida começa sozinha em 20 s e o chat entra com !entrar a qualquer momento. Não cai item nenhum. As fases seguem em carrossel a partir da escolhida, com o ranking (top 10) por 15 s entre elas; os pontos somam, mas os poderes zeram a cada fase. Na Fase 3, no fim cai um chefão com 40 de vida na parede do meio. Quem tinha poder pronto há mais de 1 min 30 s e não usou nenhum na fase perde os pontos daquela fase. Clique em <b>Voltei!</b> (embaixo do jogo) ou digite <b>!voltei</b> no chat (só você e os moderadores) para parar e ver o ranking. Vocês também controlam o som pelo chat: <b>!mudo</b>, <b>!som</b> e <b>!volume 30</b>.',
    'info.maisJogadores': 'Quanto mais jogadores, mais rápido saem os poderes: até 15 jogadores, os números abaixo; com 50 ou mais, !speed com 3 batidas, bomba com 6, !gravity com 7 e !shock com 8.',
    'info.bomba': 'A cada 10 vezes que a sua bola bate em tijolos, você ganha uma bomba (use com <b>!bomb</b>). Dá para guardar no máximo 2.',
    'info.speedCarga': 'A cada 5 vezes que a sua bola bate em tijolos, você ganha uma carga de velocidade (use com <b>!speed</b>).',
    'info.gravidade': 'A cada 12 vezes que a sua bola bate em tijolos, você ganha o campo gravitacional (use com <b>!gravity</b>). Não acumula: depois de usar, precisa de mais 12 batidas.',
    'info.choque': 'A cada 13 vezes que a sua bola bate em tijolos, você ganha o choque (use com <b>!shock</b>). Também não acumula.',
    'info.fila': 'Enquanto um poder seu está ativo, os poderes dos outros não pegam na sua bola. Se mandar outro poder nesse tempo, ele espera na fila e sai quando o primeiro acabar. Se a sua bola estiver sob o poder de outra (presa, atordoada ou empurrada), o seu comando também espera e sai 1,5 segundo depois que o efeito acabar.',
    'info.pontosStreamer': '<b>Pontos do streamer</b> (só com "Streamer pontua no ranking" marcado): você aparece no ranking como "Streamer" e ganha 1 ponto a cada tantas bolas que rebater com a raquete. Quanto mais viewers, mais rebatidas: até 10 viewers, 7 rebatidas; com 25, 14; com 75 ou mais, 25 (entre esses números, sobe aos poucos). O item Pontos (abaixo) dá mais 1 ponto, e o Menos ponto tira 1.',
    'info.itens': '<b>Itens para o streamer</b> (20% dos tijolos são sorteados para soltar um item ao quebrar; pegue com a raquete antes que passe dela). Com "Streamer pontua no ranking" marcado, cada partida tem 5 itens de pontos (Pontos ou Menos ponto), sempre, não importa o número de viewers. Desmarcado, só cai o Multibola:',
    'info.itemMultibola': '<b>Multibola</b>: cada bola do chat ganha uma cópia por 8 segundos. Os pontos da cópia vão para o dono. Pegar outro enquanto as cópias estão na tela renova o tempo.',
    'info.itemVelocidade': '<b>Velocidade</b> (laranja com um raio): todas as bolas ficam 2× mais rápidas por 5 segundos. Bola que já está com !speed continua 2×. Enquanto ele vale, o !speed do chat espera e sai quando ele acabar. Cai mesmo sem "Streamer pontua" marcado.',
    'info.itemPontos': '<b>Pontos</b>: o streamer ganha 1 ponto. Só cai com "Streamer pontua no ranking" marcado.',
    'info.itemMenos': '<b>Menos ponto</b> (bomba preta com brilho laranja): tira 1 ponto do streamer, sem passar de zero. Também só cai com "Streamer pontua no ranking" marcado.',
    'info.obsT1': 'Modo intervalo: tela de "já volto"',
    'info.obsIntro': 'O jogo funciona sozinho enquanto você está fora, e ninguém precisa clicar em nada.',
    'info.obs1': 'Neste menu, conecte o canal, marque <b>Modo intervalo</b>, escolha a fase e clique em <b>Copiar link para o OBS</b>.',
    'info.obs2': 'No OBS, crie uma cena de "já volto" e adicione uma fonte <b>Navegador</b>.',
    'info.obs3': 'Cole o link no campo <b>URL</b>.',
    'info.obs4': 'Em <b>Largura</b> e <b>Altura</b>, use o tamanho da sua transmissão: <b>1280 x 720</b> ou <b>1920 x 1080</b>. O jogo se ajusta sozinho. Em PC fraco, 1280 x 720 pesa menos.',
    'info.obs5': 'Ligue <b>Controlar áudio via OBS</b>. Sem isso, o jogo não aparece no mixer e você não consegue mutar nem regular o som dele.',
    'info.obs6': 'Deixe <b>desligadas</b> as opções <b>Desligar fonte quando não visível</b> e <b>Atualizar navegador quando a cena se tornar ativa</b>. Com elas ligadas, a página recarrega e o ranking se perde.',
    'info.obs7': 'Ao trocar para essa cena, o jogo começa sozinho em 20 segundos. O chat só precisa digitar <b>!entrar</b>.',
    'info.obs8': 'Quando voltar, é só trocar de cena: o jogo para e guarda o ranking, sem pesar no PC. Se preferir ficar na cena, digite <b>!voltei</b> para mostrar o ranking na hora.',
    'info.obs9': 'Ao abrir a cena de novo, o ranking aparece com uma contagem de 30 segundos, e depois começa um intervalo novo, com o chat entrando de novo. Se sair de cena durante a contagem, ela para e recomeça quando você voltar.',
    'info.obs10': 'Fechar o OBS apaga tudo, então a próxima live começa do zero.',
    'info.obsT2': 'Partida normal, com a raquete',
    'info.obsPartida': 'Você precisa do mouse ou do teclado, então o mais simples é abrir o jogo no navegador em tela cheia (F11) e usar a <b>Captura de janela</b> no OBS. Não minimize a janela nem troque de aba, porque o jogo pode parar.',
    'info.obsT3': 'Som do jogo',
    'info.somMutar': '<b>Mutar ou regular:</b> com <b>Controlar áudio via OBS</b> marcado, o jogo aparece no <b>Mixer de áudio</b> com o nome da fonte. Use a barra para o volume e o ícone de alto-falante para mutar. Se ele não aparecer, abra a fonte e confira se essa opção está marcada.',
    'info.somOuvir': '<b>Para você ouvir também:</b> com essa opção, o som vai para a live, mas pode não sair nos seus fones. No mixer, clique nos três pontinhos, abra <b>Propriedades avançadas de áudio</b> e, em <b>Monitoramento de áudio</b>, escolha <b>Monitorar e enviar</b>.',
    'info.somSem': '<b>Sem essa opção:</b> o jogo toca direto no computador e entra na live pelo <b>Áudio do desktop</b>. Mutar esse canal também muta o resto do computador na live.',
    'info.obsT4': 'Comandos no chat (só streamer e moderadores)',
    'info.thComando': 'Comando',
    'info.thFaz': 'O que faz',
    'info.tabVoltei': 'Para o modo intervalo e mostra o ranking, sem contagem',
    'info.tabRecomecar': 'Na tela do ranking, começa outro intervalo na hora, com os pontos zerados (só aberto pelo link)',
    'info.tabMudo': 'Desliga o som do jogo',
    'info.tabSom': 'Liga o som do jogo',
    'info.tabVolume': 'Muda o volume, de 0 a 100. O padrão é 15',
    'info.obsSomPadrao': 'Ao fechar o OBS, o som do jogo volta ao padrão. Para um ajuste que fica guardado, use o mixer do OBS.',
    'info.obsT5': 'Sugestões de configuração',
    'info.dicaTela': '<b>Tela cheia:</b> clique com o botão direito na fonte e escolha <b>Transformar &gt; Ajustar à tela</b>.',
    'info.dica60': '<b>Live em 60 FPS:</b> nas propriedades da fonte, marque <b>Usar FPS personalizado</b> e coloque 60.',
    'info.dicaVagas': '<b>Vagas:</b> ao marcar o Modo intervalo, o limite já vem em 75 jogadores. Se quiser outro número, mude antes de copiar o link, porque você estará fora para aumentar.',
    'info.dicaAtualizar': '<b>Jogo novo não apareceu?</b> Abra as propriedades da fonte e clique em <b>Atualizar</b>.',
    'info.dicaTeste': '<b>Teste antes da live:</b> troque para a cena, digite !entrar e depois !voltei.',
    'info.obsVersao': 'Os nomes das opções podem mudar um pouco conforme a versão e o idioma do OBS.',
    'info.voltar': 'Voltar',
    'painel.intro': 'Entre no jogo pelo chat e ganhe uma bola para jogar com o streamer. Quebre os tijolos: cada tijolo quebrado vale 1 ponto. Quem tiver mais pontos no final vence!',
    'painel.comandos': 'Comandos do chat',
    'painel.entrar': 'entra no jogo',
    'painel.cor': 'muda a cor da bola',
    'painel.corRgb': '(ou código RGB: <b>!#ff8800</b> ou <b>!cor 255 136 0</b>)',
    'painel.speed': 'bola 2× mais rápida por 5 s',
    'painel.bomb': 'empurra as bolas perto da sua',
    'painel.gravity': 'puxa as bolas perto da sua por 2 s e lança todas para longe',
    'painel.shock': 'sua bola fica elétrica por 1,5 s e deixa lentas as bolas que encostar',
    'painel.ausente': '<b>Use seus poderes!</b> Quem tem poder e não usa nenhum perde os pontos da fase.',
    'ranking.titulo': 'Ranking',
    'ranking.final': 'Ranking final',
    'ranking.intervalo': 'Ranking do intervalo',
    'ranking.linha': '{pos}  {nome}  -  {pts} pts',
    'ranking.maisJogadores': 'e mais {n} jogadores',
    'ranking.copiar': 'Copiar top 3',
    'ranking.copiado': 'Copiado!',
    'ranking.top3Titulo': '🏆 Bricks Viewers - Top 3',
    'ranking.top3Linha': '{medalha} {nome} - {pts} pts',
    'comum.voltarMenu': 'Voltar ao menu',
    'comum.continuar': 'Continuar',
    'pausa.titulo': 'Pausado',
    'pausa.dica': 'Esc para continuar',
    'pausa.ninguem': 'Ninguém entrou ainda',
    'jogo.pronto': 'Pronto',
    'jogo.lobbyIntervalo': 'Modo intervalo: digite !entrar  ({n}/{max})',
    'jogo.comecaEm': '{fase} começa em {s} s',
    'jogo.aguardando': 'Aguardando viewers: digite !entrar  ({n}/{max})',
    'jogo.esperaViewer': 'Espera pelo menos 1 viewer digitar !entrar',
    'jogo.pontoStreamer': 'Ponto do streamer: {n}',
    'jogo.contaTijolos': 'Tijolos: {n}',
    'jogo.contaMeteoros': 'Meteoros: {n}',
    'jogo.jogadores': 'Jogadores: {n}/{max}',
    'jogo.bolasNoAr': 'Bolas no ar: {n}/{max}',
    'jogo.chatCaiu': 'Chat da Twitch caiu, reconectando...',
    'jogo.somLigado': '🔊 Som',
    'jogo.somMudo': '🔇 Mudo',
    'jogo.iniciando': 'Iniciando jogo...',
    'jogo.valendo': 'Valendo..',
    'jogo.proximaEm': '{fase} em {s} s',
    'jogo.faseConcluida': '{fase} concluída - Ranking',
    'jogo.ninguemEntrou': 'Ninguém entrou ainda: digite !entrar',
    'jogo.pts': '{n} pts',
    'jogo.ausentes': 'Ausentes: tinham poder pronto e não usaram',
    'jogo.perdeu': '{nome}: perdeu {n} pts',
    'jogo.semPontos': '{nome}: sem pontos para perder',
    'jogo.emMais': 'e mais {n}',
    'jogo.avisoUsou': '{nome} usou {cmd}',
    'jogo.avisoEntrou': '{nome} entrou',
    'jogo.avisoCor': '{nome}, calma! Tá trocando de roupa rápido demais',
    'jogo.avisoFalta1': 'Falta 1 batida para {nome} usar {cmd}',
    'jogo.avisoFaltaN': 'Faltam {n} batidas para {nome} usar {cmd}',
    'jogo.ganhouBomba': '{nome} ganhou uma bomba',
    'jogo.ganhouGravity': '{nome} ganhou !gravity pronto',
    'jogo.ganhouShock': '{nome} ganhou !shock pronto',
    'jogo.ganhouSpeed': '{nome} ganhou !speed pronto',
    'jogo.chefao': 'Tijolo chefão!',
    'jogo.dragao': 'Dragão do Ano Novo!',
    'jogo.dragaoDerrotado': 'Dragão derrotado!',
    'jogo.dragaoFugiu': 'O dragão fugiu!',
    'jogo.sacoNoel': 'Saco do Papai Noel!',
    'jogo.acertouRena': '{nome} acertou a rena! +{n}',
    'jogo.multibola': 'Multibola!',
    'jogo.velocidade': 'Velocidade!',
    'ranking.proximaRodada': '{nome} só pode entrar na próxima rodada',
    'ranking.vagas': 'Vagas: {n}/{max}',
    'rodape.voltei': 'Voltei! Parar o intervalo',
    'rodape.avisoVoltei': 'Streamer: digite <b>!voltei</b> no chat para encerrar o intervalo',
    'rodape.creditos': 'Dev Clayton M. - Arte Daru',
  },
  en: {
    'menu.chat': 'Twitch chat',
    'menu.canalPlaceholder': 'channel name (e.g. hercules_sc)',
    'menu.conectar': 'Connect',
    'erro.imagem': 'Could not find the image: {src}',
    'status.inicial': 'Not connected. Connect your channel to unlock Start.',
    'status.digiteCanal': 'Enter the channel name (e.g. hercules_sc).',
    'status.conectando': 'Connecting to {canal}\'s chat...',
    'status.conectado': 'Connected to {canal}\'s chat. You can type !entrar.',
    'status.falhaLogin': 'Could not join the chat. Try again.',
    'status.erroConexao': 'Twitch connection error. Trying again...',
    'status.reconectando': 'Chat disconnected. Reconnecting in {s} s...',
    'status.canalParaLink': 'Enter the channel name to generate the OBS link.',
    'status.linkCopiado': 'Link copied! In OBS: add a Browser source, paste the link and use your stream size (1280x720 or 1920x1080).',
    'obs.dicaAmbos': 'To generate the OBS link, connect your channel and turn on Break mode.',
    'obs.dicaConectar': 'To generate the OBS link, connect your channel.',
    'obs.dicaIntervalo': 'To generate the OBS link, turn on Break mode.',
    'obs.novoIntervalo': 'New break in {s} s. To start now, the streamer or a mod types !recomecar.',
    'obs.jogarDeNovo': 'To play again, the streamer or a mod types !recomecar in the chat.',
    'menu.faseAnt': 'Previous stage',
    'menu.faseProx': 'Next stage',
    'menu.faseMiniatura': 'Stage thumbnail',
    'menu.qtdViewers': 'Number of viewers',
    'menu.pontua': 'Streamer scores on the leaderboard',
    'menu.intervalo': 'Break mode (only chat plays)',
    'menu.intervaloDica': 'No paddle: only chat plays, and stages rotate from the selected one until you click I\'m back',
    'menu.skinRaquete': 'Paddle skin',
    'menu.skinBarra': 'Bar skin',
    'menu.skinDica': 'In Break mode, the skin goes on the bottom bar, where the balls bounce',
    'menu.skinAnt': 'Previous skin',
    'menu.skinProx': 'Next skin',
    'menu.corRaquete': 'Paddle color',
    'menu.corBarra': 'Bar color',
    'menu.corDica': 'In Break mode, the color goes on the bottom bar, where the balls bounce',
    'menu.corEscolher': 'Choose the paddle color',
    'menu.padrao': 'Default',
    'menu.aparenciaAviso': 'Connect your channel to choose the paddle.',
    'menu.iniciar': 'Start',
    'menu.info': 'Info',
    'menu.linkObs': 'Copy OBS link',
    'menu.linkObsDica': 'Copies a link to run Break mode in an OBS scene: the game connects and starts by itself.',
    'menu.feedback': 'Send feedback or report a bug',
    'cmd.obsEntrarIntervalo': '(any time, up to {max} players)',
    'cmd.obsEntrarAntes': '(before it starts)',
    'cmd.obsSpeed': '(every {n} brick hits)',
    'cmd.obsBomb': '(1 bomb every {n} hits, up to {max})',
    'cmd.obsGrav': '(every {n} hits, only 1)',
    'cmd.obsShock': '(every {n} hits, only 1)',
    'fase.f1': 'Stage 1',
    'fase.f2': 'Stage 2',
    'fase.f3': 'Stage 3',
    'fase.f4': 'Stage 4',
    'fase.f5': 'Stage 5',
    'fase.f6': 'Stage 6: Space',
    'fase.natal': 'Christmas Stage',
    'fase.anoNovo': 'Chinese New Year Stage',
    'skin.nenhuma': 'No skin (color)',
    'skin.real': 'Royal',
    'skin.lava': 'Lava',
    'skin.pixel': 'Pixel',
    'skin.neon': 'Neon',
    'skin.gelo': 'Ice',
    'skin.madeira': 'Wood',
    'skin.aco': 'Steel',
    'skin.toxica': 'Toxic',
    'skin.oceano': 'Ocean',
    'skin.ametista': 'Amethyst',
    'skin.sakura': 'Sakura',
    'skin.ouro': 'Gold',
    'skin.camuflada': 'Camo',
    'skin.fundador': 'Founder',
    'skin.eletrica': 'Electric',
    'skin.esmeralda': 'Emerald',
    'skin.galaxia': 'Galaxy',
    'skin.synthwave': 'Synthwave',
    'skin.disco': 'Flying Saucer',
    'skin.bengala': 'Candy Cane',
    'info.desenv': '<b>Development:</b> Clayton M.',
    'info.arte': '<b>Art:</b> Daru',
    'info.abaJogo': 'How to play',
    'info.abaObs': 'Use in OBS',
    'info.como': '<b>How it works:</b> the streamer controls the paddle. Each viewer joins the game with a ball through the chat and tries to break the bricks. Whoever breaks the most bricks tops the leaderboard.',
    'info.cmdTitulo': '<b>Chat commands:</b>',
    'info.cmdEntrar': '<b>!entrar</b>: join the game (before it starts)',
    'info.cmdCor': '<b>!azul, !vermelho, !amarelo...</b>: change the color of your ball',
    'info.cmdSpeed': '<b>!speed</b>: your ball goes faster for 5 seconds',
    'info.cmdBomb': '<b>!bomb</b>: pushes the balls near yours away and makes them faster for 1.5 seconds',
    'info.cmdGravity': '<b>!gravity</b>: pulls the balls near yours in for 2 seconds, then launches them all away',
    'info.cmdShock': '<b>!shock</b>: your ball turns electric for 1.5 seconds and stuns (leaves almost still for 2 seconds) the balls it passes near',
    'info.extrasTitulo': '<b>Extras:</b>',
    'info.f1': 'On Stage 1, bricks fall from the sky like rain and pile up: 135 in a match with up to 15 players, rising to 250 with 100 players. The more bricks on screen, the slower the rain.',
    'info.chefao': '<b>Boss brick:</b> on Stage 1, when the rain ends and 4 bricks or fewer are left, a big golden brick with 40 health drops. Whoever lands the last hit gets 5 points and knocks down the bricks that were left. The match only ends after it breaks.',
    'info.travado': '<b>Stuck stage end:</b> if no ball touches the remaining bricks for 10 s, a random ball is pulled toward the nearest brick for 3 s.',
    'info.pausa': '<b>Pause:</b> press <b>Esc</b> to pause. The current leaderboard appears with the Continue and Back to menu buttons; game time stops too. Press Esc again (or Continue) to resume. It works in the lobby, during the countdown, and during the match; there is no pause on the leaderboard screens. In OBS, the key does not reach the game.',
    'info.empate': '<b>Tied on points:</b> whoever reached that score first stays ahead, like a quiz where the fastest answer wins. If you and someone else have 5 points, whoever scored their 5th point first is on top; to pass them, you need to reach 6 first. In Break mode, points add up across stages and what counts is when each player reached their total.',
    'info.f5': '<b>Stage 5 (factory):</b> the rows of bricks move like conveyor belts, each one in its own direction, and a brick that leaves through one edge comes back through the other. During the match, more bricks come in through the edge: 100 in total with up to 15 players, up to 150 with 100 players. When 4 bricks or fewer are left, the boss comes down and keeps moving back and forth, faster and faster as it loses health.',
    'info.f6': '<b>Stage 6 (space):</b> round meteors scattered across the screen. The big ones take 5 hits and split into two pieces when they break. When one is gone, another enters from the top (at most 18 on screen). Meteors that touch push each other gently. The paddle becomes a flying saucer. A wormhole appears from time to time: a ball that gets near the dark entrance comes out of the light exit, in the same direction it went in. With 100 players, there are 150 meteors.',
    'info.natal': '<b>Christmas Stage:</b> the bricks are presents and snow falls. When 4 bricks or fewer are left, Santa\'s sack comes down (40 health, swaying from side to side): whoever lands the last hit gets 5 points and it drops little presents worth 1 point to the ball that catches them. Now and then a reindeer flies by up high: hitting it is worth 10 points.',
    'info.anoNovo': '<b>Chinese New Year Stage:</b> lanterns drop lucky coins when broken, red envelopes give 2 extra points and fireworks explode and break the bricks around them. Coins fall from the sky (1 point for the ball that catches one) and fireworks rise from the ground: a ball that passes through one gets a ready-made power. When the bricks run out, the dragon comes in with 40 health: whoever lands the last hit gets 5 points. The fire it breathes stuns the balls, and if it leaves the screen the stage ends.',
    'info.intervalo': '<b>Break mode:</b> for when you step away from the stream. With no paddle, the floor becomes a wall and the balls never fall. You join as a ball (off the leaderboard), the match starts by itself in 20 s and the chat joins with !entrar at any time. No items drop. The stages cycle from the selected one, with the leaderboard (top 10) for 15 s between them; points add up, but powers reset every stage. On Stage 3, a boss with 40 health drops at the end on the middle wall. Anyone who had a power ready for more than 1 min 30 s and used none during the stage loses that stage\'s points. Click <b>I\'m back!</b> (below the game) or type <b>!voltei</b> in the chat (only you and the moderators) to stop and see the leaderboard. You and the mods can also control the sound through the chat: <b>!mudo</b>, <b>!som</b> and <b>!volume 30</b>.',
    'info.maisJogadores': 'The more players, the faster the powers come out: up to 15 players, the numbers below; with 50 or more, !speed at 3 hits, bomb at 6, !gravity at 7 and !shock at 8.',
    'info.bomba': 'Every 10 brick hits by your ball, you get a bomb (use it with <b>!bomb</b>). You can keep 2 at most.',
    'info.speedCarga': 'Every 5 brick hits by your ball, you get a speed charge (use it with <b>!speed</b>).',
    'info.gravidade': 'Every 12 brick hits by your ball, you get the gravity field (use it with <b>!gravity</b>). It does not stack: after using it, you need 12 more hits.',
    'info.choque': 'Every 13 brick hits by your ball, you get the shock (use it with <b>!shock</b>). It does not stack either.',
    'info.fila': 'While one of your powers is active, other players\' powers do not affect your ball. If you send another power during that time, it waits in the queue and fires when the first one ends. If your ball is under another player\'s power (trapped, stunned or pushed), your command also waits and fires 1.5 seconds after the effect ends.',
    'info.pontosStreamer': '<b>Streamer points</b> (only with "Streamer scores on the leaderboard" checked): you appear on the leaderboard as "Streamer" and earn 1 point for every so many balls you bounce with the paddle. The more viewers, the more bounces: up to 10 viewers, 7 bounces; with 25, 14; with 75 or more, 25 (between those numbers, it rises gradually). The Points item (below) gives 1 more point, and Minus point takes away 1.',
    'info.itens': '<b>Items for the streamer</b> (20% of the bricks are randomly picked to drop an item when broken; catch it with the paddle before it gets past). With "Streamer scores on the leaderboard" checked, each match has 5 points items (Points or Minus point), always, no matter how many viewers. Unchecked, only Multiball drops:',
    'info.itemMultibola': '<b>Multiball</b>: each chat ball gets a copy for 8 seconds. The copy\'s points go to its owner. Catching another one while the copies are on screen renews the time.',
    'info.itemVelocidade': '<b>Speed</b> (orange with a lightning bolt): all balls go 2× faster for 5 seconds. A ball already under !speed stays at 2×. While it lasts, the chat\'s !speed waits and fires when it ends. It drops even without "Streamer scores on the leaderboard" checked.',
    'info.itemPontos': '<b>Points</b>: the streamer gets 1 point. Only drops with "Streamer scores on the leaderboard" checked.',
    'info.itemMenos': '<b>Minus point</b> (black bomb with an orange glow): takes 1 point from the streamer, never going below zero. Also only drops with "Streamer scores on the leaderboard" checked.',
    'info.obsT1': 'Break mode: "be right back" screen',
    'info.obsIntro': 'The game runs by itself while you are away, and nobody needs to click anything.',
    'info.obs1': 'In this menu, connect your channel, turn on <b>Break mode</b>, pick the stage and click <b>Copy OBS link</b>.',
    'info.obs2': 'In OBS, create a "be right back" scene and add a <b>Browser</b> source.',
    'info.obs3': 'Paste the link into the <b>URL</b> field.',
    'info.obs4': 'In <b>Width</b> and <b>Height</b>, use your stream size: <b>1280 x 720</b> or <b>1920 x 1080</b>. The game adjusts by itself. On a weak PC, 1280 x 720 is lighter.',
    'info.obs5': 'Turn on <b>Control audio via OBS</b>. Without it, the game does not show up in the mixer and you cannot mute or adjust its sound.',
    'info.obs6': 'Keep <b>Shutdown source when not visible</b> and <b>Refresh browser when scene becomes active</b> <b>turned off</b>. With them on, the page reloads and the leaderboard is lost.',
    'info.obs7': 'When you switch to that scene, the game starts by itself in 20 seconds. The chat only needs to type <b>!entrar</b>.',
    'info.obs8': 'When you are back, just switch scenes: the game stops and keeps the leaderboard, without weighing on your PC. If you prefer to stay on the scene, type <b>!voltei</b> to show the leaderboard right away.',
    'info.obs9': 'When you open the scene again, the leaderboard shows up with a 30-second countdown, and then a new break starts, with the chat joining again. If you leave the scene during the countdown, it stops and restarts when you come back.',
    'info.obs10': 'Closing OBS erases everything, so the next stream starts from scratch.',
    'info.obsT2': 'Regular match, with the paddle',
    'info.obsPartida': 'You need the mouse or keyboard, so the simplest is to open the game in your browser in full screen (F11) and use <b>Window Capture</b> in OBS. Do not minimize the window or switch tabs, because the game may stop.',
    'info.obsT3': 'Game sound',
    'info.somMutar': '<b>Mute or adjust:</b> with <b>Control audio via OBS</b> checked, the game shows up in the <b>Audio Mixer</b> under the source\'s name. Use the slider for volume and the speaker icon to mute. If it does not show up, open the source and check that this option is checked.',
    'info.somOuvir': '<b>To hear it yourself too:</b> with that option, the sound goes to the stream but may not come out of your headphones. In the mixer, click the three dots, open <b>Advanced Audio Properties</b> and, under <b>Audio Monitoring</b>, choose <b>Monitor and Output</b>.',
    'info.somSem': '<b>Without that option:</b> the game plays straight on your computer and reaches the stream through <b>Desktop Audio</b>. Muting that channel also mutes the rest of your computer on the stream.',
    'info.obsT4': 'Chat commands (streamer and moderators only)',
    'info.thComando': 'Command',
    'info.thFaz': 'What it does',
    'info.tabVoltei': 'Stops Break mode and shows the leaderboard, with no countdown',
    'info.tabRecomecar': 'On the leaderboard screen, starts another break right away, with points reset (only when opened through the link)',
    'info.tabMudo': 'Turns the game sound off',
    'info.tabSom': 'Turns the game sound on',
    'info.tabVolume': 'Changes the volume, from 0 to 100. The default is 15',
    'info.obsSomPadrao': 'When you close OBS, the game sound goes back to the default. For a setting that sticks, use the OBS mixer.',
    'info.obsT5': 'Setup tips',
    'info.dicaTela': '<b>Full screen:</b> right-click the source and choose <b>Transform &gt; Fit to screen</b>.',
    'info.dica60': '<b>60 FPS stream:</b> in the source properties, check <b>Use custom frame rate</b> and enter 60.',
    'info.dicaVagas': '<b>Slots:</b> when you turn on Break mode, the limit is already 75 players. If you want another number, change it before copying the link, because you will be away and unable to raise it.',
    'info.dicaAtualizar': '<b>Game not showing up?</b> Open the source properties and click <b>Refresh</b>.',
    'info.dicaTeste': '<b>Test before going live:</b> switch to the scene, type !entrar and then !voltei.',
    'info.obsVersao': 'Option names may vary a little depending on your OBS version and language.',
    'info.voltar': 'Back',
    'painel.intro': 'Join the game through the chat and get a ball to play with the streamer. Break the bricks: each brick broken is worth 1 point. Whoever has the most points at the end wins!',
    'painel.comandos': 'Chat commands',
    'painel.entrar': 'joins the game',
    'painel.cor': 'changes the color of the ball',
    'painel.corRgb': '(or an RGB code: <b>!#ff8800</b> or <b>!cor 255 136 0</b>)',
    'painel.speed': 'ball 2× faster for 5 s',
    'painel.bomb': 'pushes the balls near yours away',
    'painel.gravity': 'pulls the balls near yours in for 2 s and launches them all away',
    'painel.shock': 'your ball turns electric for 1.5 s and slows down the balls it touches',
    'painel.ausente': '<b>Use your powers!</b> Anyone with a power who uses none loses that stage\'s points.',
    'ranking.titulo': 'Leaderboard',
    'ranking.final': 'Final leaderboard',
    'ranking.intervalo': 'Break leaderboard',
    'ranking.linha': '{pos}  {nome}  -  {pts} pts',
    'ranking.maisJogadores': 'and {n} more players',
    'ranking.copiar': 'Copy top 3',
    'ranking.copiado': 'Copied!',
    'ranking.top3Titulo': '🏆 Bricks Viewers - Top 3',
    'ranking.top3Linha': '{medalha} {nome} - {pts} pts',
    'comum.voltarMenu': 'Back to menu',
    'comum.continuar': 'Continue',
    'pausa.titulo': 'Paused',
    'pausa.dica': 'Esc to continue',
    'pausa.ninguem': 'Nobody has joined yet',
    'jogo.pronto': 'Ready',
    'jogo.lobbyIntervalo': 'Break mode: type !entrar  ({n}/{max})',
    'jogo.comecaEm': '{fase} starts in {s} s',
    'jogo.aguardando': 'Waiting for viewers: type !entrar  ({n}/{max})',
    'jogo.esperaViewer': 'Wait for at least 1 viewer to type !entrar',
    'jogo.pontoStreamer': 'Streamer points: {n}',
    'jogo.contaTijolos': 'Bricks: {n}',
    'jogo.contaMeteoros': 'Meteors: {n}',
    'jogo.jogadores': 'Players: {n}/{max}',
    'jogo.bolasNoAr': 'Balls in play: {n}/{max}',
    'jogo.chatCaiu': 'Twitch chat dropped, reconnecting...',
    'jogo.somLigado': '🔊 Sound',
    'jogo.somMudo': '🔇 Muted',
    'jogo.iniciando': 'Starting game...',
    'jogo.valendo': 'Game on!',
    'jogo.proximaEm': '{fase} in {s} s',
    'jogo.faseConcluida': '{fase} cleared - Leaderboard',
    'jogo.ninguemEntrou': 'Nobody joined yet: type !entrar',
    'jogo.pts': '{n} pts',
    'jogo.ausentes': 'Idle: had a power ready and didn\'t use it',
    'jogo.perdeu': '{nome}: lost {n} pts',
    'jogo.semPontos': '{nome}: no points to lose',
    'jogo.emMais': 'and {n} more',
    'jogo.avisoUsou': '{nome} used {cmd}',
    'jogo.avisoEntrou': '{nome} joined',
    'jogo.avisoCor': '{nome}, easy! You\'re changing outfits too fast',
    'jogo.avisoFalta1': '1 brick hit left for {nome} to use {cmd}',
    'jogo.avisoFaltaN': '{n} brick hits left for {nome} to use {cmd}',
    'jogo.ganhouBomba': '{nome} got a bomb',
    'jogo.ganhouGravity': '{nome} got !gravity ready',
    'jogo.ganhouShock': '{nome} got !shock ready',
    'jogo.ganhouSpeed': '{nome} got !speed ready',
    'jogo.chefao': 'Boss brick!',
    'jogo.dragao': 'New Year Dragon!',
    'jogo.dragaoDerrotado': 'Dragon defeated!',
    'jogo.dragaoFugiu': 'The dragon got away!',
    'jogo.sacoNoel': 'Santa\'s sack!',
    'jogo.acertouRena': '{nome} hit the reindeer! +{n}',
    'jogo.multibola': 'Multiball!',
    'jogo.velocidade': 'Speed!',
    'ranking.proximaRodada': '{nome} can only join the next round',
    'ranking.vagas': 'Slots: {n}/{max}',
    'rodape.voltei': 'I\'m back! Stop the break',
    'rodape.avisoVoltei': 'Streamer: type <b>!voltei</b> in the chat to end the break',
    'rodape.creditos': 'Dev Clayton M. - Art Daru',
  },
};

let idiomaAtual = 'pt';
const aoTrocarIdiomaFns = [];

function idiomaValido(id) {
  return IDIOMAS.indexOf(id) !== -1;
}

// Idioma guardado no navegador; sem ele, o do navegador (português se começar com "pt", senão inglês)
function idiomaInicial() {
  let guardado = '';
  try { guardado = localStorage.getItem(CHAVE_IDIOMA) || ''; } catch (e) { /* sem armazenamento */ }
  if (idiomaValido(guardado)) return guardado;
  const lingua = (typeof navigator !== 'undefined' && navigator.language) || '';
  return /^pt/i.test(lingua) ? 'pt' : 'en';
}

function emLocalhost() {
  return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
}

// Frase pelo nome, no idioma atual; {nome} é trocado por valores.nome
function t(chave, valores) {
  let texto = TEXTOS[idiomaAtual][chave];
  if (texto === undefined) texto = TEXTOS.pt[chave];
  if (texto === undefined) {
    if (emLocalhost()) console.warn('Texto sem tradução: ' + chave);
    return chave;
  }
  if (valores) texto = texto.replace(/\{(\w+)\}/g, (m, nome) => (nome in valores ? valores[nome] : m));
  return texto;
}

// Escreve a frase no elemento e guarda a chave e os valores para refazer quando o idioma mudar.
// html = true só para frases nossas (negrito, links), nunca para texto vindo do chat.
function definirTexto(el, chave, valores, html) {
  el.dataset.t = chave;
  if (valores) el.dataset.tv = JSON.stringify(valores); else delete el.dataset.tv;
  if (html) el.dataset.tHtml = '1'; else delete el.dataset.tHtml;
  escreverTexto(el);
}

// Como definirTexto, mas só mexe na tela se o texto mudou (para quem atualiza várias vezes por segundo)
function atualizarTexto(el, chave, valores) {
  if (el.dataset.t === chave && el.textContent === t(chave, valores)) return;
  definirTexto(el, chave, valores);
}

function escreverTexto(el) {
  let valores;
  try { valores = el.dataset.tv ? JSON.parse(el.dataset.tv) : undefined; } catch (e) { valores = undefined; }
  const texto = t(el.dataset.t, valores);
  if (el.dataset.tHtml) el.innerHTML = texto; else el.textContent = texto;
}

function aoTrocarIdioma(fn) {
  aoTrocarIdiomaFns.push(fn);
}

// Refaz tudo o que está marcado na página e avisa quem montou texto no JS
function aplicarIdioma() {
  document.documentElement.lang = LANG_HTML[idiomaAtual];
  document.querySelectorAll('[data-t]').forEach(escreverTexto);
  [['data-t-title', 'title'], ['data-t-placeholder', 'placeholder'], ['data-t-aria', 'aria-label'], ['data-t-alt', 'alt']].forEach(([marca, atributo]) => {
    document.querySelectorAll('[' + marca + ']').forEach(el => el.setAttribute(atributo, t(el.getAttribute(marca))));
  });
  document.querySelectorAll('.bandeira[data-idioma]').forEach(el => {
    el.classList.toggle('ativa', el.dataset.idioma === idiomaAtual);
  });
  aoTrocarIdiomaFns.forEach(fn => {
    try { fn(); } catch (e) { console.error(e); } // um aviso com erro não impede os outros
  });
}

function escolherIdioma(id, guardar) {
  idiomaAtual = idiomaValido(id) ? id : 'pt';
  if (guardar) {
    try { localStorage.setItem(CHAVE_IDIOMA, idiomaAtual); } catch (e) { /* só não lembra */ }
  }
  aplicarIdioma();
}

// Chamada uma vez ao iniciar (main.js): liga as bandeiras e escreve tudo no idioma atual
function iniciarIdioma() {
  document.querySelectorAll('.bandeira[data-idioma]').forEach(el => {
    el.onclick = () => escolherIdioma(el.dataset.idioma, true);
  });
  aplicarIdioma();
}

// Posição em ordinal: 1º em português; 1st, 2nd, 3rd, 4th... em inglês (11, 12 e 13 são th)
function ordinal(n) {
  if (idiomaAtual !== 'en') return n + 'º';
  const resto100 = n % 100;
  if (resto100 >= 11 && resto100 <= 13) return n + 'th';
  const sufixo = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
  return n + sufixo;
}

// Nome da fase para mostrar; FASES[i].nome continua em português por dentro
function nomeFase(f) {
  return f.chave ? t('fase.' + f.chave) : f.nome;
}

// Texto guardado num objeto ({ chave, valores }): avisos em cima da bola, anúncio, aviso do lobby.
// Guardar a chave (e não o texto pronto) deixa o aviso já na tela mudar de idioma.
function tGuardado(g) {
  return g ? t(g.chave, g.valores) : '';
}

// Nome da skin para mostrar; skin do servidor desconhecida mostra o nome que o servidor mandou
function nomeSkin(s) {
  const chave = 'skin.' + (s.id || 'nenhuma'); // sem skin (cor) é a chave skin.nenhuma
  if (chave in TEXTOS.pt) return t(chave);
  return s.nome;
}

idiomaAtual = idiomaInicial();
