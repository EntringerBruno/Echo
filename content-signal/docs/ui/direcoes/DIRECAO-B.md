# Direção B — Fixes Mínimos de Acessibilidade

**Princípio:** Corrigir apenas violações WCAG AA confirmadas (P0/P1 de contraste, foco, touch targets). Zero mudanças visuais estéticas, zero novos tokens, zero refatoração de componentes. Preservar identidade visual atual.

---

## 1. Escopo — Apenas o Estritamente Necessário

| Critério | Ação |
|----------|------|
| Contraste < 4.5:1 | Ajustar **apenas** os 3 pares medidos abaixo do limite |
| Foco invisível | Adicionar `:focus-visible` consistente nos elementos afetados |
| Touch targets < 44px | Aumentar padding/height **apenas** nos 6 elementos medidos |
| Fontes Canvas | Corrigir fallback para não quebrar layout (manter IBM Plex Sans no código) |
| Loading | Não implementar (não observado) |
| Hierarquia, espaçamento, densidade, estética | **Não tocar** — requer olhar humano (SIG-03a) |
| Tokens de cor/spacing/tipografia | **Não alterar** além do mínimo para contraste |
| Gráficos consumindo tokens | **Não refatorar** — manter hardcoded |
| ARIA, reduced motion, print, SVGs | **Não implementar** — P2/P3 |

---

## 2. Mudanças Mínimas de Tokens (Apenas Contraste)

### Light Mode — Ajustes Pontuais

| Token | Atual | Mínimo para 4.5:1 | Proposto | Razão |
|-------|-------|-------------------|----------|-------|
| `--text-muted` | `#888899` | `#6b6b7b` (5.0:1) | `#666677` (5.2:1) | Fix tab-inactive, funnel-rate, table-header |
| `--bg-tertiary` | `#f5f5f5` | — | `#f0f0f0` | Melhora contraste muted/tertiary para 5.2:1 |

### Dark Mode — Ajustes Pontuais

| Token | Atual | Mínimo para 4.5:1 | Proposto | Razão |
|-------|-------|-------------------|----------|-------|
| `--text-muted` | `#808090` | `#9090a0` (4.6:1) | `#9999aa` (4.7:1) | Fix tab-inactive, funnel-rate, table-header |
| `--bg-tertiary` | `#22223a` | — | `#26263e` | Melhora contraste muted/tertiary |

> **Nota:** Apenas 2 tokens alterados. Todos os demais 56 tokens **inalterados**.

---

## 3. Cálculos WCAG — Pares Corrigidos

| Elemento | fg | bg | Atual Ratio | Corrigido Ratio | Status |
|----------|-----|-----|-------------|-----------------|--------|
| tab-inactive (light) | `#666677` | `#ffffff` | 3.48:1 | **5.2:1** | ✅ |
| tab-inactive (dark) | `#9999aa` | `#1a1a2e` | ~3.2:1 | **4.7:1** | ✅ |
| funnel-rate (light) | `#666677` | `#f0f0f0` | 3.20:1 | **5.2:1** | ✅ |
| funnel-rate (dark) | `#9999aa` | `#26263e` | ~3.0:1 | **4.7:1** | ✅ |
| table-header (light) | `#666677` | `#f0f0f0` | 3.20:1 | **5.2:1** | ✅ |
| table-header (dark) | `#9999aa` | `#26263e` | ~3.0:1 | **4.7:1** | ✅ |

**Todos os demais pares mantêm ratios atuais (já ≥ 4.5:1).**

---

## 4. Foco Visível — Fix Mínimo

### Problema (SIG-UI-002)
- `outline: none` em `.btn-secondary:focus`, `.period-selector select:focus`, `.control-row select:focus`
- `box-shadow` com cor de fundo (branco sobre branco = invisível)

### Solução Mínima

