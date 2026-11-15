# Diagnóstico de UI — Content Signal

**Versão pós-medição 0.3 (commit 22e71eb). Contrastes medidos via Playwright; fontes via document.fonts; loading não observado.**

**Data:** 2026-11-15  
**Base de evidência:** 24 screenshots (4 viewports × 3 abas + 4 viewports × 3 estados), `capture-report.json`, `medicoes.json` (contraste, fontes, overflow, alvos de toque), inspeção de código (`index.html`, `assets/css/style.css`, `assets/js/charts.js`, `assets/js/app.js`)  
**Metodologia:** Critérios — Hierarquia, Composição, Densidade, Tipografia, Espaçamento, Cor/Contraste, Gráficos, Interação, Responsividade, Acessibilidade  
**Classificação de evidência:**
- **medido**: valor computado no navegador (contraste com fórmula WCAG + pares fg/bg, geometria, overflow, alvos de toque, tamanhos de fonte, ordem de foco)
- **hipótese de código**: derivado de leitura de CSS/JS, não confirmado em render
- **requer olhar humano**: hierarquia, composição, densidade, estética — decisão do revisor ao abrir capturas

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Abas testadas | 3 (Diagnóstico, Linhas Editoriais, Meta Ads) |
| Viewports | 4 (1440, 1024, 768, 375) |
| Componentes inventariados | 7 categorias (botões, tabelas, inputs, modais, tabs, gráficos, KPIs) |
| Tokens CSS | 58 custom properties |
| Elementos focáveis | 47 (desktop-1440) |
| Problemas identificados | 18 + 2 novos medidos (P0: 3, P1: 6, P2: 6, P3: 3) |
| Contraste crítico (< 4.5:1) | 3 pares medidos: tab-inactive 3.48:1, funnel-rate 3.20:1, table-header 3.20:1 |

---

## Contraste Medido (desktop-1440, aba Diagnóstico)

| Elemento | Razão | fg | bg | Status | Classificação |
|----------|-------|-----|-----|--------|---------------|
| tab-inactive | 3.48:1 | #888899 | #ffffff | ⚠️ < 4.5 | **medido** |
| tab-active | 5.17:1 | #2563eb | #ffffff | ✅ | medido |
| heading-primary (.section-title) | 16.34:1 | #1a1a2e | #fafafa | ✅ | medido |
| button-secondary | 7.97:1 | #4a4a5a | #f5f5f5 | ✅ | medido |
| badge (warning) | 6.37:1 | #92400e | #fef3c7 | ✅ | medido |
| funnel-label | 7.97:1 | #4a4a5a | #f5f5f5 | ✅ | medido |
| funnel-rate | 3.20:1 | #888899 | #f5f5f5 | ⚠️ < 4.5 | **medido (novo)** |
| table-header (th) | 3.20:1 | #888899 | #f5f5f5 | ⚠️ < 4.5 | **medido (novo)** |
| select-text (placeholder) | 17.06:1 | #1a1a2e | #ffffff | ✅ | medido |

> Fórmula: WCAG 2.1 relative luminance (sRGB) → (L1+0.05)/(L2+0.05). Background resolvido subindo no DOM até primeiro opaco.

---

## Fontes (document.fonts + computed style)

| Contexto | Fonte resolvida | Status |
|----------|-----------------|--------|
| document.fonts | (vazio — nenhuma fonte custom carregada) | **medido** |
| body / UI geral | system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif | medido |
| Canvas charts (charts.js) | Hardcoded `'12px IBM Plex Sans'` etc. — **não disponível**; fallback = system-ui stack acima | hipótese de código |
| Rótulos adjacentes a canvas | system-ui stack (herdado do CSS) | medido |

**Conclusão:** IBM Plex Sans **não está carregada** no documento. O fallback (system-ui) é legível e consistente com o resto da UI. Severidade rebaixada de P0 → P1.

---

## Medidas Automáticas (todas viewports + abas)

### Overflow horizontal (scrollWidth > clientWidth)
| Viewport | Elementos com overflow |
|----------|------------------------|
| desktop-1440 | 1 (table-container 1464 > 1350) |
| desktop-1024 | 2 (table-container 1464 > 974; 1000 > 974) |
| tablet-768 | 3 (table-container 1464/1000/862 > 734) |
| mobile-375 | 4 (NAV.tabs 432 > 375; 3× table-container) |

→ Confirma SIG-UI-005 (tabelas) e revela overflow no NAV.tabs em mobile.

