# Rotina da Casa

App de bolso para duas pessoas que moram juntas seguirem dieta, treino e hidratação por 12 semanas, com checklist por horário. Uma coisa de cada vez na tela, modo "dia difícil" com o mínimo que conta, e nenhuma sequência que zera.

Funciona abrindo o `index.html` no navegador, sem instalação. Os nomes das duas pessoas são definidos dentro do app (aba Plano) e ficam salvos só no aparelho, nunca no código.

## O que tem

| Aba | Conteúdo |
| --- | --- |
| Hoje | Checklist do dia com horário exato: água, banheiro, refeições, creatina, treino, preparo do dia seguinte. O cartão de cima mostra só o que fazer agora. Deslize para os lados para trocar o dia. |
| Treino | Treinos A/B/C/D (seg, ter, qui, sex às 19h15), versão academia e versão em casa, séries para marcar, carga anotada e cronômetro de descanso. |
| Dieta | Refeições de cada perfil com porções, trocas, versão mínima, ajustes do mês 2 e 3, suplementos e regras. |
| Compras | Lista semanal (semanas 1 a 12) com quantidades para as duas, filtro por pessoa e botão de copiar. |
| Plano | Mapa de constância de 84 dias, medidas semanais, fases do treino, lembretes, tema, nomes e data de início. |

Tema claro, escuro ou igual ao celular (botão no topo). Visual em Tailwind CSS 3.4 via CDN.

## Perfis

- **Perfil A — ganho de peso e músculo:** começa em ≈ 2.200 kcal e sobe para ≈ 2.550 no mês 3, em 7 refeições pequenas, com 2 bebidas batidas. Carboidrato sempre junto de proteína ou gordura, caminhada curta após o jantar, redução gradual do achocolatado. Sem cardio extra.
- **Perfil B — perda de gordura:** ≈ 1.750 kcal, proteína alta, carboidrato de batata-doce, mandioca, abóbora e frutas no lugar de arroz e feijão. Musculação como prioridade e cardio de 10–20 min no fim.
- **Treino:** superior/inferior 4x por semana, o mesmo para as duas. Semanas 1–4 base, 5–8 progressão, 9–11 força, 12 alívio e reavaliação.

As calorias são estimativas por fórmula. O plano é um ponto de partida para ajustar com nutricionista e médica, não substitui acompanhamento.

## Lembretes

Página web não toca alarme com o celular bloqueado. Por isso os lembretes saem como arquivos de calendário (`lembretes/*.ics`), que o celular dispara no horário exato:

- `perfil-a-essencial.ics` / `perfil-b-essencial.ics`: 17 alarmes por dia (refeições, creatina, 3 pausas de banheiro, treino, compras e preparo).
- `perfil-a-completo.ics` / `perfil-b-completo.ics`: 30 alarmes, incluindo toda a água.

Os arquivos usam início em segunda, 19/10/2026. Para outra data: `node scripts/gerar-ics.mjs 2026-10-26`, ou mude a data na aba Plano e baixe de lá.

## Instalar no celular (Android e iPhone)

O app é um PWA: depois de publicado num endereço HTTPS, cada uma instala no próprio celular.

1. **Publicar (uma vez):** em [Cloudflare Pages](https://pages.cloudflare.com) → Create → Pages → Connect to Git → escolha este repositório (pode ser privado). Branch: a desta versão. Build command: vazio. Output directory: `/`. Netlify também funciona (`netlify.toml` já está pronto).
2. **iPhone:** abra o endereço no Safari → Compartilhar → Adicionar à Tela de Início.
3. **Android:** abra no Chrome → menu ⋮ → Instalar app (ou o botão "Instalar app" na aba Plano).

Depois de instalado, abre em tela cheia e funciona sem internet. Cada push no repositório atualiza o app; a versão nova aparece na abertura seguinte. Ao mudar arquivos do app, suba o número `VERSAO` em `sw.js`.

## Onde ficam as marcações

- App instalado ou aberto no navegador: ficam salvas em cada celular, sem sincronizar entre as duas.
- Aberto como Artifact no claude.ai: sincroniza entre as duas (precisa de acesso de edição).

## Editar

Conteúdo (horários, refeições, exercícios, compras) em `plano.js`. Interface em `app.js`, visual em `index.html`.