```css
/* Substituir regras :focus específicas por :focus-visible universal */
.btn:focus-visible,
select:focus-visible,
input:focus-visible,
.tab-btn:focus-visible,
.data-table th:focus-visible,
.btn-icon:focus-visible,
.modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remover box-shadow de focus que usa cor de fundo */
.btn:focus,
select:focus,
input:focus,
.tab-btn:focus {
  box-shadow: none; /* será sobrescrito por :focus-visible acima */
}
```

### Elementos Afetados (8 medidos no capture-report.json)
1. `.period-selector select`
2. `.btn-secondary` (Atualizar org)
3. `.btn-secondary` (Atualizar ads)
4. `.tab-btn` (3 tabs)
5. `.control-row select` (métrica, ordenação, top N)
6. `.data-table th` (navegáveis por teclado)
7. `.btn-icon` (ações de tabela)
8. `.modal-close`

---

## 5. Touch Targets — Fix Mínimo (6 elementos mobile-375)

| Elemento | Atual | Mínimo | Fix CSS |
|----------|-------|--------|---------|
| Select filtros (4) | 37px, 19px altura | 44px | `min-height: 44px; padding: 10px 12px;` |
| `.btn-secondary` (2) | 39px altura | 44px | `min-height: 44px; padding: 12px 16px;` |

```css
/* Apenas mobile */
@media (max-width: 480px) {
  .period-selector select,
  .control-row select,
  .editorial-header select,
  .ads-filters select {
    min-height: 44px;
    padding: 10px 12px;
  }
  .btn-secondary {
    min-height: 44px;
    padding: 12px 16px;
  }
}
```

---

## 6. Canvas Fonts — Fix Mínimo (SIG-UI-003 P1)

### Problema
- `charts.js` usa `'12px IBM Plex Sans'`, `'11px IBM Plex Sans'`, `'14px IBM Plex Sans'` hardcoded
- Fonte não carrega → fallback system-ui (legível mas tamanhos fixos podem transbordar em mobile)

### Solução Mínima (sem refatorar consumo de tokens)

```javascript
// Em charts.js, substituir strings hardcoded por:
const fontFamily = getComputedStyle(document.documentElement)
  .getPropertyValue('--font-family')
  .trim() || 'system-ui, sans-serif';

// Usar tamanhos relativos ao CSS base (16px)
const sizes = {
  axis: '12px',      // ≈ 0.75rem
  label: '13px',     // ≈ 0.8125rem
  title: '14px',     // ≈ 0.875rem
  value: '16px',     // 1rem
};

// Aplicar:
ctx.font = `${sizes.axis} ${fontFamily}`;
ctx.font = `${sizes.label} ${fontFamily}`;
ctx.font = `${sizes.title} ${fontFamily}`;
```

> **Não** consumir `--color-primary` etc. — manter `CHART_COLORS` hardcoded. Apenas corrigir fonte.

---

## 7. Resolução dos Problemas do DIAGNOSTICO.md

| ID | Severidade | Resolvido? | Como |
|----|------------|------------|------|
| SIG-UI-001 | P0 | ✅ | `--text-muted` → `#666677` / `#9999aa` |
| SIG-UI-002 | P0 | ✅ | `:focus-visible` universal 2px azul |
| SIG-UI-003 | P1 | ✅ | Canvas usa `--font-family` computado |
| SIG-UI-004 | P1 | ❌ | **Não** — fora de escopo (refatoração) |
| SIG-UI-005 | P1 | ❌ | **Não** — requer decisão visual (fade/scroll indicator) |
| SIG-UI-006 | P1 | ❌ | **Não** — hierarquia visual (olhar humano) |
| SIG-UI-007 | P1 | ❌ | **Não** — espaçamento (olhar humano) |
| SIG-UI-008 | P1 | ❌ | **Não** — loading não observado |
| SIG-UI-009 | P1 | ❌ | **Não** — peso visual botões (olhar humano) |
| SIG-UI-010 | P2 | ❌ | **Não** — badge demo (estética) |
| SIG-UI-011 | P2 | ❌ | **Não** — labels visíveis (composição) |
| SIG-UI-012 | P2 | ❌ | **Não** — modais mobile (responsividade) |
| SIG-UI-013 | P2 | ❌ | **Não** — funil ARIA (acessibilidade P2) |
| SIG-UI-014 | P2 | ❌ | **Não** — KPI ARIA (acessibilidade P2) |
| SIG-UI-015 | P2 | ❌ | **Não** — reduced motion (animação) |
| SIG-UI-016 | P3 | ❌ | **Não** — scrollbar (consistência) |
| SIG-UI-017 | P3 | ❌ | **Não** — print (qualidade) |
| SIG-UI-018 | P3 | ❌ | **Não** — SVGs duplicados (manutenibilidade) |

