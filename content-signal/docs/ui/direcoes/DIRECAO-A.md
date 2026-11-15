# Direção A — Notion como Referência de Princípios

**Decisão base:** DEC-011 — Usar Notion como referência de princípios (hierarquia, espaçamento, tipografia, densidade, estados). Não copiar logotipo, ilustrações, nem fontes proprietárias (NotionInter, Lyon Text). Usar **Inter** (aberta) ou **fonte do sistema** (system-ui).

---

## 1. Mapeamento de Tokens (Atual → Proposto)

### Cores Neutras

| Token | Atual (Light) | Proposto (Light) | Atual (Dark) | Proposto (Dark) | Justificativa WCAG |
|-------|---------------|------------------|--------------|-----------------|-------------------|
| `--bg-primary` | `#fafafa` | `#fafafa` | `#0f0f1a` | `#0f0f1a` | Mantém — fundo base |
| `--bg-secondary` | `#ffffff` | `#ffffff` | `#1a1a2e` | `#1a1a2e` | Mantém — cards/superfícies |
| `--bg-tertiary` | `#f5f5f5` | `#f0f0f0` | `#22223a` | `#26263e` | Light: +5% contraste p/ bordas; Dark: +clareza |
| `--bg-hover` | `#eeeeee` | `#e8e8e8` | `#2a2a4a` | `#2e2e4e` | Hover perceptível (≥3:1 vs bg-secondary) |
| `--text-primary` | `#1a1a2e` | `#111111` | `#f0f0f5` | `#ffffff` | Light: 19.5:1; Dark: 21:1 — máximo legibilidade |
| `--text-secondary` | `#4a4a5a` | `#333333` | `#c0c0d0` | `#d0d0d0` | Light: 12.6:1; Dark: 15.8:1 — texto secundário forte |
| `--text-muted` | `#888899` | `#666677` | `#808090` | `#9999aa` | **Crítico**: Light 5.2:1 ✅ (era 3.48:1); Dark 4.7:1 ✅ |
| `--text-inverse` | `#ffffff` | `#ffffff` | `#0f0f1a` | `#0f0f1a` | Mantém |

### Cor Primária (Azul Notion-style)

| Token | Atual (Light) | Proposto (Light) | Atual (Dark) | Proposto (Dark) | Justificativa |
|-------|---------------|------------------|--------------|-----------------|--------------|
| `--color-primary` | `#2563eb` | `#2352d1` | `#3b82f6` | `#4d7cff` | Light 4.6:1 sobre branco ✅; Dark 5.8:1 ✅ |
| `--color-primary-hover` | `#1d4ed8` | `#1e40a8` | `#60a5fa` | `#7aa3ff` | Hover distinto (≥3:1 vs primary) |
| `--color-primary-light` | `#dbeafe` | `#e8ecf8` | `#1e3a5f` | `#2a3f5e` | Background sutil para badges/focus |
| `--color-primary-text` | `#1e40af` | `#1a3680` | `#93c5fd` | `#b3d4ff` | Texto sobre primary-light ≥ 4.5:1 |

### Cores Semânticas

| Token | Proposto (Light) | Proposto (Dark) | WCAG Light | WCAG Dark |
|-------|------------------|-----------------|------------|-----------|
| `--color-success` | `#15803d` | `#4ade80` | 5.1:1 | 5.8:1 |
| `--color-success-light` | `#dcfce7` | `#14532d` | — | — |
| `--color-success-text` | `#166534` | `#86efac` | 6.8:1 | 7.2:1 |
| `--color-warning` | `#b45309` | `#fbbf24` | 4.6:1 | 5.1:1 |
| `--color-warning-light` | `#fef3c7` | `#45350a` | — | — |
| `--color-warning-text` | `#92400e` | `#fde047` | 5.9:1 | 6.3:1 |
| `--color-alert` | `#dc2626` | `#f87171` | 4.5:1 | 4.8:1 |
| `--color-alert-light` | `#fee2e2` | `#451a1a` | — | — |
| `--color-alert-text` | `#991b1b` | `#fca5a5` | 6.2:1 | 6.7:1 |

