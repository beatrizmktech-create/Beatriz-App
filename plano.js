/* Plano de 12 semanas para dois perfis (A: ganho de peso e músculo; B: perda de gordura).
 * Arquivo só de dados + funções puras. Usado pelo app (index.html) e pelo
 * gerador de lembretes (scripts/gerar-ics.mjs). Para mudar um horário,
 * uma refeição ou um exercício, edite aqui. */
(function (g) {
  "use strict";

  const SEMANAS = 12;
  const INICIO_PADRAO = "2026-10-19"; // segunda-feira

  const PESSOAS = {
    a: {
      id: "a",
      nome: "Perfil A",
      objetivo: "Ganhar peso e músculo",
      kcal: ["≈ 2.200 kcal", "≈ 2.400 kcal", "≈ 2.550 kcal"],
      proteina: "90–110 g/dia",
      aguaMl: 200,
      creatina: "3 g",
      medida: "Peso em jejum, depois do banheiro",
      metaMedida: "+0,2 a 0,4 kg por semana",
    },
    b: {
      id: "b",
      nome: "Perfil B",
      objetivo: "Perder gordura e firmar o corpo",
      kcal: ["≈ 1.750 kcal", "≈ 1.750 kcal", "≈ 1.650–1.750 kcal"],
      proteina: "115–125 g/dia",
      aguaMl: 300,
      creatina: "5 g",
      medida: "Cintura (no umbigo) + braço + peso",
      metaMedida: "−0,5 cm de cintura a cada 2 semanas",
    },
  };

  /* ---------- Dieta ---------- */
  // hora: horário fixo. min: versão mínima para dia difícil.
  const REFEICOES = {
    a: [
      {
        id: "cafe", hora: "07:30", nome: "Café da manhã reforçado", kcal: 525,
        itens: [
          "2 ovos mexidos com 1 fatia de muçarela",
          "2 fatias de pão integral",
          "200 ml de leite com café (mexa a creatina aqui)",
          "½ banana ou 1 fatia de mamão",
        ],
        trocas: [
          "Panqueca: 2 ovos + 1 banana + 2 colheres (sopa) de aveia, frita na frigideira",
          "Pão integral com ricota + ovo + leite",
        ],
        min: "1 copo de leite + 1 pão com queijo. Ou o shake da manhã agora.",
        mes2: "+1 ovo",
        mes3: "+1 fatia de queijo",
        dica: "É a refeição que você mais gosta: é aqui que entra mais comida.",
      },
      {
        id: "lanche1", hora: "10:00", nome: "Shake 1 (liquidificador)", kcal: 510,
        itens: [
          "250 ml de leite integral",
          "1 dose (30 g) de whey",
          "1 banana pequena congelada",
          "2 colheres (sopa) de aveia",
          "1 colher (sopa) de pasta de amendoim",
        ],
        trocas: [
          "Versão com menos açúcar: troque a banana por ½ xícara de frutas vermelhas congeladas + ¼ de abacate",
          "Versão chocolate: + 1 colher (chá) de cacau 100%",
        ],
        min: "Leite + whey batidos. Só isso já conta.",
        mes2: "+1 colher (sopa) de pasta de amendoim",
        mes3: "+¼ de abacate",
        dica: "Pode beber em goles por 30–40 min, enquanto trabalha. Não precisa tomar de uma vez.",
      },
      {
        id: "almoco", hora: "12:15", nome: "Almoço pequeno", kcal: 335,
        itens: [
          "Prato de sobremesa, não prato raso",
          "2 colheres (sopa) de legume cozido macio (cenoura, abobrinha, abóbora) + fio de azeite",
          "Proteína macia: 2 colheres (sopa) de frango desfiado no molho, ou 1 ovo, ou omelete",
          "1 concha de feijão (pode ser só o caldo grosso ou batido)",
          "3 colheres (sopa) de arroz ou purê",
        ],
        trocas: [
          "Sopa creme: abóbora + frango desfiado + azeite, batida",
          "Omelete de 2 ovos com queijo + purê de batata",
          "Atum com requeijão no pão integral",
        ],
        min: "Sopa creme ou 1 copo de leite + 1 ovo. Se não descer nada, faça o shake.",
        mes2: "+1 colher (sopa) de azeite no prato",
        mes3: "+1 colher de proteína",
        dica: "Coma na ordem: legume → proteína → arroz/feijão por último. Essa ordem reduz o pico de açúcar no sangue.",
      },
      {
        id: "lanche2", hora: "15:30", nome: "Lanche da tarde", kcal: 250,
        itens: [
          "1 iogurte natural integral (170 g)",
          "1 colher (sopa) de chia",
          "10 g de castanhas picadas (≈ 4 unidades) ou 2 colheres de granola sem açúcar",
          "4 morangos picados",
        ],
        trocas: [
          "Vitamina de abacate: ½ abacate pequeno + 200 ml de leite + cacau + adoçante",
          "Queijo + 1 torrada integral + 1 fruta",
        ],
        min: "1 iogurte ou 1 copo de leite.",
        mes2: "",
        mes3: "Troque por um 2º shake igual ao das 10h",
        dica: "",
      },
      {
        id: "pre", hora: "18:00", nome: "Pré-treino / lanche", kcal: 160,
        itens: ["1 fatia de pão integral com 1 colher (sopa) de pasta de amendoim"],
        trocas: ["½ banana + 1 fatia de queijo", "1 copo de leite"],
        min: "½ banana.",
        mes2: "+½ banana",
        mes3: "",
        dica: "Nos dias sem treino é o lanche da tarde 2.",
      },
      {
        id: "jantar", hora: "20:15", nome: "Jantar-sobremesa planejado", kcal: 360,
        itens: [
          "Achocolatado turbinado: 300 ml de leite",
          "+ 1 colher (sopa) de cacau 100%",
          "+ achocolatado comum (quantidade da redução gradual, abaixo)",
          "+ 1 colher (sopa) de pasta de amendoim + 1 colher (sopa) de aveia, batido",
        ],
        trocas: [
          "Mousse: ½ abacate + cacau + 1 dose de whey + adoçante",
          "Omelete ou crepioca com queijo + 2 quadradinhos de chocolate 70%",
          "Caldo de frango com legumes + o doce depois",
        ],
        min: "Leite com achocolatado. Melhor tomar algo do que pular o jantar.",
        mes2: "",
        mes3: "+1 dose de whey se o peso não subiu nas últimas 2 semanas",
        dica: "Achocolatado comum é quase todo açúcar. Redução gradual: semanas 1–2: 2 colheres; 3–4: 1 colher + cacau; mês 2: 1 colher rasa; mês 3: só cacau + adoçante.",
      },
      {
        id: "ceia", hora: "22:00", nome: "Ceia", kcal: 120,
        itens: ["200 ml de leite morno com canela"],
        trocas: ["1 iogurte natural", "1 fatia de queijo"],
        min: "Pode pular se o jantar foi tarde.",
        mes2: "+1 colher (sopa) de aveia",
        mes3: "",
        dica: "",
      },
    ],
    b: [
      {
        id: "cafe", hora: "07:30", nome: "Café da manhã", kcal: 400,
        itens: [
          "Omelete de 3 ovos com tomate ou espinafre",
          "1 fatia (30 g) de queijo minas",
          "1 fatia de pão integral ou 1 tapioca pequena (2 colheres de goma)",
          "½ xícara de mamão ou morangos",
          "Café sem açúcar (mexa a creatina aqui ou na água)",
        ],
        trocas: [
          "2 ovos + iogurte proteico + fruta",
          "Crepioca (1 ovo + 2 colheres de goma) + 2 ovos cozidos",
        ],
        min: "2 ovos cozidos + 1 fruta.",
        mes2: "", mes3: "",
        dica: "É sua refeição preferida: ela fica com bastante proteína para segurar a fome até o almoço.",
      },
      {
        id: "lanche1", hora: "10:00", nome: "Lanche da manhã", kcal: 200,
        itens: [
          "1 iogurte natural desnatado ou proteico",
          "1 colher (sopa) de chia",
          "5 morangos ou ½ maçã",
        ],
        trocas: ["1 queijo minas + 1 fruta", "Whey com água + 1 fruta"],
        min: "1 fruta.",
        mes2: "", mes3: "",
        dica: "",
      },
      {
        id: "almoco", hora: "12:15", nome: "Almoço (marmita fixa)", kcal: 365,
        itens: [
          "120 g de proteína: frango grelhado, patinho, tilápia ou lombo",
          "100 g de batata-doce, mandioca ou abóbora (o carboidrato que substitui arroz e feijão)",
          "Legumes: comece com ½ xícara e suba para 1 xícara até o mês 2",
          "1 colher (chá) de azeite",
        ],
        trocas: [
          "Salada de frango desfiado + batata-doce + legumes",
          "Carne moída com abobrinha + purê de abóbora",
        ],
        min: "A proteína da marmita, mesmo sem o resto.",
        mes2: "Legumes: 1 xícara inteira", mes3: "",
        dica: "Marmitas todas do mesmo tamanho: a porção certa já vem pronta, sem decidir na hora.",
      },
      {
        id: "lanche2", hora: "15:30", nome: "Whey + fruta", kcal: 180,
        itens: ["1 dose (30 g) de whey com água ou 200 ml de leite desnatado", "1 maçã ou 1 banana pequena"],
        trocas: ["Iogurte proteico + fruta", "2 ovos cozidos + fruta"],
        min: "Só o whey.",
        mes2: "", mes3: "",
        dica: "",
      },
      {
        id: "pre", hora: "18:00", nome: "Pré-treino / lanche", kcal: 150,
        itens: ["1 banana + 10 g de castanhas (≈ 4 unidades)"],
        trocas: ["1 fatia de pão integral com ovo", "1 maçã + 1 queijo minas"],
        min: "1 banana.",
        mes2: "", mes3: "",
        dica: "Sem treino nesse dia: 1 fruta + 1 fatia de queijo.",
      },
      {
        id: "jantar", hora: "20:15", nome: "Jantar", kcal: 380,
        itens: [
          "130 g de proteína (frango, carne magra, peixe, porco, ovos)",
          "Legumes refogados ou salada",
          "Dia de treino: + 80 g de batata, mandioca ou 1 tapioca pequena",
          "1 colher (chá) de azeite",
        ],
        trocas: ["Omelete de 3 ovos + legumes", "Escondidinho de frango com purê de abóbora"],
        min: "Proteína + qualquer legume. Ovos resolvem em 5 min.",
        mes2: "", mes3: "",
        dica: "",
      },
      {
        id: "ceia", hora: "22:00", nome: "Doce zero (opcional)", kcal: 100,
        itens: ["1 bola de sorvete zero açúcar ou 1 gelatina zero"],
        trocas: ["Chá + 1 iogurte", "2 quadradinhos de chocolate 70%"],
        min: "Opcional.",
        mes2: "",
        mes3: "Se a cintura parou de baixar por 3 semanas, tire a ceia (−100 kcal)",
        dica: "Adoçantes como maltitol e xilitol podem dar gases e diarreia em quantidade.",
      },
    ],
  };

  const SUPLEMENTOS = {
    a: [
      ["Whey", "1 dose no shake das 10h (você já usa)."],
      ["Creatina monohidratada", "3 g por dia, todo dia, no café. Ajuda no ganho de músculo e força. Não precisa de ciclo."],
      ["Fórmula nutricional completa", "Se os shakes não estiverem acontecendo, peça a uma nutricionista uma fórmula pronta de baixo índice glicêmico. Evite \"hipercalórico\" de academia: quase todos são maltodextrina, que sobe a glicose."],
      ["Vitamina D, B12, ferro", "Só com exame de sangue. Não tome no escuro."],
    ],
    b: [
      ["Whey", "1 dose às 15h30. Fecha a proteína do dia sem precisar de refeição grande."],
      ["Creatina monohidratada", "5 g por dia, todo dia. Pode subir 0,5–1 kg na balança na 1ª semana: é água no músculo, não gordura. Por isso a medida principal é a cintura."],
      ["Termogênicos e chás \"detox\"", "Não use. Pioram sono e ansiedade e não tiram gordura localizada."],
    ],
  };

  /* ---------- Treino ---------- */
  // tipo: principal | acessorio | core | barra. medida: reps | seg
  const TREINOS = {
    A: {
      nome: "Treino A", foco: "Pernas: frente da coxa",
      academia: [
        ["legpress", "Leg press 45°", "principal", "reps", "Pés na largura do quadril, desça até 90° no joelho."],
        ["goblet", "Agachamento goblet", "principal", "reps", "Halter junto ao peito, sente para trás, peito aberto."],
        ["extensora", "Cadeira extensora", "acessorio", "reps", "Sobe em 1 s, desce em 3 s."],
        ["stiff", "Stiff com halteres", "principal", "reps", "Joelho levemente dobrado, quadril para trás, costas retas."],
        ["panturrilha", "Panturrilha em pé", "acessorio", "reps", "Pausa de 1 s lá em cima."],
        ["prancha", "Prancha", "core", "seg", "Cotovelos abaixo dos ombros, barriga firme."],
      ],
      casa: [
        ["agach_mochila", "Agachamento com mochila", "principal", "reps", "Mochila com livros ou garrafas no peito."],
        ["bulgaro", "Agachamento búlgaro (pé de trás no sofá)", "principal", "reps", "Cada perna. Desça reto, joelho da frente sobre o pé."],
        ["stiff_uni", "Stiff unilateral com mochila", "principal", "reps", "Cada perna. Apoie a mão na parede se precisar."],
        ["ponte", "Ponte de glúteo", "acessorio", "reps", "Aperte o glúteo 2 s lá em cima."],
        ["pant_degrau", "Panturrilha no degrau", "acessorio", "reps", "Calcanhar desce abaixo do degrau."],
        ["prancha", "Prancha", "core", "seg", "Cotovelos abaixo dos ombros, barriga firme."],
      ],
    },
    B: {
      nome: "Treino B", foco: "Parte de cima: costas, peito, ombro",
      academia: [
        ["puxada", "Puxada frontal", "principal", "reps", "Puxe a barra até o queixo levando os cotovelos para baixo."],
        ["supino_h", "Supino reto com halteres", "principal", "reps", "Desce até a linha do peito, cotovelos a 45°."],
        ["remada_baixa", "Remada baixa", "principal", "reps", "Peito alto, puxe até a barriga."],
        ["desenv", "Desenvolvimento com halteres sentado", "acessorio", "reps", "Não arqueie a lombar."],
        ["lateral", "Elevação lateral", "acessorio", "reps", "Até a altura do ombro, sem balançar."],
        ["tri_bi", "Tríceps corda + rosca direta (um seguido do outro)", "acessorio", "reps", "Cotovelos parados ao lado do corpo."],
      ],
      casa: [
        ["barra", "Barra fixa (pegada pronada)", "barra", "reps", "Suba com um banquinho e desça devagar contando 5."],
        ["flexao", "Flexão de braço", "principal", "reps", "Comece com as mãos na mesa ou sofá; desça para o chão quando fizer 12 fácil."],
        ["remada_mochila", "Remada curvada com mochila", "principal", "reps", "Tronco inclinado, puxe a mochila até o umbigo."],
        ["desenv_garrafa", "Desenvolvimento com mochila ou garrafas", "acessorio", "reps", "Empurre acima da cabeça sem arquear a lombar."],
        ["lateral_garrafa", "Elevação lateral com garrafas", "acessorio", "reps", "Garrafas de 1,5–2 L cheias."],
        ["mergulho", "Mergulho na cadeira", "acessorio", "reps", "Cadeira firme encostada na parede."],
      ],
    },
    C: {
      nome: "Treino C", foco: "Pernas: glúteo e posterior",
      academia: [
        ["hipthrust", "Elevação pélvica (hip thrust)", "principal", "reps", "Costas no banco, queixo no peito, empurre com o calcanhar."],
        ["terra_r", "Levantamento terra romeno", "principal", "reps", "Barra rente à perna, quadril para trás."],
        ["passada", "Passada / afundo com halteres", "principal", "reps", "Cada perna. Passo grande, tronco reto."],
        ["flexora", "Mesa flexora", "acessorio", "reps", "Desce em 3 s."],
        ["abdutora", "Cadeira abdutora", "acessorio", "reps", "Tronco levemente para frente."],
        ["infra", "Abdominal infra (elevação de pernas)", "core", "reps", "Lombar colada no chão."],
      ],
      casa: [
        ["hip_sofa", "Elevação pélvica com costas no sofá", "principal", "reps", "Mochila no quadril. Aperte 2 s em cima."],
        ["afundo_rev", "Afundo reverso", "principal", "reps", "Cada perna. Passo para trás."],
        ["sumo", "Agachamento sumô com mochila", "principal", "reps", "Pés afastados, pontas para fora."],
        ["stiff_m", "Stiff com mochila", "acessorio", "reps", "Costas retas, sinta atrás da coxa."],
        ["abducao", "Abdução deitada de lado", "acessorio", "reps", "Cada lado. Perna sobe sem girar o quadril."],
        ["joelho_barra", "Elevação de joelhos pendurada na barra", "core", "reps", "Ou deitada, se a pegada cansar."],
      ],
    },
    D: {
      nome: "Treino D", foco: "Parte de cima: costas e braços",
      academia: [
        ["serrote", "Remada unilateral (serrote)", "principal", "reps", "Cada lado. Joelho e mão no banco."],
        ["supino_inc", "Supino inclinado com halteres", "principal", "reps", "Banco a 30°."],
        ["puxada_neutra", "Puxada com pegada neutra", "principal", "reps", "Triângulo, puxe até o peito."],
        ["facepull", "Face pull (corda na polia alta)", "acessorio", "reps", "Puxe em direção ao rosto abrindo os cotovelos."],
        ["martelo", "Rosca martelo", "acessorio", "reps", "Palmas viradas uma para a outra."],
        ["frances", "Tríceps francês com halter", "acessorio", "reps", "Cotovelos apontando para cima."],
      ],
      casa: [
        ["barra_sup", "Barra fixa (pegada supinada)", "barra", "reps", "Palmas para você. É a versão mais fácil da barra."],
        ["flexao_fech", "Flexão fechada", "principal", "reps", "Mãos mais juntas; pode usar a mesa."],
        ["remada_uni", "Remada unilateral com galão ou mochila", "principal", "reps", "Cada lado. Mão apoiada na cadeira."],
        ["pike", "Pike push-up (flexão em V)", "acessorio", "reps", "Quadril alto, cabeça desce entre as mãos."],
        ["rosca_m", "Rosca com mochila", "acessorio", "reps", "Sem balançar o tronco."],
        ["superman", "Superman", "core", "seg", "Deitada de barriga para baixo, braços e pernas levemente acima do chão."],
      ],
    },
  };

  const FASES = [
    { n: 1, semanas: "1–4", nome: "Base", texto: "Aprender os movimentos. Carga em que sobram 3 repetições." },
    { n: 2, semanas: "5–8", nome: "Progressão", texto: "Fez todas as repetições com boa forma? Suba a carga na próxima vez." },
    { n: 3, semanas: "9–11", nome: "Força", texto: "Menos repetições, mais carga nos exercícios principais." },
    { n: 4, semanas: "12", nome: "Alívio + reavaliação", texto: "Carga leve, corpo recupera. Refaça as medidas e compare com a semana 1." },
  ];

  function fase(semana) {
    if (semana <= 4) return FASES[0];
    if (semana <= 8) return FASES[1];
    if (semana <= 11) return FASES[2];
    return FASES[3];
  }

  const PRESCRICAO = {
    academia: {
      principal: ["3 × 12", "4 × 10", "4 × 8", "2 × 10 leve"],
      acessorio: ["3 × 12", "3 × 12", "3 × 10", "2 × 12 leve"],
      core: ["3 × 12", "3 × 15", "3 × 15", "2 × 10"],
      coreSeg: ["3 × 30 s", "3 × 40 s", "3 × 45 s", "2 × 30 s"],
    },
    casa: {
      principal: ["3 × 12", "4 × 12", "4 × 10 descendo em 3 s", "2 × 10"],
      acessorio: ["3 × 15", "3 × 15", "4 × 15", "2 × 12"],
      core: ["3 × 10", "3 × 12", "3 × 15", "2 × 8"],
      coreSeg: ["3 × 30 s", "3 × 40 s", "3 × 45 s", "2 × 30 s"],
      barra: ["3 × 3 negativas (5 s descendo)", "4 × 4 negativas + 1 tentativa completa", "4 × o máximo (completas ou com elástico)", "2 × 3 leves"],
    },
  };
  const DESCANSO = { principal: ["90 s", "90 s", "2 min", "60 s"], outro: ["60 s", "60 s", "75 s", "45 s"] };

  function prescricao(ex, semana, local) {
    const f = fase(semana).n - 1;
    const tipo = ex[2], medida = ex[3];
    const tabela = PRESCRICAO[local];
    let s;
    if (tipo === "barra") s = PRESCRICAO.casa.barra[f];
    else if (tipo === "core") s = (medida === "seg" ? tabela.coreSeg : tabela.core)[f];
    else s = tabela[tipo][f];
    const desc = (tipo === "principal" || tipo === "barra" ? DESCANSO.principal : DESCANSO.outro)[f];
    return { series: parseInt(s, 10), texto: s, descanso: desc };
  }

  function finalTreino(pessoa, letra, semana, local) {
    if (pessoa === "a") {
      return "Sem cardio extra (seu objetivo é ganhar peso). 5 min de alongamento e vá jantar.";
    }
    const f = fase(semana).n;
    if (letra === "B" || letra === "D") {
      if (f === 3 && letra === "B") return "HIIT 10 min: 30 s forte + 90 s leve, 5 vezes" + (local === "casa" ? " (polichinelo ou subir escada)." : " (bike ou esteira).");
      return local === "casa" ? "Cardio 20 min: caminhada rápida na rua ou subir e descer escada." : "Cardio 20 min moderado: esteira inclinada (8–10%, 5,5 km/h) ou bike.";
    }
    return "10 min de caminhada inclinada ou rápida.";
  }

  // getDay(): 0 dom ... 6 sáb
  const DIAS_TREINO = { 1: "A", 2: "B", 4: "C", 5: "D" };

  /* ---------- Datas ---------- */
  function parseData(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  }
  function fmtData(dt) {
    const p = (n) => String(n).padStart(2, "0");
    return dt.getFullYear() + "-" + p(dt.getMonth() + 1) + "-" + p(dt.getDate());
  }
  function addDias(s, n) {
    const d = parseData(s);
    d.setDate(d.getDate() + n);
    return fmtData(d);
  }
  function diaDoPlano(inicio, data) {
    return Math.round((parseData(data) - parseData(inicio)) / 86400000);
  }
  function semanaDoPlano(inicio, data) {
    const d = diaDoPlano(inicio, data);
    if (d < 0) return 1;
    return Math.min(SEMANAS, Math.floor(d / 7) + 1);
  }
  function mesDoPlano(semana) {
    return Math.min(3, Math.ceil(semana / 4));
  }

  /* ---------- Cronograma do dia ---------- */
  // essencial: aparece no modo "dia difícil".
  function cronograma(pessoaId, data, inicio) {
    const p = PESSOAS[pessoaId];
    const dt = parseData(data);
    const dow = dt.getDay();
    const letra = DIAS_TREINO[dow] || null;
    const semana = semanaDoPlano(inicio, data);
    const mes = mesDoPlano(semana);
    const ml = p.aguaMl;
    const it = [];
    const add = (hora, id, tipo, titulo, detalhe, essencial) =>
      it.push({ hora, id, tipo, titulo, detalhe: detalhe || "", essencial: !!essencial });
    const ref = (id) => REFEICOES[pessoaId].find((r) => r.id === id);
    const meal = (id, hora) => {
      const r = ref(id);
      it.push({ hora: hora || r.hora, id: "ref_" + id, tipo: "refeicao", titulo: r.nome, refeicao: id, detalhe: "", essencial: id !== "pre" && id !== "ceia" });
    };

    add("07:00", "acordar", "agua", "Acordar: " + (ml + 100) + " ml de água + banheiro", "O copo já está cheio do lado da cama.", true);
    if (dow === 1) add("07:10", "medida", "medida", "Medida da semana", p.medida + ". Anote na aba Plano.", false);
    meal("cafe");
    add("07:35", "creatina", "suplemento", "Creatina " + p.creatina, "Misture no leite, café ou água.", true);
    add("08:45", "agua1", "agua", "Água " + ml + " ml + banheiro", "Antes de começar o trabalho.", false);
    meal("lanche1");
    add("11:00", "agua2", "agua", "Água " + ml + " ml", "", false);
    add("12:00", "pausa", "banheiro", "Pausa: banheiro + encher a garrafa", "", true);
    meal("almoco");
    add("13:25", "agua3", "agua", "Água " + ml + " ml + banheiro", "Antes de voltar ao trabalho.", false);
    add("15:00", "agua4", "agua", "Água " + ml + " ml", "", false);
    meal("lanche2");
    add("17:00", "agua5", "agua", "Água " + ml + " ml + banheiro", "", true);
    meal("pre");

    const fimSemana = dow === 0 || dow === 6;
    if (letra) {
      add("19:00", "fim", "banheiro", "Fim do expediente: banheiro + roupa de treino", "Garrafa cheia, fone, toalha. Não sente no sofá antes.", false);
      add("19:15", "treino", "treino", TREINOS[letra].nome + " · " + TREINOS[letra].foco, "Abra a aba Treino e marque cada série.", true);
      meal("jantar", "20:15");
    } else {
      add("19:00", "fim", "banheiro", fimSemana ? "Banheiro + água" : "Fim do expediente: banheiro + água", "", false);
      if (pessoaId === "b" && dow === 3) add("19:15", "caminhada", "treino", "Caminhada 30 min (ou 8.000 passos no dia)", "Dia sem academia, mas o corpo se mexe.", false);
      meal("jantar", "20:00");
      if (pessoaId === "a") add("20:40", "caminhada", "treino", "Caminhada leve 10 min depois do jantar", "Andar depois de comer reduz o pico de açúcar no sangue.", false);
    }
    add("21:00", "agua6", "agua", "Água " + ml + " ml", "", false);
    meal("ceia");
    if (dow === 6) add("10:30", "compras", "org", "Compras da semana", "Lista pronta na aba Compras. Vão juntas.", true);
    if (dow === 0) add("16:00", "preparo", "org", "Preparo da semana (1h30, juntas)", "Assar frango e batata-doce, desfiar frango, cozinhar legumes, montar 10 marmitas iguais, congelar 7 bananas em rodelas, porcionar o whey em potinhos.", true);
    add("22:30", "amanha", "org", "Deixar amanhã pronto", "Marmita na frente da geladeira, garrafa cheia, copo ao lado da cama" + (pessoaId === "a" ? ", ingredientes do shake juntos." : "."), true);
    add("22:45", "telas", "sono", "Telas desligadas, luz baixa", "Dormir às 23h para acordar às 7h com 8 h de sono.", false);

    it.sort((a, b) => a.hora.localeCompare(b.hora));
    return { itens: it, letra, semana, mes, fase: fase(semana), dia: diaDoPlano(inicio, data) };
  }

  /* ---------- Compras ---------- */
  // quem: a | b | ambas. semanas: "todas" | "impar" | "par" | "mensal" (1, 5, 9) | "inicio" (1)
  const COMPRAS = [
    ["Ovos e laticínios", [
      ["ovos", "Ovos", "4 dúzias", "ambas", "todas", "Perfil B ≈ 24, perfil A ≈ 16, sobra para emergência."],
      ["leite_int", "Leite integral", "7 litros", "a", "todas", "Shake, jantar, ceia e café."],
      ["leite_desn", "Leite desnatado", "2 litros", "b", "todas", ""],
      ["iog_int", "Iogurte natural integral (170 g)", "7 unidades", "a", "todas", ""],
      ["iog_b", "Iogurte natural desnatado ou proteico", "7 unidades", "b", "todas", ""],
      ["mussarela", "Muçarela fatiada", "200 g", "a", "todas", ""],
      ["minas", "Queijo minas frescal", "400 g", "ambas", "todas", ""],
      ["ricota", "Ricota ou requeijão light", "1 unidade", "a", "par", ""],
    ]],
    ["Proteínas", [
      ["frango", "Peito de frango", "1,5 kg", "ambas", "impar", "1 kg perfil B, 500 g para desfiar (perfil A)."],
      ["frango_p", "Peito de frango", "1,3 kg", "ambas", "par", ""],
      ["patinho", "Patinho (bife ou moído)", "700 g", "b", "impar", ""],
      ["tilapia", "Filé de tilápia", "500 g", "ambas", "par", "Perfil A: peixe desfiado no molho, se for bem aceito."],
      ["lombo", "Lombo ou filé suíno", "400 g", "b", "par", ""],
      ["atum", "Atum em lata (em água)", "2 latas", "ambas", "todas", "Proteína de emergência."],
    ]],
    ["Frutas, legumes e verduras", [
      ["banana", "Banana", "14 unidades", "ambas", "todas", "Congelar 7 em rodelas para o shake."],
      ["mamao", "Mamão formosa", "1 unidade", "ambas", "todas", ""],
      ["morango", "Morango", "2 caixas", "ambas", "todas", ""],
      ["maca", "Maçã", "5 unidades", "b", "todas", ""],
      ["abacate", "Abacate", "1 unidade", "a", "todas", "Mês 3: 2 unidades."],
      ["batata_doce", "Batata-doce", "1,2 kg", "b", "todas", ""],
      ["abobora", "Abóbora cabotiá", "1 pedaço (≈ 800 g)", "ambas", "impar", "Purê do perfil A e carboidrato do perfil B."],
      ["mandioca", "Mandioca congelada", "1 pacote (500 g)", "ambas", "par", ""],
      ["cenoura", "Cenoura", "6 unidades", "ambas", "todas", ""],
      ["abobrinha", "Abobrinha", "3 unidades", "ambas", "todas", ""],
      ["brocolis", "Brócolis (ou 1 pacote congelado)", "2 maços", "b", "todas", ""],
      ["tomate", "Tomate", "6 unidades", "b", "todas", ""],
      ["folhas", "Alface ou rúcula", "1 maço", "b", "todas", ""],
      ["espinafre", "Espinafre", "1 maço", "b", "impar", "Para o omelete."],
      ["cebola", "Cebola e alho", "1 kg + 1 cabeça", "ambas", "impar", ""],
      ["limao", "Limão", "4 unidades", "ambas", "todas", ""],
    ]],
    ["Mercearia", [
      ["pao", "Pão integral (3 g de fibra ou mais por fatia)", "2 pacotes", "ambas", "todas", ""],
      ["pasta_amend", "Pasta de amendoim integral, sem açúcar", "1 pote (500 g)", "a", "todas", ""],
      ["aveia", "Aveia em flocos", "500 g", "a", "impar", "Dura 2 semanas."],
      ["castanhas", "Castanhas (caju ou pará)", "200 g", "ambas", "todas", ""],
      ["chia", "Chia", "200 g", "ambas", "impar", ""],
      ["granola", "Granola sem açúcar", "250 g", "a", "impar", ""],
      ["arroz", "Arroz (parboilizado ou integral)", "1 kg", "a", "mensal", ""],
      ["feijao", "Feijão", "1 kg", "a", "mensal", ""],
      ["tapioca", "Goma de tapioca", "500 g", "b", "mensal", ""],
      ["cacau", "Cacau em pó 100%", "200 g", "a", "mensal", "Substitui aos poucos o achocolatado."],
      ["azeite", "Azeite extra virgem", "500 ml", "ambas", "mensal", ""],
      ["adocante", "Adoçante (stévia ou sucralose)", "1 unidade", "ambas", "mensal", ""],
      ["canela", "Canela em pó", "1 unidade", "a", "mensal", ""],
      ["cafe", "Café", "500 g", "ambas", "mensal", ""],
      ["achocolatado", "Achocolatado", "não repor", "a", "mensal", "Use o pote que já tem; a meta é reduzir."],
    ]],
    ["Congelados e doces", [
      ["frutas_verm", "Frutas vermelhas congeladas", "300 g", "a", "todas", "Shake com menos açúcar."],
      ["sorvete", "Sorvete zero açúcar", "1 pote", "b", "par", ""],
      ["gelatina", "Gelatina zero", "4 caixinhas", "b", "todas", ""],
      ["choc70", "Chocolate 70%", "1 barra (80–100 g)", "ambas", "impar", ""],
    ]],
    ["Suplementos (a cada 4 semanas)", [
      ["whey", "Whey protein", "2 potes de 900 g", "ambas", "mensal", "≈ 900 g por pessoa por mês."],
      ["creatina", "Creatina monohidratada", "1 pote de 300 g", "ambas", "mensal", "Dá ≈ 37 dias para as duas."],
    ]],
    ["Só na primeira semana (organização)", [
      ["garrafa", "2 garrafas de 1 L com marcação de horário", "2 unidades", "ambas", "inicio", "Uma cor para cada uma."],
      ["marmitas", "Potes de marmita iguais", "10 unidades", "ambas", "inicio", ""],
      ["potinhos", "Potinhos pequenos para porcionar whey", "14 unidades", "ambas", "inicio", ""],
      ["balanca", "Balança de cozinha", "1 unidade", "ambas", "inicio", "Só nas 2 primeiras semanas, para calibrar o olho."],
      ["fita", "Fita métrica", "1 unidade", "b", "inicio", ""],
      ["elastico", "Elástico de resistência para barra", "1 unidade", "ambas", "inicio", "Ajuda a fazer a barra fixa completa."],
    ]],
  ];

  function vale(regra, semana) {
    if (regra === "todas") return true;
    if (regra === "impar") return semana % 2 === 1;
    if (regra === "par") return semana % 2 === 0;
    if (regra === "mensal") return semana === 1 || semana === 5 || semana === 9;
    if (regra === "inicio") return semana === 1;
    return false;
  }

  function listaCompras(semana) {
    return COMPRAS.map(([grupo, itens]) => ({
      grupo,
      itens: itens.filter((i) => vale(i[4], semana)).map((i) => ({
        id: i[0], nome: i[1], qtd: (i[0] === "abacate" && semana >= 9) ? "2 unidades" : i[2], quem: i[3], nota: i[5],
      })),
    })).filter((g) => g.itens.length);
  }

  /* ---------- Lembretes (.ics para o calendário do celular) ---------- */
  // O calendário do celular toca o alarme mesmo com o app fechado,
  // coisa que uma página web não consegue garantir.
  const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  function gerarICS(pessoaId, inicio, so_essenciais, nomeCal) {
    const p = PESSOAS[pessoaId];
    const grupos = new Map();
    for (let i = 0; i < 7; i++) {
      const data = addDias(inicio, i);
      const dow = parseData(data).getDay();
      for (const it of cronograma(pessoaId, data, inicio).itens) {
        if (so_essenciais && !it.essencial) continue;
        const k = it.hora + "|" + it.id + "|" + it.titulo;
        if (!grupos.has(k)) grupos.set(k, { it, primeiro: data, dias: [] });
        grupos.get(k).dias.push(dow);
      }
    }
    const fim = addDias(inicio, SEMANAS * 7).replace(/-/g, "") + "T235900";
    const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const enc = new TextEncoder();
    const dobra = (l) => { // linhas de até 75 bytes (RFC 5545)
      let out = "", linha = "", bytes = 0;
      for (const ch of l) {
        const b = enc.encode(ch).length;
        if (bytes + b > 73) { out += linha + "\r\n "; linha = ""; bytes = 1; }
        linha += ch; bytes += b;
      }
      return out + linha;
    };
    const L = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rotina da Casa//PT-BR", "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:Rotina " + (nomeCal || p.nome) + (so_essenciais ? " (essencial)" : ""),
    ];
    let n = 0;
    for (const { it, primeiro, dias } of grupos.values()) {
      const [h, m] = it.hora.split(":");
      const dur = it.tipo === "treino" && it.id === "treino" ? 50 : it.tipo === "refeicao" ? 20 : 5;
      const r = it.refeicao ? REFEICOES[pessoaId].find((x) => x.id === it.refeicao) : null;
      const desc = r ? r.itens.join("\n") + "\n\nDia difícil: " + r.min : it.detalhe;
      const ini = primeiro.replace(/-/g, "") + "T" + h + m + "00";
      const fimEv = new Date(2000, 0, 1, +h, +m + dur);
      const fimStr = primeiro.replace(/-/g, "") + "T" + String(fimEv.getHours()).padStart(2, "0") + String(fimEv.getMinutes()).padStart(2, "0") + "00";
      const regra = dias.length === 7 ? "FREQ=DAILY" : "FREQ=WEEKLY;BYDAY=" + dias.map((d) => BYDAY[d]).join(",");
      L.push(
        "BEGIN:VEVENT",
        "UID:" + pessoaId + "-" + it.id + "-" + it.hora.replace(":", "") + "-" + (n++) + "@rotina-da-casa",
        "DTSTAMP:20261014T120000Z",
        "DTSTART:" + ini, "DTEND:" + fimStr,
        "RRULE:" + regra + ";UNTIL=" + fim,
        dobra("SUMMARY:" + esc(it.titulo)),
        dobra("DESCRIPTION:" + esc(desc)),
        "BEGIN:VALARM", "ACTION:DISPLAY", dobra("DESCRIPTION:" + esc(it.titulo)), "TRIGGER:PT0M", "END:VALARM",
        "END:VEVENT"
      );
    }
    L.push("END:VCALENDAR");
    return L.join("\r\n") + "\r\n";
  }

  g.PLANO = {
    SEMANAS, INICIO_PADRAO, PESSOAS, REFEICOES, SUPLEMENTOS, TREINOS, FASES, DIAS_TREINO,
    fase, prescricao, finalTreino, cronograma, listaCompras, gerarICS,
    parseData, fmtData, addDias, diaDoPlano, semanaDoPlano, mesDoPlano,
  };
})(typeof window !== "undefined" ? window : globalThis);
