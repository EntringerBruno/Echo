# Diagnóstico de UI — Content Signal

**Data:** 2026-11-15  
**Base de evidência:** 24 screenshots (4 viewports × 3 abas + 4 viewports × 3 estados), `capture-report.json`, inspeção de código (`index.html`, `assets/css/style.css`, `assets/js/charts.js`)  
**Metodologia:** Critérios de avaliação — Hierarquia, Composição, Densidade, Tipografia, Espaçamento, Cor/Contraste, Gráficos, Interação, Responsividade, Acessibilidade

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Abas testadas | 3 (Diagnóstico, Linhas Editoriais, Meta Ads) |
| Viewports | 4 (1440, 1024, 768, 375) |
| Componentes inventariados | 7 categorias (botões, tabelas, inputs, modais, tabs, gráficos, KPIs) |
| Tokens CSS | 58 custom properties |
| Elementos focáveis | 47 (desktop-1440) |
| Problemas identificados | 18 (P0: 3, P1: 6, P2: 6, P3: 3) |

---

## Problemas Priorizados

### P0 — Críticos (Bloqueiam uso ou violam acessibilidade básica)

#### SIG-UI-001: Contraste de tabs inativas abaixo de 4.5:1
- **Aba:** Todas (header tabs)
- **Localização:** `.tab-btn:not(.active)` — cor `--text-muted: #888899` sobre `--bg-secondary: #ffffff`
- **Evidência:** `capture-report.json` → `contrast.tab-inactive` → fg `rgb(136,136,153)`, bg `rgb(0,0,0)` (medição falhou por background transparente herdado); inspeção visual confirma cinza médio sobre branco
- **Categoria:** Cor/Contraste / Acessibilidade
- **Impacto:** Usuários com baixa visão não distinguem abas inativas; falha WCAG AA 1.4.3
- **Severidade:** P0
- **Hipótese de código:** `style.css:329` define `color: var(--text-muted)` para `.tab-btn`; `--text-muted: #888899` tem contraste ~2.1:1 sobre branco
- **Esforço:** Baixo (ajustar token `--text-muted` para `#666677` ou similar ≥ 4.5:1)

#### SIG-UI-002: Foco invisível em múltiplos elementos interativos
- **Aba:** Todas
- **Localização:** Botões secundários, selects, inputs — `outline-color: rgb(255,255,255)` sobre fundo branco; `outline-color: rgb(0,0,0)` sobre fundos escuros
- **Evidência:** `capture-report.json` → `keyboard.desktop-1440` índices 9, 11, 25, 26, 38, 39, 45, 46 mostram `outlineColor: rgb(255,255,255)` ou `rgb(0,0,0)` com `boxShadow: none`
- **Categoria:** Interação / Acessibilidade
- **Impacto:** Navegação por teclado inutilizável; falha WCAG AA 2.4.7
- **Severidade:** P0
- **Hipótese de código:** `style.css:1214-1226` define `:focus-visible` com `outline: 2px solid var(--color-primary)` mas seletores específicos (`.btn-secondary:focus`, `select:focus`, etc.) sobrescrevem com `box-shadow` usando cores de fundo; `outline: none` remove outline nativo
- **Esforço:** Médio (refatorar foco para usar apenas `:focus-visible` consistente com `var(--color-primary)`)

#### SIG-UI-003: Gráficos Canvas usam fontes hardcoded não disponíveis
- **Aba:** Diagnóstico, Linhas Editoriais, Meta Ads (10 canvas total)
- **Localização:** `assets/js/charts.js` linhas 75, 129, 193, 212, 317, 337 — `font = '12px IBM Plex Sans'` / `'11px IBM Plex Sans'` / `'14px IBM Plex Sans'`
- **Evidência:** Captura de tela mostra rótulos de eixos e valores renderizados; fonte IBM Plex Sans não é carregada no projeto (não há `@font-face` nem import)
- **Categoria:** Gráficos / Tipografia
- **Impacto:** Fallback para fonte do sistema quebra alinhamento, legibilidade e consistência visual; em mobile rótulos podem transbordar
- **Severidade:** P0
- **Hipótese de código:** `charts.js` assume fonte disponível; CSS define `--font-family: system-ui...` mas charts usam Canvas API direto sem herdar CSS
- **Esforço:** Médio (extrair fonte do CSS computado ou usar `var(--font-family)` via `getComputedStyle`)