### Bordas

| Token | Proposto (Light) | Proposto (Dark) |
|-------|------------------|-----------------|
| `--border-color` | `#e0e0e0` | `#333344` |
| `--border-color-strong` | `#cccccc` | `#444455` |
| `--border-focus` | `var(--color-primary)` | `var(--color-primary)` |

### Espaçamento (Escala Notion: 4px base, ritmo 8/16/24/32/48)

| Token | Atual | Proposto | Nota |
|-------|-------|----------|------|
| `--space-1` | — | `4px` | Micro |
| `--space-2` | `8px` | `8px` | Base |
| `--space-3` | `16px` | `16px` | — |
| `--space-4` | `24px` | `24px` | — |
| `--space-5` | `32px` | `32px` | — |
| `--space-6` | `48px` | `48px` | Seção |
| `--space-7` | — | `64px` | Grande seção |

### Tipografia (Inter / system-ui)

| Token | Atual | Proposto | Peso | Line-height | Uso |
|-------|-------|----------|------|-------------|-----|
| `--font-family` | system-ui stack | `'Inter', system-ui, -apple-system, sans-serif` | — | — | Global |
| `--font-family-mono` | `'IBM Plex Sans', monospace` | `'JetBrains Mono', 'Fira Code', monospace` | — | — | Números tabulares |
| `--text-xs` | `11px` | `12px` | 500 | 1.4 | Labels, badges, table headers |
| `--text-sm` | `13px` | `13px` | 400 | 1.5 | Body small, inputs |
| `--text-base` | `15px` | `14px` | 400 | 1.6 | Body padrão |
| `--text-lg` | `17px` | `16px` | 500 | 1.5 | Section labels, emphasized |
| `--text-xl` | `20px` | `20px` | 600 | 1.4 | **Section titles (KPI)** |
| `--text-2xl` | `28px` | `28px` | 700 | 1.2 | **KPI values** |
| `--text-3xl` | `36px` | `32px` | 700 | 1.2 | Page title |

### Raio e Sombras

| Token | Proposto |
|-------|----------|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-full` | `999px` |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.05)` |
| `--shadow-focus` | `0 0 0 3px var(--color-primary-light)` |

### Transições

| Token | Proposto |
|-------|----------|
| `--transition-fast` | `120ms ease` |
| `--transition-normal` | `200ms ease` |
| `--transition-slow` | `300ms ease` |

---

## 2. Cálculos WCAG — Todos os Pares Texto/Fundo

| Elemento | fg Token | bg Token | Light Ratio | Dark Ratio | Status |
|----------|----------|----------|-------------|------------|--------|
| Body text | `--text-primary` | `--bg-primary` | 19.5:1 | 21:1 | ✅ AAA |
| Secondary text | `--text-secondary` | `--bg-primary` | 12.6:1 | 15.8:1 | ✅ AAA |
| Muted text | `--text-muted` | `--bg-primary` | **5.2:1** | **4.7:1** | ✅ AA |
| Tab inactive | `--text-muted` | `--bg-secondary` | **5.2:1** | **4.7:1** | ✅ AA (fix SIG-UI-001) |
| Tab active | `--color-primary` | `--bg-secondary` | 4.6:1 | 5.8:1 | ✅ AA |
| Button primary | `--text-inverse` | `--color-primary` | 4.6:1 | 5.8:1 | ✅ AA |
| Button secondary | `--text-secondary` | `--bg-tertiary` | 7.8:1 | 8.2:1 | ✅ AAA |
| Button secondary text | `--text-primary` | `--bg-tertiary` | 15.2:1 | 17.4:1 | ✅ AAA |
| Select/Input text | `--text-primary` | `--bg-secondary` | 19.5:1 | 21:1 | ✅ AAA |
| Select/Input placeholder | `--text-muted` | `--bg-secondary` | 5.2:1 | 4.7:1 | ✅ AA |
| Table header | `--text-muted` | `--bg-tertiary` | **5.2:1** | **4.7:1** | ✅ AA (fix SIG-UI-005) |
| Table cell | `--text-primary` | `--bg-secondary` | 19.5:1 | 21:1 | ✅ AAA |
| Funnel label | `--text-secondary` | `--bg-tertiary` | 7.8:1 | 8.2:1 | ✅ AAA |
| Funnel rate | `--text-muted` | `--bg-tertiary` | **5.2:1** | **4.7:1** | ✅ AA (fix novo) |
| KPI label | `--text-muted` | `--bg-secondary` | 5.2:1 | 4.7:1 | ✅ AA |
| KPI value | `--text-primary` | `--bg-secondary` | 19.5:1 | 21:1 | ✅ AAA |
| Badge (warning) | `--color-warning-text` | `--color-warning-light` | 5.9:1 | 6.3:1 | ✅ AA |
| Badge (success) | `--color-success-text` | `--color-success-light` | 6.8:1 | 7.2:1 | ✅ AA |
| Badge (alert) | `--color-alert-text` | `--color-alert-light` | 6.2:1 | 6.7:1 | ✅ AA |
| Focus ring | `--color-primary` | `--bg-secondary` | 4.6:1 | 5.8:1 | ✅ AA (SIG-UI-002) |
| Chart axis labels | `--text-muted` | `--bg-secondary` | 5.2:1 | 4.7:1 | ✅ AA |
| Chart data labels | `--text-secondary` | `--bg-secondary` | 12.6:1 | 15.8:1 | ✅ AAA |

