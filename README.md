# Rotina Bea & Lo

App de bolso para duas pessoas que moram juntas seguirem dieta, treino e hidratação por 12 semanas, com checklist por horário. Pensado para autismo, TDAH e TOC: uma coisa de cada vez na tela, modo "dia difícil" com o mínimo que conta, e nenhuma sequência que zera.

Funciona abrindo o `index.html` no navegador. Não precisa de instalação nem de servidor.

## O que tem

| Aba | Conteúdo |
| --- | --- |
| Hoje | Checklist do dia com horário exato: água, banheiro, refeições, creatina, treino, preparo do dia seguinte. O cartão de cima mostra só o que fazer agora. |
| Treino | Treinos A/B/C/D (seg, ter, qui, sex às 19h15), versão academia e versão em casa, séries para marcar, carga anotada e cronômetro de descanso. |
| Dieta | Refeições de cada uma com porções, trocas, versão mínima, ajustes do mês 2 e 3, suplementos e regras específicas. |
| Compras | Lista semanal (semanas 1 a 12) com quantidades para as duas, filtro por pessoa e botão de copiar. |
| Plano | Mapa de constância de 84 dias, medidas semanais, fases do treino, lembretes e data de início. |

## Lembretes

Página web não toca alarme com o celular bloqueado. Por isso os lembretes saem como arquivos de calendário (`lembretes/*.ics`), que o celular dispara no horário exato:

- `beatriz-essencial.ics` / `lorena-essencial.ics`: 17 alarmes por dia (refeições, creatina, 3 pausas de banheiro, treino, compras e preparo).
- `beatriz-completo.ics` / `lorena-completo.ics`: 30 alarmes, incluindo toda a água.

Os arquivos usam início em segunda, 19/10/2026. Para outra data: `node scripts/gerar-ics.mjs 2026-10-26`, ou mude a data na aba Plano e baixe de lá.

## Onde ficam as marcações

- Aberto direto no navegador (ou pelo GitHub Pages): ficam salvas no aparelho. Cada celular tem a sua cópia.
- Aberto como Artifact no claude.ai: sincroniza entre as duas (precisa que a outra pessoa tenha acesso de edição).

Para usar pelo celular via GitHub Pages: Settings → Pages → Branch → pasta raiz.

## Base do plano

- **Beatriz** (44 kg, 1,55 m, IMC 18,3): gasto estimado ≈ 1.750–1.900 kcal; plano começa em ≈ 2.200 kcal e sobe para ≈ 2.550 no mês 3, em 7 refeições pequenas, com 2 bebidas batidas. Proteína 90–110 g. Glicose: carboidrato sempre acompanhado de proteína/gordura, ordem legume → proteína → carboidrato, caminhada de 10 min após o jantar, redução gradual do achocolatado. Sem cardio extra.
- **Lorena** (63 kg, 1,67 m): gasto estimado ≈ 2.150 kcal; plano em ≈ 1.750 kcal, proteína 115–125 g, carboidrato vindo de batata-doce, mandioca, abóbora e frutas no lugar de arroz e feijão. Musculação como prioridade e cardio de 10–20 min no fim.
- **Treino**: superior/inferior 4x por semana, o mesmo para as duas. Semanas 1–4 base, 5–8 progressão, 9–11 força, 12 alívio e reavaliação.

Estimativas por fórmula (Mifflin-St Jeor). Não substitui nutricionista nem médica: a glicose alta da Beatriz precisa de exames com endocrinologista, e a dificuldade de engolir pode ser avaliada por fonoaudióloga.

## Editar

Tudo que é conteúdo (horários, refeições, exercícios, lista de compras) está em `plano.js`. A interface está em `app.js` e o visual em `index.html`.