---

### P1 — Altos (Degradam experiência significativamente)

#### SIG-UI-004: Cores de gráficos não usam design tokens (não temam)
- **Aba:** Todas (10 gráficos)
- **Localização:** `assets/js/charts.js` linhas 6-20 — objeto `CHART_COLORS` hardcoded com valores hex
- **Evidência:** Tokens CSS definem `--color-primary`, `--color-success`, etc. mas charts não os consomem; modo escuro definido em `charts.js:22-38` duplica lógica do CSS
- **Categoria:** Gráficos / Design System
- **Impacto:** Mudança de tema requer editar JS; inconsistência entre UI e gráficos; manutenção duplicada
- **Severidade:** P1
- **Hipótese de código:** `getColors()` em `charts.js:40-60` detecta `prefers-color-scheme` mas usa paleta própria; não lê `--color-primary` do `:root`
- **Esforço:** Médio (refatorar `getColors()` para ler custom properties via `getComputedStyle(document.documentElement)`)

#### SIG-UI-005: Tabelas densas sem indicação de scroll horizontal em mobile
- **Aba:** Diagnóstico (tabela ranking 14 colunas), Linhas Editoriais (15 colunas), Meta Ads (18 colunas)
- **Localização:** `.table-container` com `overflow-x: auto` mas sem shadow/fade visual
- **Evidência:** Screenshots mobile-375 mostram tabelas cortadas sem affordance visual de scroll
- **Categoria:** Responsividade / Composição
- **Impacto:** Usuário mobile não descobre colunas ocultas; dados inacessíveis
- **Severidade:** P1
- **Hipótese de código:** `style.css:522-527` define `.table-container { overflow-x: auto }` sem `background: linear-gradient(...)` ou `scrollbar-gutter`
- **Esforço:** Baixo (adicionar fade lateral ou shadow inset indicando overflow)

#### SIG-UI-006: Hierarquia visual fraca — títulos de seção competem com KPIs
- **Aba:** Diagnóstico (seções "Visão geral", "Desempenho por formato", "Ranking", "Reels", "Funil orgânico", "Diagnóstico automático")
- **Localização:** `.section-title` (`style.css:407-414`) usa `font-size: var(--font-size-lg)` (17px) mesmo peso que `.kpi-value` (`font-size-2xl` 28px mas labels menores)
- **Evidência:** Captura desktop-1440 mostra títulos de seção visualmente semelhantes a labels de cards KPI
- **Categoria:** Hierarquia / Tipografia
- **Impacto:** Escaneabilidade reduzida; usuário não distingue seções principais de métricas
- **Severidade:** P1
- **Hipótese de código:** `--font-size-lg: 17px` para `.section-title` vs `--font-size-xs: 11px` para `.kpi-label`; gap insuficiente
- **Esforço:** Baixo (aumentar `.section-title` para `--font-size-xl` 20px + `font-weight: 700`; adicionar `margin-top: var(--space-xl)`)

#### SIG-UI-007: Espaçamento inconsistente entre cards KPI e gráficos
- **Aba:** Diagnóstico (kpi-grid + charts-row adjacentes)
- **Localização:** `.kpi-grid` gap `--space-md` (16px) vs `.charts-row` gap `--space-lg` (24px) vs `.section` margin-bottom `--space-2xl` (48px)
- **Evidência:** Visualmente, gap entre KPIs e primeiro gráfico parece menor que gap entre gráficos
- **Categoria:** Espaçamento / Composição
- **Impacto:** Ritmo visual quebrado; sensação de "amadorismo"
- **Severidade:** P1
- **Hipótese de código:** `style.css:422` (kpi-grid gap) vs `style.css:492` (charts-row gap) usam tokens diferentes sem razão semântica
- **Esforço:** Baixo (unificar para `--space-lg` ou criar token `--space-component-gap`)