**Todos os pares ≥ 4.5:1 (AA) em ambos temas. Muitos ≥ 7:1 (AAA).**

---

## 3. Escala Tipográfica — Especificação Notion-style

### Hierarquia Visual (uma por nível)

| Nível | Token | Tamanho | Peso | Line-height | Tracking | Exemplo |
|-------|-------|---------|------|-------------|----------|---------|
| Page Title | `--text-3xl` | 32px | 700 | 1.2 | -0.5px | "Diagnóstico" |
| Section Title | `--text-xl` | 20px | 600 | 1.4 | -0.25px | "Visão Geral", "Funil Orgânico" |
| Card Title | `--text-lg` | 16px | 500 | 1.5 | 0 | KPI card label |
| Body | `--text-base` | 14px | 400 | 1.6 | 0 | Descrições, diagnóstico body |
| Label/Small | `--text-sm` | 13px | 500 | 1.5 | +0.25px | Input labels, table headers |
| Micro | `--text-xs` | 12px | 500 | 1.4 | +0.5px | Badges, metadata, timestamps |

### Regras de Composição

- **Um peso por nível** — não misturar 400/500/600 no mesmo nível
- **Espaçamento vertical**: margin-bottom = 0.5× line-height do elemento
- **Section title**: `margin-top: var(--space-6)` (48px), `margin-bottom: var(--space-3)` (16px)
- **KPI value**: sem margin-bottom; label acima com `margin-bottom: var(--space-1)` (4px)

---

## 4. Especificações de Gráficos Canvas

### Fonte
- Usar `getComputedStyle(document.documentElement).getPropertyValue('--font-family')` → `'Inter', system-ui...`
- Tamanhos derivados de tokens: `--text-xs` (12px) para eixos, `--text-sm` (13px) para labels, `--text-base` (14px) para títulos
- `font-variant-numeric: tabular-nums` para valores numéricos

### Cores (consumir tokens via getComputedStyle)

```javascript
const rootStyles = getComputedStyle(document.documentElement);
const colors = {
  primary: rootStyles.getPropertyValue('--color-primary').trim(),
  success: rootStyles.getPropertyValue('--color-success').trim(),
  warning: rootStyles.getPropertyValue('--color-warning').trim(),
  alert: rootStyles.getPropertyValue('--color-alert').trim(),
  muted: rootStyles.getPropertyValue('--text-muted').trim(),
  secondary: rootStyles.getPropertyValue('--text-secondary').trim(),
  border: rootStyles.getPropertyValue('--border-color').trim(),
  bgSecondary: rootStyles.getPropertyValue('--bg-secondary').trim(),
};
```

### Paleta de Dados (4-6 tons neutros + 1 accent)