### Alvos de toque < 44px (mobile-375, aba Diagnóstico)
| Elemento | Tamanho | Classificação |
|----------|---------|---------------|
| SELECT (filtros) | 135×37, 138×19, 129×19, 63×19 | **medido** — 4 selects < 44px altura |
| BUTTON.btn-secondary | 207×39, 220×39 | **medido** — 2 botões < 44px altura |

→ 6 elementos interativos abaixo do mínimo WCAG 2.5.5 (44×44px).

### Tamanhos de fonte < 12px (todas viewports)
- 124 elementos: `.badge` (11px), `th` (11px) — **medido**

### Ordem de foco (desktop-1440, Diagnóstico)
1. SELECT (período) → 2. BUTTON (atualizar org) → 3. BUTTON (atualizar ads) → 4. TAB Diagnóstico → 5. TAB Editoriais → 6. TAB Ads → 7. SELECT (métrica) → 8. SELECT (ordenação) → 9. SELECT (top N) → ...

→ Ordem lógica, mas SELECTs e BUTTONs no header não têm `:focus-visible` consistente.

---

## Problemas Priorizados (Reclassificados)

### P0 — Críticos (Bloqueiam uso ou violam acessibilidade básica)

#### SIG-UI-001: Contraste de tabs inativas abaixo de 4.5:1
- **Aba:** Todas (header tabs)
- **Localização:** `.tab-btn:not(.active)` — cor `--text-muted: #888899` sobre fundo branco
- **Evidência:** **medido** 3.48:1 (fg #888899, bg #ffffff) — `medicoes.json`
- **Categoria:** Cor/Contraste / Acessibilidade
- **Impacto:** Usuários com baixa visão não distinguem abas inativas; falha WCAG AA 1.4.3
- **Severidade:** P0 (mantida)
- **Hipótese de código:** `style.css:329` define `color: var(--text-muted)` para `.tab-btn`
- **Esforço:** Baixo (ajustar token `--text-muted` para `#666677` ou similar ≥ 4.5:1)

#### SIG-UI-002: Foco invisível em múltiplos elementos interativos
- **Aba:** Todas
- **Localização:** Botões secundários, selects, inputs — `outline-color: rgb(255,255,255)` sobre fundo branco
- **Evidência:** **hipótese de código** (`capture-report.json` → `keyboard.desktop-1440` índices 9, 11, 25, 26, 38, 39, 45, 46); medição automática de foco não capturou outline consistente
- **Categoria:** Interação / Acessibilidade
- **Impacto:** Navegação por teclado inutilizável; falha WCAG AA 2.4.7
- **Severidade:** P0 (mantida)
- **Hipótese de código:** `style.css:1214-1226` define `:focus-visible` com `outline: 2px solid var(--color-primary)` mas seletores específicos sobrescrevem com `box-shadow` usando cores de fundo; `outline: none` remove outline nativo
- **Esforço:** Médio (refatorar foco para usar apenas `:focus-visible` consistente com `var(--color-primary)`)

#### SIG-UI-003: Gráficos Canvas usam fontes hardcoded não disponíveis
- **Aba:** Diagnóstico, Linhas Editoriais, Meta Ads (10 canvas total)
- **Localização:** `assets/js/charts.js` linhas 75, 129, 193, 212, 317, 337 — `font = '12px IBM Plex Sans'` / `'11px IBM Plex Sans'` / `'14px IBM Plex Sans'`
- **Evidência:** **medido** — `document.fonts` vazio; **hipótese de código** — Canvas usa IBM Plex Sans hardcoded; fallback real = system-ui stack (legível)
- **Categoria:** Gráficos / Tipografia
- **Impacto:** Fallback para fonte do sistema quebra alinhamento, legibilidade e consistência visual; em mobile rótulos podem transbordar
- **Severidade:** **P1** (rebaixada de P0 — fallback legível e consistente)
- **Hipótese de código:** `charts.js` assume fonte disponível; CSS define `--font-family: system-ui...` mas charts usam Canvas API direto sem herdar CSS
- **Esforço:** Médio (extrair fonte do CSS computado ou usar `var(--font-family)` via `getComputedStyle`)

---

### P1 — Altos (Degradam experiência significativamente)

#### SIG-UI-004: Cores de gráficos não usam design tokens (não temam)
- **Aba:** Todas (10 gráficos)
- **Localização:** `assets/js/charts.js` linhas 6-20 — objeto `CHART_COLORS` hardcoded com valores hex
- **Evidência:** **hipótese de código** — Tokens CSS definem `--color-primary`, `--color-success`, etc. mas charts não os consomem; modo escuro em `charts.js:22-38` duplica lógica do CSS
- **Categoria:** Gráficos / Design System
- **Impacto:** Mudança de tema requer editar JS; inconsistência entre UI e gráficos; manutenção duplicada
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `getColors()` em `charts.js:40-60` detecta `prefers-color-scheme` mas usa paleta própria; não lê `--color-primary` do `:root`
- **Esforço:** Médio (refatorar `getColors()` para ler custom properties via `getComputedStyle(document.documentElement)`)

#### SIG-UI-005: Tabelas densas sem indicação de scroll horizontal em mobile
- **Aba:** Diagnóstico (14 colunas), Linhas Editoriais (15), Meta Ads (18)
- **Localização:** `.table-container` com `overflow-x: auto` mas sem shadow/fade visual
- **Evidência:** **medido** overflow em todas viewports (table-container scrollWidth > clientWidth); **requer olhar humano** para affordance visual
- **Categoria:** Responsividade / Composição
- **Impacto:** Usuário mobile não descobre colunas ocultas; dados inacessíveis
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `style.css:522-527` define `.table-container { overflow-x: auto }` sem indicação visual
- **Esforço:** Baixo (adicionar fade lateral ou shadow inset indicando overflow)

#### SIG-UI-006: Hierarquia visual fraca — títulos de seção competem com KPIs
- **Aba:** Diagnóstico (6 seções)
- **Localização:** `.section-title` (`style.css:407-414`) usa `font-size: var(--font-size-lg)` (17px)
- **Evidência:** **requer olhar humano** — decisão visual ao comparar `.section-title` (17px/600) vs `.kpi-label` (11px/400) vs `.kpi-value` (28px/700)
- **Categoria:** Hierarquia / Tipografia
- **Impacto:** Escaneabilidade reduzida; usuário não distingue seções principais de métricas
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `--font-size-lg: 17px` para `.section-title` vs `--font-size-xs: 11px` para `.kpi-label`; gap insuficiente
- **Esforço:** Baixo (aumentar `.section-title` para `--font-size-xl` 20px + `font-weight: 700`; adicionar `margin-top: var(--space-xl)`)

#### SIG-UI-007: Espaçamento inconsistente entre cards KPI e gráficos
- **Aba:** Diagnóstico (kpi-grid + charts-row adjacentes)
- **Localização:** `.kpi-grid` gap `--space-md` (16px) vs `.charts-row` gap `--space-lg` (24px)
- **Evidência:** **requer olhar humano** — ritmo visual percebido nas capturas
- **Categoria:** Espaçamento / Composição
- **Impacto:** Ritmo visual quebrado; sensação de "amadorismo"
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `style.css:422` vs `style.css:492` usam tokens diferentes sem razão semântica
- **Esforço:** Baixo (unificar para `--space-lg` ou criar token `--space-component-gap`)

#### SIG-UI-008: Estados de loading mínimos — sem skeleton ou progress
- **Aba:** Todas
- **Localização:** Não há CSS para `.loading` ou skeleton screens
- **Evidência:** **não observado** — capturas `loading` mostram página em branco com header/tabs apenas; não representam estado real de carregamento de dados
- **Categoria:** Interação / Feedback
- **Impacto:** Usuário não sabe se app carregou ou travou; percepção de lentidão
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `app.js` renderiza dados assincronamente mas não injeta placeholders
- **Esforço:** Médio (adicionar skeleton CSS para kpi-grid, charts-row, tables)

#### SIG-UI-009: Botões de ação primária/secundária com peso visual invertido
- **Aba:** Linhas Editoriais, Meta Ads, Modais
- **Localização:** `.btn-icon` com `color: var(--text-muted)` sem variantes perigosas/primárias
- **Evidência:** **requer olhar humano** — decisão visual sobre peso de ícones de ação
- **Categoria:** Interação / Hierarquia
- **Impacto:** Ações destrutivas (excluir) sem peso de alerta; ações primárias em tabelas indistinguíveis
- **Severidade:** P1 (mantida)
- **Hipótese de código:** `style.css:615-633` define `.btn-icon` com `color: var(--text-muted)`; não há `.btn-icon.alert` ou `.btn-icon.primary`
- **Esforço:** Baixo (adicionar variantes de ícone para ações perigosas/primárias)

---

### P2 — Médios (Melhorias de qualidade e consistência)

#### SIG-UI-010: Badge "Dados de demonstração" compete com logo
- **Aba:** Todas (header)
- **Localização:** `.badge#data-badge` usa `--color-warning-light`/`--color-warning-text`
- **Evidência:** **requer olhar humano** — saliência visual do badge amarelo vs logo azul
- **Categoria:** Hierarquia / Cor
- **Impacto:** Ruído visual; badge informativo não deve ser elemento mais saliente do header
- **Severidade:** P2 (mantida)
- **Hipótese de código:** `style.css:220` `background: var(--color-warning-light)` — cor de aviso para status informativo
- **Esforço:** Baixo (mudar para `--color-primary-light`/`--color-primary-text` ou neutro)

#### SIG-UI-011: Selects de filtro sem label visível (apenas sr-only)
- **Aba:** Diagnóstico (3), Linhas Editoriais (5), Meta Ads (2)
- **Localização:** `<label class="sr-only">` + `<select aria-label="...">`
- **Evidência:** **hipótese de código** — `index.html` usa apenas `sr-only`; **medido** — selects têm altura < 44px em mobile
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Usuários mouse/touch não entendem propósito dos filtros; falha WCAG 3.3.2
- **Severidade:** P2 (mantida)
- **Hipótese de código:** `index.html` linhas 114-142, 315-319, 355-381, 421-439
- **Esforço:** Baixo (adicionar label visível ou `placeholder` descritivo)

#### SIG-UI-012: Modais grandes em mobile ocupam 90vh mas conteúdo não scroll independentemente
- **Aba:** Todas (modais importação, ideia, linha editorial)
- **Localização:** `.modal-body { max-height: 60vh }`
- **Evidência:** **hipótese de código** — `style.css:925-928`; 60vh em 375px = ~240px, insuficiente para 8 campos
- **Categoria:** Responsividade / Interação
- **Impacto:** Formulário longo pode cortar botões de ação em mobile
- **Severidade:** P2 (mantida)
- **Esforço:** Baixo (aumentar para `70vh` ou `flex: 1` com `overflow: auto`)

#### SIG-UI-013: Funil orgânico/pago — setas não acessíveis (aria-hidden) mas sem alternativa textual
- **Aba:** Diagnóstico (funil orgânico), Meta Ads (funil pago)
- **Localização:** `.funnel-arrow` com `aria-hidden="true"` + `.funnel-rate` em alguns steps
- **Evidência:** **hipótese de código** — estrutura visual apenas em `index.html`
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Usuários SR perdem estrutura de funil; taxas não anunciadas
- **Severidade:** P2 (mantida)
- **Esforço:** Médio (adicionar `aria-label` no container ou `<ol>` com `aria-labelledby`)

#### SIG-UI-014: Grid KPI — cards não anunciam unidade/medida para SR
- **Aba:** Diagnóstico, Linhas Editoriais, Meta Ads
- **Localização:** `.kpi-card` com `.kpi-label` + `.kpi-value` + `.kpi-sub` — sem ARIA
- **Evidência:** **hipótese de código** — `app.js` popula dinamicamente sem ARIA
- **Categoria:** Acessibilidade / Composição
- **Impacto:** Métricas ambíguas para tecnologias assistivas
- **Severidade:** P2 (mantida)
- **Esforço:** Baixo (adicionar `aria-label` no `.kpi-card`)

#### SIG-UI-015: Transições de tab (fadeIn 0.2s) — motion não respeita `prefers-reduced-motion`
- **Aba:** Todas (troca de tabs)
- **Localização:** `style.css:377-380` `@keyframes fadeIn` + `.tab-panel` animation
- **Evidência:** **hipótese de código** — não há `@media (prefers-reduced-motion: reduce)`
- **Categoria:** Animação / Acessibilidade
- **Impacto:** Usuários vestibulares/motion-sensitive experimentam animação desnecessária
- **Severidade:** P2 (mantida)
- **Esforço:** Baixo (adicionar media query para desabilitar)

---

### P3 — Baixos (Polimento e consistência)

#### SIG-UI-016: Scrollbar personalizada usa cores hardcoded no hover
- **Aba:** Todas
- **Localização:** `style.css:1183-1208` `::-webkit-scrollbar-thumb:hover` usa valores numéricos
- **Evidência:** **hipótese de código** — light mode `--gray-400` hardcoded, dark `--gray-500`/`--gray-600`
- **Categoria:** Design System / Consistência
- **Severidade:** P3 (mantida)
- **Esforço:** Baixo (substituir por tokens)

#### SIG-UI-017: Print stylesheet remove tabs mas mantém 3 abas empilhadas
- **Aba:** Todas
- **Localização:** `style.css:1232-1263` `@media print`
- **Evidência:** **hipótese de código** — `.tab-panel` todos `display: block` no print
- **Categoria:** Composição / Qualidade
- **Severidade:** P3 (mantida)
- **Esforço:** Baixo (ocultar painéis inativos no print)

#### SIG-UI-018: Ícones SVG inline duplicados em múltiplos botões
- **Aba:** Header, Tabs, Modais, Tabelas
- **Localização:** `index.html` — SVGs repetidos inline
- **Evidência:** **hipótese de código** — mesmo ícone aparece 2-4×
- **Categoria:** Performance / Manutenibilidade
- **Severidade:** P3 (mantida)
- **Esforço:** Médio (criar sprite SVG ou componentizar via JS template)

---

## Matriz de Cobertura por Critério (Atualizada)

| Critério | P0 | P1 | P2 | P3 | Total | Status |
|----------|----|----|----|----|-------|--------|
| Hierarquia | 0 | 2 | 1 | 0 | 3 | ⚠️ |
| Composição | 0 | 1 | 2 | 1 | 4 | ⚠️ |
| Densidade | 0 | 1 | 0 | 0 | 1 | ✅ |
| Tipografia | 0 | 2 | 0 | 0 | 2 | ⚠️ |
| Espaçamento | 0 | 1 | 0 | 0 | 1 | ✅ |
| Cor/Contraste | 2 | 1 | 1 | 0 | 4 | 🔴 |
| Gráficos | 1 | 1 | 0 | 0 | 2 | 🔴 |
| Interação | 1 | 2 | 1 | 0 | 4 | 🔴 |
| Responsividade | 0 | 1 | 1 | 0 | 2 | ⚠️ |
| Acessibilidade | 2 | 0 | 5 | 1 | 8 | 🔴 |

**Mudanças vs. versão anterior:**
- SIG-UI-003 rebaixado P0→P1 (IBM Plex Sans fallback legível)
- Tipografia: P0→0, P1: 1→2
- Gráficos: P0: 2→1

**Legenda:** 🔴 Crítico (P0/P1) | ⚠️ Atenção (P2) | ✅ OK (P3 apenas)

---

## Proposta de Tela-Piloto para ETAPA 3

**Aba recomendada:** **Diagnóstico** (maior superfície: KPIs, gráficos, tabelas, funil, diagnóstico automático)

**3–5 Fixes Prioritários para Piloto:**

1. **SIG-UI-001 (P0)** — Corrigir contraste tabs inativas → token `--text-muted` ≥ 4.5:1
2. **SIG-UI-002 (P0)** — Unificar `:focus-visible` para todos os interativos (`var(--color-primary)`)
3. **SIG-UI-003 (P1)** — Gráficos usarem fonte do CSS (`getComputedStyle` → `--font-family`)
4. **SIG-UI-004 (P1)** — Gráficos consumirem design tokens (`--color-primary`, etc.)
5. **SIG-UI-006 (P1)** — Hierarquia: `.section-title` → `--font-size-xl` (20px) + peso 700

**Critérios de Aceite do Piloto:**
- [ ] Contraste tabs inativas ≥ 4.5:1 (verificar com DevTools)
- [ ] Navegação Tab completa com foco visível consistente (azul `--color-primary`)
- [ ] Gráficos renderizam com fonte do sistema e cores do tema (light/dark)
- [ ] Títulos de seção visualmente distintos de KPI labels
- [ ] Zero regressões visuais nos outros viewports (1024, 768, 375)
- [ ] Testes determinísticos (96/96) continuam passando

---

## Reconciliação do BACKLOG

| ID | Status Anterior | Status Novo | Observação |
|----|-----------------|-------------|------------|
| SIG-03 | Concluído | **Pendente** | Aguarda aprovação de direção visual (Part B) |
| SIG-03a | — | **Pendente** | **Nova** — Revisão visual humana das capturas (hierarquia, composição, densidade, estética) |

---

## Próximos Passos

1. **Aprovação deste diagnóstico** — Confirmar priorização e tela-piloto
2. **ETAPA 3 (Part A)** — Implementar fatia da aba Diagnóstico (fixes 1-5 acima)
3. **ETAPA 3 (Part B)** — Propor 2-3 direções visuais para hierarquia/composição (requer olhar humano)
4. **Validação visual** — Capturar antes/depois nos 4 viewports
5. **ETAPA 4** — Consolidar tokens/componentes/checklist em `DESIGN.md`
6. **ETAPA 5** — Automações (base de tarefas, e-mail operacional)

---

*Gerado em 2026-11-15 a partir de captura automatizada Playwright + medições `medicoes.json` + inspeção de código*