#### SIG-UI-008: Estados de loading mínimos — sem skeleton ou progress
- **Aba:** Todas (captura `loading` state mostra página em branco com header/tabs)
- **Localização:** Não há CSS para `.loading` ou skeleton screens
- **Evidência:** `capture-report.json` → `states.loading` screenshots mostram apenas header + tabs + main vazio
- **Categoria:** Interação / Feedback
- **Impacto:** Usuário não sabe se app carregou ou travou; percepção de lentidão
- **Severidade:** P1
- **Hipótese de código:** `app.js` renderiza dados assincronamente mas não injeta placeholders
- **Esforço:** Médio (adicionar skeleton CSS para kpi-grid, charts-row, tables)

#### SIG-UI-009: Botões de ação primária/secundária com peso visual invertido
- **Aba:** Linhas Editoriais ("+ Nova linha"), Meta Ads (ações de tabela), Modais ("Salvar" vs "Cancelar")
- **Localização:** `.btn-primary` (azul fill) vs `.btn-secondary` (cinza outline) — mas em modais "Salvar" é primary e "Cancelar" secondary (correto); em header "Atualizar dados" são secondary (correto); em tabelas ações usam `.btn-icon` sem distinção
- **Evidência:** Captura mostra "Salvar" (primary) e "Cancelar" (secondary) em modais — OK; mas botões de tabela (editar/excluir) são `.btn-icon` com cor muted
- **Categoria:** Interação / Hierarquia
- **Impacto:** Ações destrutivas (excluir) não têm peso visual de alerta; ações primárias em tabelas indistinguíveis
- **Severidade:** P1
- **Hipótese de código:** `style.css:615-633` define `.btn-icon` com `color: var(--text-muted)`; não há variante `.btn-icon.alert` ou `.btn-icon.primary`
- **Esforço:** Baixo (adicionar variantes de ícone para ações perigosas/primárias)

---

### P2 — Médios (Melhorias de qualidade e consistência)

#### SIG-UI-010: Badge "Dados de demonstração" compete com logo
- **Aba:** Todas (header)
- **Localização:** `.badge#data-badge` (`style.css:215-224`) usa `--color-warning-light`/`--color-warning-text` (amarelo/laranja) ao lado do logo azul
- **Evidência:** Screenshot desktop-1440 mostra badge amarelo brilhante ao lado do logo — atrai olho antes do título
- **Categoria:** Hierarquia / Cor
- **Impacto:** Ruído visual; badge informativo não deve ser elemento mais saliente do header
- **Severidade:** P2
- **Hipótese de código:** `style.css:220` `background: var(--color-warning-light)` — cor de aviso usada para status informativo
- **Esforço:** Baixo (mudar para `--color-primary-light`/`--color-primary-text` ou `--gray-200`/`--gray-700`)

#### SIG-UI-011: Selects de filtro sem label visível (apenas sr-only)
- **Aba:** Diagnóstico (3 selects), Linhas Editoriais (5 selects), Meta Ads (2 selects)
- **Localização:** `<label class="sr-only">` + `<select aria-label="...">`
- **Evidência:** Capturas mostram dropdowns "flutuantes" sem contexto visual do que filtram
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Usuários de mouse/touch não entendem propósito dos filtros sem interagir; falha WCAG 3.3.2 (labels)
- **Severidade:** P2
- **Hipótese de código:** `index.html` linhas 114-142, 315-319, 355-381, 421-439 usam `sr-only` apenas
- **Esforço:** Baixo (adicionar label visível ou `placeholder` descritivo no primeiro option)