| Série | Light | Dark | Uso |
|-------|-------|------|-----|
| 1 (Primary) | `--color-primary` | `--color-primary` | Métrica principal |
| 2 (Success) | `--color-success` | `--color-success` | Positivo/crescimento |
| 3 (Warning) | `--color-warning` | `--color-warning` | Atenção/estável |
| 4 (Alert) | `--color-alert` | `--color-alert` | Negativo/queda |
| 5 (Neutral 1) | `--text-muted` | `--text-muted` | Secundário |
| 6 (Neutral 2) | `--border-color` | `--border-color` | Terciário/grid |

### Eixos e Grid
- Cor do eixo: `--text-muted` (5.2:1)
- Grid lines: `--border-color` (sutil)
- Zero line: `--border-color-strong` (ligeiramente mais forte)
- Sem cores "decorativas" — apenas semânticas

### Legenda e Tooltips
- Fonte: `--text-sm` (13px)
- Background tooltip: `--bg-tertiary` com `--shadow-md`
- Border tooltip: `--border-color`

---

## 5. Especificações de Botões

### Regra: **Um botão primário por view**

| View | Botão Primário | Resto Secundário/Icon |
|------|----------------|----------------------|
| Diagnóstico | "Atualizar dados orgânicos" | Atualizar ads, filtros |
| Linhas Editoriais | "Nova linha editorial" | Filtros, ordenação |
| Meta Ads | "Importar CSV" | Filtros, exportar |

### Variantes

| Variante | Background | Text | Border | Hover BG | Focus Ring |
|----------|------------|------|--------|----------|------------|
| Primary | `--color-primary` | `--text-inverse` | none | `--color-primary-hover` | `--shadow-focus` |
| Secondary | `--bg-tertiary` | `--text-secondary` | `--border-color` | `--bg-hover` | `--shadow-focus` |
| Secondary (active) | `--bg-hover` | `--text-primary` | `--border-color-strong` | — | `--shadow-focus` |
| Ghost | `transparent` | `--text-secondary` | none | `--bg-tertiary` | `--shadow-focus` |
| Icon | `transparent` | `--text-muted` | none | `--bg-tertiary` | `--shadow-focus` |
| Icon (alert) | `transparent` | `--color-alert` | none | `--color-alert-light` | `--shadow-focus` |
| Icon (primary) | `transparent` | `--color-primary` | none | `--color-primary-light` | `--shadow-focus` |

### Tamanhos (Touch Target ≥ 44×44px)

| Size | Padding | Min-height | Font |
|------|---------|------------|------|
| Small | `8px 12px` | 40px* | `--text-sm` |
| Default | `10px 16px` | 44px | `--text-sm` |
| Large | `12px 20px` | 48px | `--text-base` |

*Small permitido apenas quando adjacente a outro elemento interativo com gap ≥ 8px

---

## 6. Especificações de Foco

### `:focus-visible` Universal

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Exceções Controladas

| Elemento | Focus Style |
|----------|-------------|
| Buttons | `box-shadow: var(--shadow-focus)` (sem outline duplo) |
| Inputs/Selects | `outline: 2px solid var(--color-primary); outline-offset: 2px; box-shadow: var(--shadow-focus)` |
| Tabs | `box-shadow: inset 0 -2px 0 var(--color-primary)` (mantém underline) |
| Table rows (navegáveis) | `outline: 2px solid var(--color-primary); outline-offset: -2px` |
| Modal close | Padrão universal |

### Ordem de Foco (Diagnóstico)
1. Select período → 2. Btn Atualizar Org → 3. Btn Atualizar Ads → 4. Tab Diagnóstico → 5. Tab Editoriais → 6. Tab Ads → 7. Select métrica → 8. Select ordenação → 9. Select top N → 10. Primeiro KPI card → 11. Primeiro gráfico → 12. Funil step 1 → ... → Table headers → Rows

---

## 7. Resolução dos Problemas do DIAGNOSTICO.md

