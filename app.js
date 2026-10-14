/* Rotina Bea & Lo — interface. Dados e regras ficam em plano.js. */
(function () {
  "use strict";
  const P = window.PLANO;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hojeStr = () => P.fmtData(new Date());
  const agoraHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const minutos = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  /* ---------- Armazenamento ----------
   * Sempre salva no aparelho. Quando aberto como Artifact no claude.ai,
   * também sincroniza com o banco compartilhado, para as duas verem
   * as mesmas marcações (lista de compras, checklist, medidas). */
  const LS_DADOS = "rotina-bea-lo:dados:v1";
  const LS_PREFS = "rotina-bea-lo:prefs:v1";
  const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };

  let cache = ler(LS_DADOS, {});
  const prefs = Object.assign({ pessoa: "bea", aba: "hoje", local: { bea: "casa", lo: "academia" }, som: true, filtroCompras: "todas" }, ler(LS_PREFS, {}));
  const salvarPrefs = () => gravar(LS_PREFS, prefs);

  function fundir(alvo, patch) {
    for (const k of Object.keys(patch)) {
      const v = patch[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        if (!alvo[k] || typeof alvo[k] !== "object") alvo[k] = {};
        fundir(alvo[k], v);
      } else alvo[k] = v;
    }
    return alvo;
  }
  const doc = (path) => cache[path] || {};
  function alterar(path, patch) {
    cache[path] = fundir(cache[path] || {}, patch);
    gravar(LS_DADOS, cache);
    render();
    enviar(path, patch);
  }

  let db = null, somenteLeitura = false, statusSync = "local";
  const filas = {};
  function enviar(path, patch) {
    if (!db || somenteLeitura) return;
    filas[path] = (filas[path] || Promise.resolve()).then(async () => {
      const ref = db.doc(path);
      try { await ref.update(patch); }
      catch (e) {
        if (e && e.code === "invalid_argument") {
          try { await ref.set(cache[path]); }
          catch (e2) { if (e2 && e2.code === "invalid_argument") { somenteLeitura = true; statusSync = "leitura"; render(); } }
        }
      }
    });
  }
  const COLECOES = ["dia", "compras", "log", "cargas", "config"];
  async function conectarDb() {
    try { db = window.claude && window.claude.use ? await window.claude.use("db") : null; } catch (e) { db = null; }
    if (!db) return;
    statusSync = "compartilhado";
    for (const col of COLECOES) {
      let primeiro = true;
      db.collection(col).onSnapshot((snap) => {
        const noServidor = new Set();
        for (const d of snap.docs) {
          noServidor.add(col + "/" + d.id);
          cache[col + "/" + d.id] = JSON.parse(JSON.stringify(d.data() || {}));
        }
        if (primeiro) { // envia o que já estava marcado só neste aparelho
          primeiro = false;
          for (const path of Object.keys(cache)) {
            if (path.startsWith(col + "/") && !noServidor.has(path)) enviar(path, cache[path]);
          }
        }
        gravar(LS_DADOS, cache);
        render();
      }, () => { statusSync = "local"; render(); });
    }
    render();
  }

  /* ---------- Estado da tela ---------- */
  const ui = { data: hojeStr(), semanaCompras: null, confirmarLimpar: false, descanso: null };
  const inicio = () => doc("config/geral").inicio || P.INICIO_PADRAO;
  const diaPath = (p, data) => "dia/" + p + "_" + data;

  function itensDoDia(p, data) {
    const c = P.cronograma(p, data, inicio());
    const d = doc(diaPath(p, data));
    c.dificil = !!d.dificil;
    c.feito = d.feito || {};
    c.visiveis = c.dificil ? c.itens.filter((i) => i.essencial) : c.itens;
    return c;
  }
  function pctDia(p, data) {
    const d = cache[diaPath(p, data)];
    if (!d || !d.feito) return null;
    const c = P.cronograma(p, data, inicio());
    const lista = d.dificil ? c.itens.filter((i) => i.essencial) : c.itens;
    const n = lista.filter((i) => d.feito[i.id]).length;
    return n / lista.length;
  }

  function fmtLonga(data) {
    const d = P.parseData(data);
    return DIAS[d.getDay()] + ", " + d.getDate() + " " + MESES[d.getMonth()];
  }

  /* ---------- Hoje ---------- */
  function htmlRefeicao(p, id, mes, dificil) {
    const r = P.REFEICOES[p].find((x) => x.id === id);
    if (dificil) return '<div class="d">Versão mínima: ' + esc(r.min) + "</div>";
    let h = "<ul>" + r.itens.map((i) => "<li>" + esc(i) + "</li>").join("") + "</ul>";
    const extra = [];
    if (mes >= 2 && r.mes2) extra.push("Mês 2: " + r.mes2);
    if (mes >= 3 && r.mes3) extra.push("Mês 3: " + r.mes3);
    if (extra.length) h += '<div class="d"><strong>' + esc(extra.join(" · ")) + "</strong></div>";
    h += '<details class="mais"><summary>Trocas e dia difícil</summary><ul>' +
      r.trocas.map((t) => "<li>" + esc(t) + "</li>").join("") +
      "<li>Dia difícil: " + esc(r.min) + "</li></ul>" + (r.dica ? '<div class="d">' + esc(r.dica) + "</div>" : "") + "</details>";
    return h;
  }

  function vHoje() {
    const p = prefs.pessoa;
    const c = itensDoDia(p, ui.data);
    const ehHoje = ui.data === hojeStr();
    const agora = minutos(agoraHM());
    const pendentes = c.visiveis.filter((i) => !c.feito[i.id]);
    let foco = null;
    if (ehHoje && pendentes.length) {
      const passados = pendentes.filter((i) => minutos(i.hora) <= agora);
      foco = passados.length ? passados[passados.length - 1] : pendentes[0];
    }
    const feitos = c.visiveis.filter((i) => c.feito[i.id]).length;
    const total = c.visiveis.length;
    let h = "<section>";
    if (c.dia < 0) {
      h += '<div class="aviso">O plano começa ' + esc(fmtLonga(inicio())) + ". Esta semana é de preparação: compras da semana 1 e itens de organização (aba Compras). Abaixo, como será um dia assim.</div>";
    } else if (c.dia >= P.SEMANAS * 7) {
      h += '<div class="aviso">As 12 semanas de teste terminaram. Compare as medidas na aba Plano antes de decidir o próximo ciclo.</div>';
    }
    if (foco) {
      const minFoco = minutos(foco.hora);
      const quando = minFoco <= agora ? (agora - minFoco <= 1 ? "Agora" : "Desde " + foco.hora) : "Próximo · em " + fmtMin(minFoco - agora);
      h += '<div class="agora" aria-live="polite"><span class="label">' + esc(quando) + '</span><span class="hora">' + foco.hora + "</span><h2>" + esc(foco.titulo) + "</h2>" +
        (foco.refeicao ? htmlRefeicao(p, foco.refeicao, c.mes, c.dificil) : (foco.detalhe ? '<div class="muted">' + esc(foco.detalhe) + "</div>" : "")) +
        '<button class="btn acao" data-feito="' + esc(foco.id) + '">Feito</button></div>';
    } else if (ehHoje && total) {
      h += '<div class="agora"><span class="label">Tudo marcado</span><h2>Dia completo. Pode descansar.</h2></div>';
    }
    h += '<div class="stack"><div class="row" style="justify-content:space-between"><span><strong class="mono">' + feitos + " de " + total + "</strong> feitos</span>" +
      '<span class="small muted">Semana ' + c.semana + " · Mês " + c.mes + " · " + esc(c.fase.nome) + "</span></div>" +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + feitos + '"><i style="width:' + (total ? (feitos / total) * 100 : 0) + '%"></i></div></div>';
    h += '<label class="toggle" for="dificil"><span><strong>Dia difícil</strong><br><span class="small muted">Mostra só o essencial, com versões mínimas das refeições. O mínimo conta.</span></span><input type="checkbox" id="dificil"' + (c.dificil ? " checked" : "") + "></label>";

    const blocos = [["Manhã", 0, 720], ["Tarde", 720, 1080], ["Noite", 1080, 1440]];
    for (const [nome, de, ate] of blocos) {
      const lista = c.visiveis.filter((i) => minutos(i.hora) >= de && minutos(i.hora) < ate);
      if (!lista.length) continue;
      h += '<div class="bloco"><span class="label">' + nome + "</span>";
      for (const i of lista) {
        const feito = !!c.feito[i.id];
        const atrasado = ehHoje && !feito && minutos(i.hora) < agora - 30;
        const cls = "item" + (feito ? " done" : "") + (atrasado ? " late" : "") + (foco && foco.id === i.id ? " next" : "");
        h += '<div class="' + cls + '"><button class="chk" data-toggle="' + esc(i.id) + '" aria-pressed="' + feito + '" aria-label="Marcar ' + esc(i.titulo) + '">' + (feito ? "✓" : "") + "</button>" +
          '<div class="body"><span class="t">' + esc(i.titulo) + "</span>" +
          (i.refeicao ? htmlRefeicao(p, i.refeicao, c.mes, c.dificil) : (i.detalhe ? '<span class="d">' + esc(i.detalhe) + "</span>" : "")) +
          (i.id === "treino" ? '<button class="btn ghost small" data-ir="treino" style="align-self:flex-start;margin-top:6px">Abrir treino</button>' : "") +
          (i.id === "compras" ? '<button class="btn ghost small" data-ir="compras" style="align-self:flex-start;margin-top:6px">Abrir lista</button>' : "") +
          (i.id === "medida" ? '<button class="btn ghost small" data-ir="plano" style="align-self:flex-start;margin-top:6px">Anotar medida</button>' : "") +
          '</div><span class="h">' + i.hora + "</span></div>";
      }
      h += "</div>";
    }
    h += '<p class="small muted">Esqueceu de marcar na hora? Marque agora. Não existe sequência que zera aqui: cada dia vale por si.</p>';
    return h + "</section>";
  }
  const fmtMin = (m) => m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "");

  /* ---------- Treino ---------- */
  function vTreino() {
    const p = prefs.pessoa;
    const path = diaPath(p, ui.data);
    const d = doc(path);
    const c = P.cronograma(p, ui.data, inicio());
    const letra = d.letra || c.letra;
    const local = d.local || prefs.local[p];
    let h = "<section>";
    h += '<div class="card"><span class="label">Semana ' + c.semana + " · Fase " + c.fase.n + " de 4</span><h2>" + esc(c.fase.nome) + '</h2><span class="muted">' + esc(c.fase.texto) + "</span></div>";
    if (!letra) {
      h += '<div class="card"><h3>Hoje é dia de descanso</h3><span class="muted">' +
        (p === "bea" ? "Caminhada leve de 10 min depois do jantar." : (P.parseData(ui.data).getDay() === 3 ? "Caminhada de 30 min ou 8.000 passos." : "Descanso também faz o músculo crescer.")) +
        "</span><span class=\"small muted\">Faltou um treino na semana? Escolha a letra que ficou para trás e faça hoje.</span></div>";
    }
    h += '<div class="stack"><span class="label">Treino</span><div class="seg" role="group" aria-label="Letra do treino">' +
      ["A", "B", "C", "D"].map((l) => '<button data-letra="' + l + '" aria-pressed="' + (l === letra) + '">' + l + "</button>").join("") + "</div>" +
      '<div class="seg" role="group" aria-label="Onde">' +
      [["academia", "Academia"], ["casa", "Em casa"]].map(([k, n]) => '<button data-local="' + k + '" aria-pressed="' + (k === local) + '">' + n + "</button>").join("") + "</div></div>";
    if (!letra) return h + "</section>";

    const t = P.TREINOS[letra];
    const sets = d.sets || {};
    const cargas = doc("cargas/" + p);
    h += "<div><h2>" + esc(t.nome) + '</h2><span class="muted">' + esc(t.foco) + " · " + (local === "casa" ? "em casa" : "academia") + " · ≈ 50 min</span></div>";
    h += '<div class="card"><span class="label">Aquecimento · 5 min</span><span>30 s de polichinelo leve, 10 agachamentos sem peso, 10 círculos de ombro, 1 série leve do primeiro exercício.</span></div>';
    let totalSets = 0, feitosSets = 0;
    for (const ex of t[local]) {
      const pr = P.prescricao(ex, c.semana, local);
      let feitosEx = 0;
      let botoes = "";
      for (let s = 0; s < pr.series; s++) {
        const k = ex[0] + "_" + s;
        const on = !!sets[k];
        if (on) feitosEx++;
        botoes += '<button class="set" data-set="' + esc(k) + '" data-desc="' + esc(pr.descanso) + '" aria-pressed="' + on + '" aria-label="Série ' + (s + 1) + '">' + (on ? "✓" : s + 1) + "</button>";
      }
      totalSets += pr.series; feitosSets += feitosEx;
      h += '<div class="ex' + (feitosEx === pr.series ? " done" : "") + '"><div class="topo"><h3>' + esc(ex[1]) + '</h3><span class="presc">' + esc(pr.texto) + "</span></div>" +
        '<span class="small muted">' + esc(ex[4]) + " Descanso: " + esc(pr.descanso) + ".</span>" +
        '<div class="sets">' + botoes + "</div>" +
        (ex[3] === "seg" || ex[2] === "barra" ? "" : '<label class="carga" for="carga-' + esc(ex[0]) + '">' + (local === "casa" ? "Peso usado" : "Carga") + ' <input id="carga-' + esc(ex[0]) + '" data-carga="' + esc(ex[0]) + '" value="' + esc(cargas[ex[0]] || "") + '" placeholder="ex.: 8 kg" inputmode="text"></label>') +
        "</div>";
    }
    h += '<div class="card"><span class="label">Final</span><span>' + esc(P.finalTreino(p, letra, c.semana, local)) + "</span></div>";
    const completo = feitosSets === totalSets;
    h += '<div class="stack"><div class="progress"><i style="width:' + (feitosSets / totalSets) * 100 + '%"></i></div>' +
      '<span class="small muted mono">' + feitosSets + " de " + totalSets + " séries</span>" +
      (completo ? '<div class="agora"><h2>Treino feito.</h2><span>Já marquei no checklist de hoje.</span></div>' :
        '<button class="btn ghost" data-curto="1">Fiz uma versão curta (conta como feito)</button>') + "</div>";
    if (p === "bea") h += '<p class="small muted">Comeu pouco hoje? Faça 2 séries de cada. Treinar cansada e sem comida atrapalha o ganho de músculo.</p>';
    return h + "</section>";
  }

  /* ---------- Dieta ---------- */
  const REGRAS = {
    bea: [
      "Sete refeições pequenas em vez de três grandes. Nenhuma precisa encher.",
      "Líquido conta como comida e é mais fácil de engolir: os shakes são a base do ganho de peso.",
      "Coma na ordem legume → proteína → carboidrato. Reduz o pico de glicose.",
      "Doce sempre junto de proteína ou gordura (leite, pasta de amendoim), nunca sozinho.",
      "10 minutos de caminhada depois do jantar baixam a glicose da noite.",
      "Alimentos macios que costumam descer: ovos, frango desfiado no molho, purês, sopas cremosas, iogurte, queijo, ricota, pasta de amendoim, abacate, banana.",
      "Pese-se uma vez por semana, na segunda, e só. Se não subiu em 2 semanas seguidas, adiante a porção do mês seguinte.",
    ],
    lo: [
      "A porção vem da marmita, não do olho. Potes iguais, montados no domingo.",
      "Não dá para queimar gordura só da barriga ou do braço. Abdominal não tira gordura da barriga; o que tira é comer um pouco abaixo do gasto + musculação, e a barriga costuma ser a última a baixar.",
      "Flacidez melhora com músculo. Por isso a musculação é a parte principal do plano, e o cardio é complemento.",
      "Sem arroz e feijão tudo bem, mas sem carboidrato o treino rende menos: batata-doce, mandioca, abóbora, frutas e aveia entram no lugar.",
      "Fibra: chia + legumes + fruta todo dia. Comer só carne e pouco vegetal costuma prender o intestino.",
      "Nunca abaixo de 1.500 kcal. Comer pouco demais faz perder músculo, e a flacidez piora.",
      "Meça a cintura toda segunda. A balança engana por causa da creatina e da água.",
    ],
  };
  function vDieta() {
    const p = prefs.pessoa;
    const pe = P.PESSOAS[p];
    const sem = P.semanaDoPlano(inicio(), ui.data);
    const mes = P.mesDoPlano(sem);
    const aguaTotal = (pe.aguaMl * 7 + pe.aguaMl + 100) / 1000;
    let h = "<section>";
    h += '<div class="card"><span class="label">' + esc(pe.nome) + "</span><h2>" + esc(pe.objetivo) + '</h2><span class="muted">' + esc(pe.resumo) + "</span>" +
      '<dl class="kv"><dt>Energia</dt><dd>' + pe.kcal.map((k, i) => (i + 1 === mes ? "<strong>Mês " + (i + 1) + ": " + esc(k) + "</strong>" : "Mês " + (i + 1) + ": " + esc(k))).join("<br>") + "</dd>" +
      "<dt>Proteína</dt><dd>" + esc(pe.proteina) + "</dd><dt>Água</dt><dd>≈ " + aguaTotal.toFixed(1).replace(".", ",") + " L de água pura" + (p === "bea" ? " + o leite dos shakes" : " + 500 ml no treino") + "</dd>" +
      "<dt>Acompanhar</dt><dd>" + esc(pe.medida) + " · meta " + esc(pe.metaMedida) + "</dd></dl></div>";
    h += '<div class="aviso">' + (p === "bea"
      ? "<strong>Leve ao médico:</strong> glicose alta em quem está abaixo do peso pede investigação com endocrinologista (glicemia de jejum, hemoglobina glicada, insulina). A dificuldade de engolir pode ser avaliada por fonoaudióloga. Este plano é um ponto de partida para ser ajustado por nutricionista, não substitui."
      : "<strong>Ponto de partida:</strong> as calorias são estimativas por fórmula. Se em 3 semanas a cintura não mudar, ou se a fome e o cansaço estiverem altos, ajuste com nutricionista.") + "</div>";
    h += '<h2>Refeições · horários fixos</h2>';
    for (const r of P.REFEICOES[p]) {
      const extra = [];
      if (r.mes2) extra.push("<li><strong>Mês 2:</strong> " + esc(r.mes2) + "</li>");
      if (r.mes3) extra.push("<li><strong>Mês 3:</strong> " + esc(r.mes3) + "</li>");
      h += '<div class="card"><div class="row" style="justify-content:space-between"><span class="mono" style="font-weight:600;color:var(--accent)">' + r.hora + (r.id === "jantar" ? " / 20:00" : "") + '</span><span class="small muted mono">≈ ' + r.kcal + " kcal</span></div>" +
        "<h3>" + esc(r.nome) + "</h3><ul>" + r.itens.map((i) => "<li>" + esc(i) + "</li>").join("") + "</ul>" +
        (extra.length ? '<ul class="small">' + extra.join("") + "</ul>" : "") +
        '<details class="mais"><summary>Trocas</summary><ul>' + r.trocas.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul></details>" +
        '<span class="small"><strong>Dia difícil:</strong> ' + esc(r.min) + "</span>" +
        (r.dica ? '<span class="small muted">' + esc(r.dica) + "</span>" : "") + "</div>";
    }
    h += '<h2>Suplementos</h2><div class="card"><dl class="kv">' + P.SUPLEMENTOS[p].map(([n, t]) => "<dt><strong>" + esc(n) + "</strong></dt><dd>" + esc(t) + "</dd>").join("") + "</dl></div>";
    h += '<h2>Regras que fazem diferença</h2><div class="card"><ul>' + REGRAS[p].map((r) => "<li>" + esc(r) + "</li>").join("") + "</ul></div>";
    return h + "</section>";
  }

  /* ---------- Compras ---------- */
  function vCompras() {
    const sAtual = P.semanaDoPlano(inicio(), hojeStr());
    const s = ui.semanaCompras || sAtual;
    const path = "compras/s" + s;
    const feito = doc(path).feito || {};
    const filtro = prefs.filtroCompras;
    const grupos = P.listaCompras(s).map((g) => ({ grupo: g.grupo, itens: g.itens.filter((i) => filtro === "todas" || i.quem === "ambas" || i.quem === filtro) })).filter((g) => g.itens.length);
    const todos = grupos.flatMap((g) => g.itens);
    const n = todos.filter((i) => feito[i.id]).length;
    const dataSabado = P.addDias(inicio(), (s - 1) * 7 - 2);
    let h = "<section>";
    h += '<div class="datebar"><button class="iconbtn" data-sem="-1" aria-label="Semana anterior"' + (s <= 1 ? " disabled" : "") + '>‹</button><div class="when"><strong>Semana ' + s + (s === sAtual ? " · atual" : "") + '</strong><span class="small muted">Comprar no sábado antes: ' + esc(fmtLonga(dataSabado)) + '</span></div><button class="iconbtn" data-sem="1" aria-label="Próxima semana"' + (s >= P.SEMANAS ? " disabled" : "") + ">›</button></div>";
    h += '<div class="seg" role="group" aria-label="Filtrar por pessoa">' + [["todas", "Tudo"], ["bea", "Beatriz"], ["lo", "Lorena"]].map(([k, t]) => '<button data-filtro="' + k + '" aria-pressed="' + (k === filtro) + '">' + t + "</button>").join("") + "</div>";
    h += '<div class="stack"><span><strong class="mono">' + n + " de " + todos.length + '</strong> no carrinho</span><div class="progress"><i style="width:' + (todos.length ? (n / todos.length) * 100 : 0) + '%"></i></div></div>';
    h += '<p class="small muted">' + (statusSync === "compartilhado" ? "Lista compartilhada: o que uma marca, a outra vê." : "As marcações ficam salvas neste aparelho.") + " Confira o estoque antes: o que já tem em casa, marque direto.</p>";
    for (const g of grupos) {
      h += '<div class="card"><h3>' + esc(g.grupo) + "</h3><div>";
      for (const i of g.itens) {
        const on = !!feito[i.id];
        h += '<div class="compra' + (on ? " done" : "") + '"><button class="chk" data-compra="' + esc(i.id) + '" aria-pressed="' + on + '" aria-label="Marcar ' + esc(i.nome) + '">' + (on ? "✓" : "") + "</button>" +
          '<div style="min-width:0"><span class="n">' + esc(i.nome) + '</span> <span class="tag ' + i.quem + '">' + (i.quem === "ambas" ? "as duas" : P.PESSOAS[i.quem].nome) + '</span><br><span class="q">' + esc(i.qtd) + "</span>" +
          (i.nota ? ' <span class="small muted">· ' + esc(i.nota) + "</span>" : "") + "</div></div>";
      }
      h += "</div></div>";
    }
    h += '<div class="row"><button class="btn ghost" data-copiar="1">Copiar o que falta</button>' +
      (ui.confirmarLimpar ? '<button class="btn" data-limpar="sim">Sim, desmarcar tudo</button><button class="btn ghost" data-limpar="nao">Cancelar</button>' : '<button class="btn ghost" data-limpar="pedir">Desmarcar tudo</button>') + "</div>";
    if (ui.textoCopia) h += '<textarea class="copiar" id="copia" readonly>' + esc(ui.textoCopia) + "</textarea>";
    return h + "</section>";
  }

  /* ---------- Plano ---------- */
  function vPlano() {
    const p = prefs.pessoa;
    const pe = P.PESSOAS[p];
    const ini = inicio();
    const hoje = hojeStr();
    let h = "<section>";
    h += '<div class="card"><h2>12 semanas de ' + esc(pe.nome) + '</h2><span class="small muted">Cada quadrado é um dia. Quanto mais escuro, mais itens marcados.</span><div class="mapa" aria-label="Mapa de constância">';
    h += '<span></span>' + ["S", "T", "Q", "Q", "S", "S", "D"].map((d) => '<span class="hd">' + d + "</span>").join("");
    for (let s = 0; s < P.SEMANAS; s++) {
      h += '<span class="wk">S' + (s + 1) + "</span>";
      for (let d = 0; d < 7; d++) {
        const data = P.addDias(ini, s * 7 + d);
        const pct = pctDia(p, data);
        const cor = pct == null || pct === 0 ? "" : "background:color-mix(in srgb, var(--done) " + Math.round(25 + pct * 75) + "%, var(--sunk))";
        h += '<span class="c' + (data === hoje ? " hoje" : "") + '" style="' + cor + '" title="' + esc(fmtLonga(data)) + (pct != null ? " · " + Math.round(pct * 100) + "%" : "") + '"></span>';
      }
    }
    h += "</div></div>";

    const log = doc("log/" + p);
    const campos = p === "bea" ? [["peso", "Peso (kg)"]] : [["peso", "Peso (kg)"], ["cintura", "Cintura (cm)"], ["braco", "Braço (cm)"]];
    h += '<div class="card"><h3>Medidas de segunda-feira</h3><span class="small muted">' + esc(pe.medida) + ". Meta: " + esc(pe.metaMedida) + '.</span><div class="scroll-x"><table class="log"><thead><tr><th>Semana</th>' + campos.map((c) => "<th>" + c[1] + "</th>").join("") + "</tr></thead><tbody>";
    for (let s = 1; s <= P.SEMANAS; s++) {
      const linha = log["s" + s] || {};
      h += '<tr><td class="mono">' + s + "</td>" + campos.map(([k]) => '<td><input id="log-' + s + "-" + k + '" data-log="' + s + '" data-campo="' + k + '" inputmode="decimal" value="' + esc(linha[k] || "") + '"></td>').join("") + "</tr>";
    }
    h += "</tbody></table></div></div>";

    h += '<div class="card"><h3>Fases do treino</h3><ul>' + P.FASES.map((f) => "<li><strong>Semanas " + f.semanas + " · " + esc(f.nome) + ":</strong> " + esc(f.texto) + "</li>").join("") + "</ul>" +
      '<span class="small muted">Treinos: segunda A, terça B, quinta C, sexta D, às 19h15. As duas fazem o mesmo treino lado a lado; muda a carga e o final (Lorena faz cardio, Beatriz não).</span></div>';

    const nomeArq = p === "bea" ? "beatriz" : "lorena";
    const padrao = ini === P.INICIO_PADRAO;
    h += '<div class="card"><h3>Lembretes no celular</h3><span>Uma página web não consegue tocar alarme com o celular bloqueado. O calendário do celular consegue. Importe um destes arquivos e cada item do dia vira um alarme no horário exato, até o fim das 12 semanas.</span>' +
      '<ul><li><strong>Essencial</strong> (17 alarmes): refeições, creatina, 3 pausas de banheiro, treino, compras e preparo. Comece por este.</li><li><strong>Completo</strong> (30 alarmes): inclui toda a água. Pode cansar; troque para o essencial se começar a ignorar.</li></ul>' +
      '<div class="row">' + (padrao
        ? '<a class="btn small" href="lembretes/' + nomeArq + '-essencial.ics">Essencial (.ics)</a><a class="btn ghost small" href="lembretes/' + nomeArq + '-completo.ics">Completo (.ics)</a>'
        : '<button class="btn small" data-ics="1">Essencial (.ics)</button><button class="btn ghost small" data-ics="0">Completo (.ics)</button>') + "</div>" +
      '<span class="small muted">iPhone: abra o arquivo no Safari e toque em "Adicionar tudo". Android: importe pelo Google Agenda no computador (Configurações → Importar) e os alarmes chegam no celular.</span>' +
      (ui.icsTexto ? '<textarea class="copiar" readonly>' + esc(ui.icsTexto) + '</textarea><span class="small muted">Se o download não começou, copie o texto acima para um arquivo .ics.</span>' : "") +
      '<label class="toggle" for="som"><span>Som e vibração com o app aberto</span><input type="checkbox" id="som"' + (prefs.som ? " checked" : "") + "></label>" +
      '<button class="btn ghost small" data-notif="1" style="align-self:flex-start">Ativar avisos do navegador</button>' + (ui.notifMsg ? '<span class="small muted">' + esc(ui.notifMsg) + "</span>" : "") + "</div>";

    h += '<div class="card"><h3>Início do plano</h3><label class="small muted" for="inicio">Segunda-feira da semana 1</label><input type="date" id="inicio" value="' + esc(ini) + '" style="padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--bg)"><span class="small muted">Se escolher outro dia, o app usa a segunda daquela semana.</span></div>';

    h += '<div class="card"><h3>Como usar sem se cobrar</h3><ul>' +
      "<li>Abra só a aba Hoje. O cartão de cima diz a única coisa a fazer agora.</li>" +
      "<li>Não existe dia perdido. Marcou 5 de 20? São 5 a mais que zero.</li>" +
      "<li>Dia ruim: ligue \"Dia difícil\". Fica só o essencial, com versões mínimas.</li>" +
      "<li>Faltou treino? Faça a letra que ficou para trás no próximo dia livre. Não pule letras.</li>" +
      "<li>Sábado: compras juntas. Domingo: preparo juntas. Dividir tarefa ajuda as duas a manter.</li>" +
      "<li>Na semana 12, comparem as medidas com a semana 1 e levem os números para a nutricionista.</li></ul></div>";
    h += '<p class="small muted">' + ({ compartilhado: "Sincronizado: as duas veem as mesmas marcações.", leitura: "Você pode ver, mas não marcar: peça acesso de edição a quem compartilhou.", local: "Salvo neste aparelho." }[statusSync]) + "</p>";
    return h + "</section>";
  }

  /* ---------- Render ---------- */
  let pendenteRender = false;
  function render() {
    const ativo = document.activeElement;
    if (ativo && (ativo.tagName === "INPUT" && ativo.type !== "checkbox") && $("#view").contains(ativo)) { pendenteRender = true; return; }
    pendenteRender = false;
    document.body.classList.toggle("p-lo", prefs.pessoa === "lo");
    $("#btn-bea").setAttribute("aria-pressed", prefs.pessoa === "bea");
    $("#btn-lo").setAttribute("aria-pressed", prefs.pessoa === "lo");
    document.querySelectorAll("nav.tabs button").forEach((b) => { if (b.dataset.tab === prefs.aba) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    const comData = prefs.aba === "hoje" || prefs.aba === "treino";
    $("#datebar").hidden = !comData;
    if (comData) {
      $("#data-txt").textContent = (ui.data === hojeStr() ? "Hoje · " : "") + fmtLonga(ui.data);
      const dia = P.diaDoPlano(inicio(), ui.data);
      $("#data-sub").textContent = dia < 0 ? "antes do início" : dia >= P.SEMANAS * 7 ? "depois das 12 semanas" : "dia " + (dia + 1) + " de " + P.SEMANAS * 7;
    }
    const v = { hoje: vHoje, treino: vTreino, dieta: vDieta, compras: vCompras, plano: vPlano }[prefs.aba] || vHoje;
    const scroll = window.scrollY;
    $("#view").innerHTML = v();
    window.scrollTo(0, scroll);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button, a");
    if (!b) return;
    desbloquearSom();
    const ds = b.dataset;
    const p = prefs.pessoa;
    if (ds.p) { prefs.pessoa = ds.p; salvarPrefs(); render(); return; }
    if (ds.tab) { prefs.aba = ds.tab; salvarPrefs(); ui.textoCopia = ""; render(); window.scrollTo(0, 0); return; }
    if (ds.ir) { prefs.aba = ds.ir; salvarPrefs(); render(); window.scrollTo(0, 0); return; }
    if (b.id === "dia-ant" || b.id === "dia-prox") { ui.data = P.addDias(ui.data, b.id === "dia-ant" ? -1 : 1); render(); return; }
    if (b.id === "toast-ok") { $("#toast").hidden = true; return; }
    const path = diaPath(p, ui.data);
    if (ds.toggle || ds.feito) {
      const id = ds.toggle || ds.feito;
      const atual = !!(doc(path).feito || {})[id];
      alterar(path, { feito: { [id]: ds.feito ? true : !atual } });
      return;
    }
    if (ds.letra) { alterar(path, { letra: ds.letra }); return; }
    if (ds.local) { prefs.local[p] = ds.local; salvarPrefs(); alterar(path, { local: ds.local }); return; }
    if (ds.set) {
      const on = !(doc(path).sets || {})[ds.set];
      alterar(path, { sets: { [ds.set]: on } });
      if (on) iniciarDescanso(ds.desc);
      conferirTreinoCompleto(p);
      return;
    }
    if (ds.curto) { alterar(path, { feito: { treino: true } }); toast("Treino curto marcado. Conta."); return; }
    if (ds.sem) { const s = (ui.semanaCompras || P.semanaDoPlano(inicio(), hojeStr())) + Number(ds.sem); ui.semanaCompras = Math.max(1, Math.min(P.SEMANAS, s)); ui.textoCopia = ""; render(); return; }
    if (ds.filtro) { prefs.filtroCompras = ds.filtro; salvarPrefs(); render(); return; }
    if (ds.compra) {
      const s = ui.semanaCompras || P.semanaDoPlano(inicio(), hojeStr());
      const cp = "compras/s" + s;
      alterar(cp, { feito: { [ds.compra]: !(doc(cp).feito || {})[ds.compra] } });
      return;
    }
    if (ds.limpar) {
      if (ds.limpar === "pedir") { ui.confirmarLimpar = true; render(); return; }
      if (ds.limpar === "sim") {
        const s = ui.semanaCompras || P.semanaDoPlano(inicio(), hojeStr());
        const cp = "compras/s" + s;
        const zera = {};
        Object.keys(doc(cp).feito || {}).forEach((k) => (zera[k] = false));
        ui.confirmarLimpar = false;
        alterar(cp, { feito: zera });
        return;
      }
      ui.confirmarLimpar = false; render(); return;
    }
    if (ds.copiar) { copiarLista(); return; }
    if (ds.ics) { baixarICS(ds.ics === "1"); return; }
    if (ds.notif) { pedirNotificacao(); return; }
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    const p = prefs.pessoa;
    if (t.id === "dificil") { alterar(diaPath(p, ui.data), { dificil: t.checked }); return; }
    if (t.id === "som") { prefs.som = t.checked; salvarPrefs(); return; }
    if (t.dataset.carga) { alterar("cargas/" + p, { [t.dataset.carga]: t.value.trim() }); return; }
    if (t.dataset.log) { alterar("log/" + p, { ["s" + t.dataset.log]: { [t.dataset.campo]: t.value.trim() } }); return; }
    if (t.id === "inicio" && t.value) {
      const d = P.parseData(t.value);
      const seg = P.addDias(t.value, -((d.getDay() + 6) % 7));
      alterar("config/geral", { inicio: seg });
    }
  });
  document.addEventListener("focusout", () => { setTimeout(() => { if (pendenteRender) render(); }, 0); });

  function conferirTreinoCompleto(p) {
    const path = diaPath(p, ui.data);
    const d = doc(path);
    const c = P.cronograma(p, ui.data, inicio());
    const letra = d.letra || c.letra;
    if (!letra) return;
    const local = d.local || prefs.local[p];
    const todos = P.TREINOS[letra][local].every((ex) => {
      const n = P.prescricao(ex, c.semana, local).series;
      for (let s = 0; s < n; s++) if (!(d.sets || {})[ex[0] + "_" + s]) return false;
      return true;
    });
    if (todos && !(d.feito || {}).treino) alterar(path, { feito: { treino: true } });
  }

  function copiarLista() {
    const s = ui.semanaCompras || P.semanaDoPlano(inicio(), hojeStr());
    const feito = doc("compras/s" + s).feito || {};
    const filtro = prefs.filtroCompras;
    let txt = "Compras · semana " + s + "\n";
    for (const g of P.listaCompras(s)) {
      const falta = g.itens.filter((i) => !feito[i.id] && (filtro === "todas" || i.quem === "ambas" || i.quem === filtro));
      if (!falta.length) continue;
      txt += "\n" + g.grupo + "\n" + falta.map((i) => "[ ] " + i.nome + " — " + i.qtd).join("\n") + "\n";
    }
    const pronto = () => toast("Lista copiada.");
    try {
      navigator.clipboard.writeText(txt).then(pronto, () => { ui.textoCopia = txt; render(); selecionarCopia(); });
    } catch (e) { ui.textoCopia = txt; render(); selecionarCopia(); }
  }
  function selecionarCopia() { const t = $("#copia"); if (t) { t.focus(); t.select(); } }

  function baixarICS(essencial) {
    const p = prefs.pessoa;
    const txt = P.gerarICS(p, inicio(), essencial);
    const nome = "rotina-" + (p === "bea" ? "beatriz" : "lorena") + (essencial ? "-essencial" : "-completo") + ".ics";
    try {
      const url = URL.createObjectURL(new Blob([txt], { type: "text/calendar" }));
      const a = document.createElement("a");
      a.href = url; a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { /* segue para o texto */ }
    ui.icsTexto = txt;
    render();
  }

  /* ---------- Avisos com o app aberto ---------- */
  let ctxSom = null;
  function desbloquearSom() {
    if (ctxSom) return;
    try { ctxSom = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctxSom = null; }
  }
  function tocar() {
    if (!prefs.som) return;
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* sem vibração */ }
    if (!ctxSom) return;
    try {
      const t0 = ctxSom.currentTime;
      [660, 880].forEach((f, i) => {
        const o = ctxSom.createOscillator(), g = ctxSom.createGain();
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0.0001, t0 + i * 0.25);
        g.gain.exponentialRampToValueAtTime(0.2, t0 + i * 0.25 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.25 + 0.4);
        o.connect(g).connect(ctxSom.destination);
        o.start(t0 + i * 0.25); o.stop(t0 + i * 0.25 + 0.45);
      });
    } catch (e) { /* sem som */ }
  }
  function toast(txt) {
    $("#toast-txt").textContent = txt;
    $("#toast").hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => ($("#toast").hidden = true), 12000);
  }
  async function pedirNotificacao() {
    try {
      if (!("Notification" in window)) throw new Error();
      const r = await Notification.requestPermission();
      ui.notifMsg = r === "granted" ? "Avisos ativados. Funcionam enquanto o app estiver aberto em alguma aba." : "O navegador não permitiu. Use os lembretes do calendário acima.";
    } catch (e) { ui.notifMsg = "Este navegador não permite avisos aqui. Use os lembretes do calendário acima."; }
    render();
  }
  const disparados = new Set();
  function vigiar() {
    const hoje = hojeStr();
    const hm = agoraHM();
    const p = prefs.pessoa;
    const c = itensDoDia(p, hoje);
    for (const i of c.visiveis) {
      const k = p + hoje + i.id;
      if (i.hora !== hm || c.feito[i.id] || disparados.has(k)) continue;
      disparados.add(k);
      toast(i.hora + " · " + i.titulo);
      tocar();
      try { if ("Notification" in window && Notification.permission === "granted") new Notification(i.hora + " · " + i.titulo, { body: P.PESSOAS[p].nome, tag: k }); } catch (e) { /* sem notificação */ }
    }
    if (ui.data === hoje && prefs.aba === "hoje") render();
  }
  let ultimoDia = hojeStr();
  setInterval(() => {
    if (hojeStr() !== ultimoDia) { if (ui.data === ultimoDia) ui.data = hojeStr(); ultimoDia = hojeStr(); }
    vigiar();
  }, 30000);

  // Cronômetro de descanso entre séries
  function iniciarDescanso(txt) {
    const seg = /min/.test(txt) ? parseInt(txt, 10) * 60 : parseInt(txt, 10);
    if (!seg) return;
    clearInterval(ui.descanso);
    const fim = Date.now() + seg * 1000;
    const tick = () => {
      const r = Math.max(0, Math.round((fim - Date.now()) / 1000));
      $("#toast-txt").textContent = r ? "Descanso: " + Math.floor(r / 60) + ":" + String(r % 60).padStart(2, "0") : "Bora, próxima série.";
      $("#toast").hidden = false;
      if (!r) { clearInterval(ui.descanso); tocar(); clearTimeout(toast.t); toast.t = setTimeout(() => ($("#toast").hidden = true), 4000); }
    };
    clearTimeout(toast.t);
    tick();
    ui.descanso = setInterval(tick, 1000);
  }

  render();
  conectarDb();
})();