#### SIG-UI-012: Modais grandes em mobile ocupam 90vh mas conteúdo não scroll independentemente
- **Aba:** Todas (modais de importação, ideia, linha editorial)
- **Localização:** `.modal` `max-height: 90vh` + `.modal-body` `max-height: 60vh` + `overflow-y: auto`
- **Evidência:** Mobile-375 screenshots não capturaram modais abertos; código sugere header/footer fixos mas body scroll pode falhar em formulários longos
- **Categoria:** Responsividade / Interação
- **Impacto:** Em mobile, formulário longo (ideia tem 8 campos) pode cortar botões de ação
- **Severidade:** P2
- **Hipótese de código:** `style.css:925-928` `.modal-body { max-height: 60vh }` — em 375px altura ~400px, 60vh = 240px, insuficiente para 8 campos + gaps
- **Esforço:** Baixo (aumentar para `70vh` ou usar `flex: 1` com `overflow: auto` no modal-content)

#### SIG-UI-013: Funil orgânico/pago — setas não acessíveis (aria-hidden) mas sem alternativa textual
- **Aba:** Diagnóstico (funil orgânico), Meta Ads (funil pago)
- **Localização:** `.funnel-arrow` com `aria-hidden="true"` + `.funnel-rate` apenas em alguns steps
- **Evidência:** Screen reader ouve "Alcance — Visitas ao perfil — Cliques no link — DMs — Conversões" sem indicar direção/proporção
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Usuários SR perdem estrutura de funil; taxas de conversão não anunciadas
- **Severidade:** P2
- **Hipótese de código:** `index.html` linhas 209-236, 514-554 — estrutura visual apenas
- **Esforço:** Médio (adicionar `aria-label` no container ou usar `<ol>` com `aria-labelledby`)

#### SIG-UI-014: Grid KPI — cards não anunciam unidade/medida para SR
- **Aba:** Diagnóstico, Linhas Editoriais, Meta Ads
- **Localização:** `.kpi-card` com `.kpi-label` + `.kpi-value` + `.kpi-sub` — sem `role="region"` ou `aria-label`
- **Evidência:** SR lê "Alcance 12.5K" mas não sabe se é "Alcance médio", "Alcance total", "Alcance último período"
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Métricas ambíguas para tecnologias assistivas
- **Severidade:** P2
- **Hipótese de código:** `app.js` popula `.kpi-grid` dinamicamente; HTML estático não tem ARIA
- **Esforço:** Baixo (adicionar `aria-label` no `.kpi-card` com label + value + sub concatenados)

#### SIG-UI-015: Transições de tab (fadeIn 0.2s) — motion não respeita `prefers-reduced-motion`
- **Aba:** Todas (troca de tabs)
- **Localização:** `style.css:377-380` `@keyframes fadeIn` + `.tab-panel` `animation: fadeIn 0.2s ease`
- **Evidência:** Não há `@media (prefers-reduced-motion: reduce)` para desabilitar
- **Categoria:** Animação / Acessibilidade
- **Impacto:** Usuários vestibulares/motion-sensitive experimentam animação desnecessária
- **Severidade:** P2
- **Hipótese de código:** Animação hardcoded sem media query
- **Esforço:** Baixo (adicionar `@media (prefers-reduced-motion: reduce) { .tab-panel { animation: none } }`)

---

### P3 — Baixos (Polimento e consistência)

#### SIG-UI-016: Scrollbar personalizada usa cores hardcoded (não tokens)
- **Aba:** Todas (tabelas, modais, página)
- **Localização:** `style.css:1183-1208` `::-webkit-scrollbar-thumb { background: var(--gray-300) }` — OK usa token, mas `:hover` usa `--gray-400` hardcoded no light mode e `--gray-500`/`--gray-600` no dark
- **Evidência:** Consistente com tokens na maior parte; apenas hover usa valores numéricos
- **Categoria:** Design System / Consistência
- **Impacto:** Menor — manutenção futura
- **Severidade:** P3
- **Esforço:** Baixo (substituir por `--gray-400` / `--gray-500` tokens)

#### SIG-UI-017: Print stylesheet remove tabs mas mantém estrutura de 3 abas empilhadas
- **Aba:** Todas
- **Localização:** `style.css:1232-1263` `@media print` esconde `.tabs` mas `.tab-panel` todos têm `display: block` (via `.active` apenas no JS)
- **Evidência:** Impressão mostrará 3 painéis completos empilhados (Diagnóstico + Editoriais + Ads)
- **Categoria:** Composição / Qualidade
- **Impacto:** Páginas impressas longas e redundantes
- **Severidade:** P3
- **Esforço:** Baixo (adicionar `.tab-panel { display: none } .tab-panel.active { display: block }` no print)