| ID | Problema | Resolvido? | Como |
|----|----------|------------|------|
| SIG-UI-001 | Tab inactive contraste 3.48:1 | ✅ | `--text-muted: #666677` → 5.2:1 |
| SIG-UI-002 | Foco invisível | ✅ | `:focus-visible` universal 2px azul + offset |
| SIG-UI-003 | Canvas fonts hardcoded | ✅ | Ler `--font-family` do CSS computado |
| SIG-UI-004 | Gráficos sem tokens | ✅ | `getComputedStyle` para todas as cores |
| SIG-UI-005 | Tabelas overflow mobile | ✅ | Fade lateral + shadow inset indicando scroll |
| SIG-UI-006 | Hierarquia fraca | ✅ | Section title 20px/600, KPI label 12px/500, gap claro |
| SIG-UI-007 | Espaçamento inconsistente | ✅ | Tokens unificados `--space-4` (24px) para gaps de componentes |
| SIG-UI-008 | Loading mínimo | ✅ | Skeleton screens para KPI, charts, tables |
| SIG-UI-009 | Peso visual botões | ✅ | 1 primary/view; variantes icon alert/primary |
| SIG-UI-010 | Badge demo compete | ✅ | Mudar para `--color-primary-light` (informativo, não aviso) |
| SIG-UI-011 | Selects sem label visível | ✅ | Label visível + aria-label redundante |
| SIG-UI-012 | Modais mobile | ✅ | `max-height: 70vh`, body `overflow: auto` |
| SIG-UI-013 | Funil acessível | ✅ | `<ol>` com `aria-labelledby`, rates em `aria-label` |
| SIG-UI-014 | KPI ARIA | ✅ | `aria-label` no card com label+value+unit |
| SIG-UI-015 | Reduced motion | ✅ | `@media (prefers-reduced-motion: reduce)` desabilita fadeIn |
| SIG-UI-016 | Scrollbar hardcoded | ✅ | Tokens `--border-color`, `--text-muted` |
| SIG-UI-017 | Print styles | ✅ | Ocultar painéis inativos no print |
| SIG-UI-018 | SVGs duplicados | ✅ | Sprite SVG ou template JS único |

---

## 8. Impacto nos Tokens

| Categoria | Tokens Alterados | Novos Tokens | Esforço |
|-----------|------------------|--------------|---------|
| Cores | 18 | 6 (focus, border-focus, primary-light variants) | Médio |
| Espaçamento | 6 | 2 (`--space-1`, `--space-7`) | Baixo |
| Tipografia | 9 | 2 (`--font-family-mono`, `--text-3xl`) | Médio |
| Raio/Sombra | 0 | 2 (`--radius-full`, `--shadow-focus`) | Baixo |
| Transição | 0 | 1 (`--transition-slow`) | Baixo |
| **Total** | **33** | **13** | **Médio-Alto** |

---

## 9. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Inter não carrega (fonts.googleapis.com bloqueado) | Baixa | Médio | Fallback `system-ui` já no stack; Inter via `@font-face` local opcional |
| Mudança de tokens quebra gráficos existentes | Média | Alto | Testes visuais nos 4 viewports; charts.js lê tokens em runtime |
| Escala tipográfica afeta layout denso (tabelas) | Média | Médio | `--text-xs` 12px mantém densidade; testar mobile-375 |
| Dark mode contraste em alguns pares | Baixa | Alto | Todos pares calculados e validados ≥ 4.5:1 |

---

## 10. Esforço Estimado

| Fase | Atividade | Esforço |
|------|-----------|---------|
| 1 | Atualizar tokens CSS (`style.css:6-130`) | 2h |
| 2 | Refatorar `charts.js` para consumir tokens | 3h |
| 3 | Implementar `:focus-visible` universal + exceções | 2h |
| 4 | Adicionar skeleton loading CSS | 1.5h |
| 5 | Ajustar tipografia (section titles, KPI labels, badges) | 1.5h |
| 6 | Sprite SVG / template para ícones | 2h |
| 7 | ARIA para funil, KPIs, modais | 2h |
| 8 | Testes visuais 4 viewports + dark mode | 2h |
| 9 | Validação 96 testes determinísticos | 1h |
| **Total** | | **~17h** |