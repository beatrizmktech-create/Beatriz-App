// Gera os arquivos de lembrete para o calendário do celular.
// Uso: node scripts/gerar-ics.mjs [AAAA-MM-DD da segunda-feira de início]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";

const raiz = new URL("..", import.meta.url);
vm.runInThisContext(readFileSync(new URL("plano.js", raiz), "utf8"));
const P = globalThis.PLANO;
const inicio = process.argv[2] || P.INICIO_PADRAO;
if (P.parseData(inicio).getDay() !== 1) {
  console.error("A data de início precisa ser uma segunda-feira.");
  process.exit(1);
}
mkdirSync(new URL("lembretes/", raiz), { recursive: true });
for (const [id, nome] of [["a", "perfil-a"], ["b", "perfil-b"]]) {
  for (const [ess, suf] of [[false, "completo"], [true, "essencial"]]) {
    const f = new URL(`lembretes/${nome}-${suf}.ics`, raiz);
    const txt = P.gerarICS(id, inicio, ess);
    writeFileSync(f, txt);
    console.log(f.pathname, (txt.match(/BEGIN:VEVENT/g) || []).length, "eventos");
  }
}