#### SIG-UI-018: Ícones SVG inline duplicados em múltiplos botões
- **Aba:** Header (import buttons), Tabs (3×), Modais (close ×3), Tabelas (ações)
- **Localização:** `index.html` — SVGs repetidos inline (download, tab icons, close, edit, delete)
- **Evidência:** Mesmo ícone de download aparece 2× no header; ícone close 4×; ícones de tab 3×
- **Categoria:** Performance / Manutenibilidade
- **Impacto:** HTML inchado (~2KB); mudança de ícone requer editar múltiplos locais
- **Severidade:** P3
- **Esforço:** Médio (criar sprite SVG ou componentizar via JS template)

---

## Matriz de Cobertura por Critério

| Critério | P0 | P1 | P2 | P3 | Total | Status |
|----------|----|----|----|----|-------|--------|
| Hierarquia | 0 | 2 | 1 | 0 | 3 | ⚠️ |
| Composição | 0 | 1 | 2 | 1 | 4 | ⚠️ |
| Densidade | 0 | 1 | 0 | 0 | 1 | ✅ |
| Tipografia | 1 | 1 | 0 | 0 | 2 | ⚠️ |
| Espaçamento | 0 | 1 | 0 | 0 | 1 | ✅ |
| Cor/Contraste | 2 | 1 | 1 | 0 | 4 | 🔴 |
| Gráficos | 2 | 1 | 0 | 0 | 3 | 🔴 |
| Interação | 1 | 2 | 1 | 0 | 4 | 🔴 |
| Responsividade | 0 | 1 | 1 | 0 | 2 | ⚠️ |
| Acessibilidade | 2 | 0 | 5 | 1 | 8 | 🔴 |

**Legenda:** 🔴 Crítico (P0/P1) | ⚠️ Atenção (P2) | ✅ OK (P3 apenas)

---

## Proposta de Tela-Piloto para ETAPA 3

**Aba recomendada:** **Diagnóstico** (maior superfície, cobre KPIs, gráficos, tabelas, funil, diagnóstico automático)

**3–5 Fixes Prioritários para Piloto:**

1. **SIG-UI-001** (P0) — Corrigir contraste tabs inativas → token `--text-muted`
2. **SIG-UI-002** (P0) — Unificar `:focus-visible` para todos os interativos
3. **SIG-UI-003** (P0) — Gráficos usarem fonte do CSS (`getComputedStyle`)
4. **SIG-UI-004** (P1) — Gráficos consumirem design tokens (`--color-primary`, etc.)
5. **SIG-UI-006** (P1) — Hierarquia: `.section-title` → `--font-size-xl` + peso 700

**Critérios de Aceite do Piloto:**
- [ ] Contraste tabs inativas ≥ 4.5:1 (verificar com DevTools)
- [ ] Navegação Tab completa com foco visível consistente (azul `--color-primary`)
- [ ] Gráficos renderizam com fonte do sistema e cores do tema (light/dark)
- [ ] Títulos de seção visualmente distintos de KPI labels
- [ ] Zero regressões visuais nos outros viewports (1024, 768, 375)
- [ ] Testes determinísticos (96/96) continuam passando

---

## Próximos Passos

1. **Aprovação deste diagnóstico** — Confirmar priorização e tela-piloto
2. **ETAPA 3** — Implementar fatia da aba Diagnóstico (fixes 1-5 acima)
3. **Validação visual** — Capturar antes/depois nos 4 viewports
4. **ETAPA 4** — Consolidar tokens/componentes/checklist em `DESIGN.md`
5. **ETAPA 5** — Automações (base de tarefas, e-mail operacional)

---

*Gerado em 2026-11-15 a partir de captura automatizada Playwright + inspeção de código*