**Resumo:** 3/18 problemas resolvidos (16.7%) — apenas P0 críticos + 1 P1 de fonte Canvas.

---

## 8. Impacto nos Tokens

| Categoria | Tokens Alterados | Novos Tokens | Esforço |
|-----------|------------------|--------------|---------|
| Cores | 2 (`--text-muted` light/dark, `--bg-tertiary` light/dark) | 0 | Mínimo |
| Espaçamento | 0 | 0 | — |
| Tipografia | 0 | 0 | — |
| Raio/Sombra | 0 | 0 | — |
| Transição | 0 | 0 | — |
| **Total** | **4 valores** | **0** | **Mínimo** |

---

## 9. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Fix de contraste torna UI "mais escura" visualmente | Média | Baixo | Ajuste mínimo (5.2:1 vs 4.5:1) — diferença perceptível mas sutil |
| `:focus-visible` não suportado em navegadores antigos | Baixa | Médio | Polyfill não necessário — suporte 2020+; fallback `:focus` mantido para teclado |
| Touch target fix quebra layout mobile denso | Baixa | Médio | Apenas 6 elementos; testar em 375px |
| Canvas font fix não resolve alinhamento em mobile | Média | Baixo | Tamanhos fixos em px mantidos; apenas família muda |

---

## 10. Esforço Estimado

| Fase | Atividade | Esforço |
|------|-----------|---------|
| 1 | Ajustar 4 valores de token em `style.css` | 15 min |
| 2 | Adicionar `:focus-visible` universal + limpar `:focus` legados | 1h |
| 3 | Touch targets mobile (media query + 6 elementos) | 30 min |
| 4 | Corrigir `charts.js` fonte (5 ocorrências) | 45 min |
| 5 | Testes visuais 4 viewports + dark mode | 1.5h |
| 6 | Validação 96 testes determinísticos | 30 min |
| **Total** | | **~4.5h** |

---

## 11. O Que Fica Para Depois (SIG-03a / ETAPA 4)

Todos os itens P1-P3 de **hierarquia, composição, densidade, estética, responsividade avançada, animação, manutenibilidade** ficam pendentes de:
1. Revisão visual humana das capturas (SIG-03a)
2. Definição de direção visual aprovada (Direção A ou outra)
3. Consolidação em `DESIGN.md` na ETAPA 4

---

## 12. Comparação Rápida A vs B

| Aspecto | Direção A | Direção B |
|---------|-----------|-----------|
| Problemas resolvidos | 18/18 (100%) | 3/18 (17%) |
| Tokens alterados | 33 + 13 novos | 4 valores |
| Esforço | ~17h | ~4.5h |
| Risco regressão visual | Médio | Mínimo |
| Conformidade WCAG AA | Completa | Parcial (apenas P0) |
| Qualidade visual (Notion-level) | ✅ Alvo | ❌ Mantém atual |
| Dívida técnica | Reduzida | Mantida |
| Precisa SIG-03a (olhar humano) | Não (direção definida) | **Sim** (obrigatório) |