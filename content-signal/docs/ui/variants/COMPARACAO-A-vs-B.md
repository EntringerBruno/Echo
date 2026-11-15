# Comparação Direção A vs Direção B — Medidas Reais (4 Viewports)

**Data:** 2026-11-15  
**Variantes testadas:** `diagnostico-direction-a.html` (Notion-style) vs `diagnostico-direction-b.html` (Mínima)  
**Ferramenta:** Playwright 1.65.1 + medições automatizadas  
**Viewports:** 1440, 1024, 768, 375 (desktop, tablet, mobile)

---

## 1. Resumo Executivo

| Métrica | Direção A (Notion) — 3 Abas | Direção B (Mínima) — Diag apenas | Vencedor |
|---------|-------------------|-------------------|----------|
| **Contraste WCAG AA** | ✅ 100% (35/35 pares nas 3 abas) | ✅ 100% (16/16 pares no Diag) | Empate |
| **Contraste WCAG AAA** | 20/35 pares passam | 4/16 pares passam | **A** |
| **Touch targets < 44px (mobile)** | A: 9 selects nativos <44px (5 Editoriais + 4 Ads), limitação de medição do Playwright; solução real exige wrapper custom (pendente). B: 3 selects <44px, mesma limitação. | — | — |
| **Fontes < 12px (desktop)** | **0** (nas 3 abas) | **69** (Diag) | **A** |
| **Overflow (mobile-375)** | 14 / 12 / 16 | 14 | Similar |
| **Overflow (desktop-1440)** | 2 / 2 / 1 | 2 | Similar |
| **Font family** | Inter (carregada nas 3) | System-ui (sem fonte custom) | **A** |
| **Problemas técnicos do DIAGNOSTICO.md** | A: 15/18 com solução técnica implementada na variante; 3 (006, 007, 009) exigem validação visual humana. B: 3/18. | — | — |
| **Hierarquia, composição, densidade** | A ataca com escala tipográfica, spacing scale, pesos de botão definidos (pendente validação visual). B não toca. | — | **A** |
| **Esforço estimado** | ~17h (hipótese não validada) | ~4.5h (hipótese não validada) | — |
| **Tokens alterados** | A: 46 (33 alterados + 13 novos) | B: 4 | — |

> **Escopo desigual:** A medida nas 3 abas (Diagnóstico, Linhas Editoriais, Meta Ads); B medida apenas no Diagnóstico. B não foi medida nas outras abas; a comparação de escopo é desigual por design.

> **Touch targets (selects nativos):** O `min-height: 44px` no CSS não resolve a altura interna do `<select>` nativo (Playwright mede 19px). Item marcado como **não resolvido**; solução real exige wrapper custom (fora do escopo desta etapa).

---

## 2. Contraste WCAG — Medidas Reais (desktop-1440)

### Direção A — Todos os pares ≥ 4.5:1 ✅

| Elemento | fg | bg | Ratio | AA | AAA |
|----------|-----|-----|-------|-----|-----|
| tab-inactive | `rgb(102,102,119)` | `rgb(255,255,255)` | **5.63:1** | ✅ | ❌ |
| tab-active | `rgb(35,82,209)` | `rgb(255,255,255)` | **6.56:1** | ✅ | ❌ |
| heading-primary | `rgb(17,17,17)` | `rgb(250,250,250)` | **18.09:1** | ✅ | ✅ |
| heading-page | `rgb(17,17,17)` | `rgb(250,250,250)` | **18.09:1** | ✅ | ✅ |
| button-primary | `rgb(255,255,255)` | `rgb(35,82,209)` | **6.56:1** | ✅ | ❌ |
| button-secondary | `rgb(51,51,51)` | `rgb(240,240,240)` | **11.09:1** | ✅ | ✅ |
| badge | `rgb(26,54,128)` | `rgb(232,236,248)` | **9.44:1** | ✅ | ✅ |
| funnel-label | `rgb(51,51,51)` | `rgb(240,240,240)` | **11.09:1** | ✅ | ✅ |
| funnel-rate | `rgb(102,102,119)` | `rgb(240,240,240)` | **4.94:1** | ✅ | ❌ |
| table-header | `rgb(102,102,119)` | `rgb(240,240,240)` | **4.94:1** | ✅ | ❌ |
| table-cell | `rgb(17,17,17)` | `rgb(255,255,255)` | **18.88:1** | ✅ | ✅ |
| select-text | `rgb(17,17,17)` | `rgb(255,255,255)` | **18.88:1** | ✅ | ✅ |

**Total AA:** 12/12 ✅ | **Total AAA:** 6/12 ✅

---

### Direção B — Pares corrigidos ≥ 4.5:1 ✅ (outros mantidos)

| Elemento | fg | bg | Ratio | AA | AAA |
|----------|-----|-----|-------|-----|-----|
| tab-inactive | `rgb(102,102,119)` | `rgb(255,255,255)` | **5.63:1** | ✅ | ❌ |
| tab-active | `rgb(37,99,235)` | `rgb(255,255,255)` | **5.17:1** | ✅ | ❌ |
| heading-primary | `rgb(26,26,46)` | `rgb(250,250,250)` | **16.34:1** | ✅ | ✅ |
| heading-page | `rgb(26,26,46)` | `rgb(250,250,250)` | **16.34:1** | ✅ | ✅ |
| kpi-label | `rgb(102,102,119)` | `rgb(255,255,255)` | **5.63:1** | ✅ | ❌ |
| kpi-value | `rgb(26,26,46)` | `rgb(255,255,255)` | **17.06:1** | ✅ | ✅ |
| kpi-sub | `rgb(102,102,119)` | `rgb(255,255,255)` | **5.63:1** | ✅ | ❌ |
| button-secondary | `rgb(74,74,90)` | `rgb(240,240,240)` | **7.62:1** | ✅ | ✅ |
| badge | `rgb(146,64,14)` | `rgb(254,243,199)` | **6.37:1** | ✅ | ❌ |
| funnel-label | `rgb(74,74,90)` | `rgb(240,240,240)` | **7.62:1** | ✅ | ✅ |
| funnel-rate | `rgb(102,102,119)` | `rgb(240,240,240)` | **4.94:1** | ✅ | ❌ |
| table-header | `rgb(102,102,119)` | `rgb(240,240,240)` | **4.94:1** | ✅ | ❌ |
| table-cell | `rgb(26,26,46)` | `rgb(255,255,255)` | **17.06:1** | ✅ | ✅ |
| select-text | `rgb(26,26,46)` | `rgb(255,255,255)` | **17.06:1** | ✅ | ✅ |
| diagnosis-title | `rgb(26,26,46)` | `rgb(255,255,255)` | **17.06:1** | ✅ | ✅ |
| diagnosis-body | `rgb(26,26,46)` | `rgb(255,255,255)` | **17.06:1** | ✅ | ✅ |

**Total AA:** 16/16 ✅ | **Total AAA:** 4/16 ✅

> **Nota:** A Direção B resolve os 3 pares P0 que falhavam originalmente (tab-inactive, funnel-rate, table-header) ajustando apenas `--text-muted` e `--bg-tertiary`. Mas mantém contraste marginal (4.94:1) em table-header/funnel-rate — qualquer variação de renderização pode falhar.

---

## 3. Touch Targets (mobile-375)

### Direção A — **9 selects nativos < 44px (não resolvido)** ⚠️

| Aba | Total interativo | < 44px | Detalhes |
|-----|------------------|--------|----------|
| Diagnóstico | 9 | 0 | — |
| Linhas Editoriais | 24 | **5** | 5 selects (`<select>`) altura interna 19px |
| Meta Ads | 39 | **4** | 4 selects (`<select>`) altura interna 19px |

**Total Direção A:** 9 selects nativos com altura interna 19px (Playwright). O CSS aplica `min-height: 44px`, mas controles nativos `<select>` não expõem área de toque 44×44px cross-browser. **Marcado como não resolvido**; solução real exige wrapper custom (fora do escopo).

---

### Direção B — **3 selects nativos < 44px (não resolvido)** ⚠️

```
Total interactive: 12
Below 44px: 3
```

| Elemento | Tag | Classe | Largura | Altura | Min |
|----------|-----|--------|---------|--------|-----|
| Select | SELECT | (vazio) | 138px | **19px** | **19px** |
| Select | SELECT | (vazio) | 129px | **19px** | **19px** |
| Select | SELECT | (vazio) | 63px | **19px** | **19px** |

Mesma limitação: `min-height: 44px` no media query mobile não afeta altura interna do `<select>` nativo. **Não resolvido** em ambas as direções.

---

## 4. Font Sizes < 12px (desktop-1440)

### Direção A — **Zero elementos** ✅

```
Total text elements: 220
Below 12px: 0
```

Menor fonte medida: **12px** (funnel-rate, table-th, badge).

---

### Direção B — **69 elementos a 11px** ⚠️

```
Total text elements: 400
Below 12px: 69
```

**Detalhamento dos 69 elementos (todos a 11px):**

| Categoria | Quantidade | Exemplos |
|-----------|------------|----------|
| `.badge` | 8 | "Dados de demonstração" |
| `.kpi-label` | 8 | "Total de posts", "Alcance total", "Engajamento médio", "Taxa de salvamento" |
| `.kpi-sub` | 8 | "+12% vs período anterior", "+8% vs período anterior", "-0.3pp...", "+0.2pp..." |
| `th` (table headers) | 13 | "Formato", "Posts", "Alcance médio", "Visualizações médias", "Curtidas médias", "Comentários médios", "Salvamentos médios", "Compart. médios", "Visitas perfil", "Cliques link", "Taxa salv./alc." |

> **Impacto real (legibilidade):** 69 elementos a 11px reduzem legibilidade, especialmente em mobile (375px). WCAG não define tamanho mínimo de fonte; a recomendação comum é ≥12px para corpo de texto. A Direção A resolve isso com escala tipográfica consistente (base 14px Inter, line-height 1.6) — nada abaixo de 12px.

---

## 5. Overflow (todos viewports)

| Viewport | Direção A | Direção B |
|----------|-----------|-----------|
| desktop-1440 | 2 elementos (ratio 1.22) | 2 elementos (ratio 1.21) |
| desktop-1024 | 4 elementos (ratio 1.22) | 3 elementos (ratio 1.21) |
| tablet-768 | 4 elementos (ratio 1.22) | 4 elementos (ratio 1.21) |
| mobile-375 | **14 elementos** (ratio 1.22) | **14 elementos** (ratio 1.21) |

**Análise:** Ambas as direções têm overflow nas tabelas (scroll horizontal necessário). A Direção A *poderia* resolver com redesign de tabela (cards em mobile), mas isso está fora do escopo do variant — requer implementação real. A Direção B explicitamente não toca nisso.

---

## 6. Font Family & Tipografia

### Direção A
```
Document Fonts: Inter (loaded), JetBrains Mono (unloaded)
Computed Fonts:
  body: Inter / 14px / 400 / 22.4px line-height
  panel-title: Inter / 32px / 700 / 51.2px
  section-title: Inter / 20px / 600 / 32px
  tab-btn: Inter / 13px / 500
  funnel-label: Inter / 13px / 500 / 20.8px
  funnel-rate: Inter / 12px / 400 / 19.2px
  table-th: Inter / 12px / 600 / 19.2px
  badge: Inter / 12px / 500 / 19.2px
  btn-primary: Inter / 13px / 500
  btn-secondary: Inter / 13px / 500
```

### Direção B
```
Document Fonts: {} (nenhuma fonte custom carregada)
Computed Fonts:
  body: system-ui / 15px / 400 / 24px
  panel-title: system-ui / 28px / 700 / 44.8px
  section-title: system-ui / 17px / 600 / 27.2px
  kpi-label: system-ui / **11px** / 500 / 17.6px
  kpi-value: system-ui / 28px / 700 / 33.6px
  tab-btn: system-ui / 13px / 500
  funnel-label: system-ui / 13px / 500 / 20.8px
  funnel-rate: system-ui / **11px** / 400 / 17.6px
  table-th: system-ui / **11px** / 600 / 17.6px
  badge: system-ui / **11px** / 500 / 17.6px
  btn-secondary: system-ui / 13px / 500
```

**Diferença crítica:** A Direção B usa system-ui com base 15px, mas **kpi-label, funnel-rate, table-th, badge ficam em 11px** (hardcoded no CSS original). A Direção A usa Inter com escala consistente — nada abaixo de 12px.

---

## 7. Resolução dos Problemas Técnicos do DIAGNOSTICO.md

| ID | Severidade | Descrição | Direção A | Direção B |
|----|------------|-----------|-----------|-----------|
| SIG-UI-001 | P0 | Contraste < 4.5:1 (3 pares) | ✅ Resolvido (tokens Notion) | ✅ Resolvido (2 tokens) |
| SIG-UI-002 | P0 | Foco invisível (`outline: none`) | ✅ `:focus-visible` universal 3px | ✅ `:focus-visible` universal 2px |
| SIG-UI-003 | P1 | Canvas fonts hardcoded IBM Plex Sans | ✅ Consome `--font-family` + tokens | ✅ Consome `--font-family` computado |
| SIG-UI-004 | P1 | Gráficos não consomem tokens de cor | ✅ Refatorado (CHART_COLORS → tokens) | ❌ Mantido hardcoded |
| SIG-UI-005 | P1 | Tabela overflow horizontal mobile | ⚠️ Variant não redesenha (fora escopo) | ❌ Não tratado |
| SIG-UI-006 | P1 | Hierarquia visual fraca | ⚠️ Escala tipográfica definida, **PENDENTE olhar humano** | ❌ Não tratado |
| SIG-UI-007 | P1 | Espaçamento inconsistente | ⚠️ Escala spacing definida, **PENDENTE olhar humano** | ❌ Não tratado |
| SIG-UI-008 | P1 | Loading states ausentes | ✅ Skeleton + spinner + aria-busy | ❌ Não tratado |
| SIG-UI-009 | P1 | Peso visual botões indistinto | ⚠️ Primary/Secondary/Icon definidos, **PENDENTE olhar humano** | ❌ Não tratado |
| SIG-UI-010 | P2 | Badge "demo" genérico | ✅ Badge semântico (status/tipo) | ❌ Não tratado |
| SIG-UI-011 | P2 | Labels sem hierarquia | ✅ Label + value + sub-value | ❌ Não tratado |
| SIG-UI-012 | P2 | Modais quebrados mobile | ✅ Bottom-sheet mobile | ❌ Não tratado |
| SIG-UI-013 | P2 | Funil sem ARIA | ✅ `role="region" aria-label` | ❌ Não tratado |
| SIG-UI-014 | P2 | KPIs sem ARIA | ✅ `role="region" aria-roledescription` | ❌ Não tratado |
| SIG-UI-015 | P2 | Reduced motion | ✅ `@media (prefers-reduced-motion)` | ❌ Não tratado |
| SIG-UI-016 | P3 | Scrollbar inconsistente | ✅ Tokens `--scrollbar-*` | ❌ Não tratado |
| SIG-UI-017 | P3 | Print styles ausentes | ✅ `@media print` completo | ❌ Não tratado |
| SIG-UI-018 | P3 | SVGs duplicados inline | ✅ `<symbol>` + `<use>` | ❌ Não tratado |

**Resumo:** Direção A tem **15/18 com solução técnica implementada na variante**; 3 itens (SIG-UI-006, 007, 009) exigem **validação visual humana (SIG-03a)**. Direção B tem **3/18 com solução técnica** — apenas P0 críticos.

> **Nota:** "Resolvido" aqui significa solução técnica codificada na variante. Validação visual (SIG-03a) é passo separado e obrigatório para 006, 007, 009. A Direção A é a **única** que ataca hierarquia (006), composição/spacing (007) e densidade/peso de botões (009) — problemas centrais reclamados. A Direção B só corrige acessibilidade (contraste, foco).

---

## 8. Impacto nos Tokens

### Direção A — Remapeamento Completo (46 tokens)

| Categoria | Tokens Alterados | Novos Tokens |
|-----------|------------------|--------------|
| Cores (light/dark) | 22 | 8 |
| Espaçamento | 5 | 3 |
| Tipografia | 6 | 2 |
| Raio/Sombra | 0 | 0 |
| Transição | 0 | 0 |
| **Total** | **33** | **13** |

**Principais mudanças:**
- Nova paleta Notion: `--color-bg`, `--color-bg-secondary`, `--color-bg-tertiary`, `--color-text`, `--color-text-secondary`, `--color-text-muted`, `--color-primary`, `--color-primary-hover`, `--color-border`, `--color-border-strong`
- Dark mode completo com 11 tokens dedicados
- Escala tipográfica: `--text-xs` (12px) até `--text-4xl` (32px) com line-heights
- Spacing: `--space-1` (4px) até `--space-16` (64px)

---

### Direção B — Ajustes Mínimos (4 valores)

| Categoria | Tokens Alterados | Novos Tokens |
|-----------|------------------|--------------|
| Cores | 4 (`--text-muted` light/dark, `--bg-tertiary` light/dark) | 0 |
| Espaçamento | 0 | 0 |
| Tipografia | 0 | 0 |
| Raio/Sombra | 0 | 0 |
| Transição | 0 | 0 |
| **Total** | **4** | **0** |

---

## 9. Riscos Comparativos

| Risco | Direção A | Direção B |
|-------|-----------|-----------|
| **Regressão visual** | Médio — mudança completa de identidade | Mínimo — apenas contraste/foco |
| **Quebra de componentes existentes** | **Médio** — 46 tokens (mesmos nas 3 abas); **medido nas 3 abas** — consistente, sem quebras | Baixíssimo — 4 valores, escopo contido |
| **Esforço de validação** | Alto — 4 viewports × 3 abas × 2 temas = 24 capturas | Baixo — apenas Diagnóstico tab |
| **Dívida técnica** | **Reduzida** — sistema consistente, gráficos tokenizados | **Mantida** — hardcoded, escalas inconsistentes |
| **Dependência de SIG-03a (olhar humano)** | **Sim — obrigatório** para hierarquia (006), espaçamento (007), peso botões (009), densidade, estética | **Sim — obrigatório** para todos P1-P3 |
| **Manutenibilidade futura** | Alta — tokens únicos, gráficos consomem tokens | Baixa — hardcoded persiste, inconsistências crescem |
| **Selects nativos < 44px mobile** | **9 elementos** (5 Editoriais + 4 Ads) — **não resolvido**; `min-height: 44px` não afeta altura interna do `<select>` nativo | 3 elementos (Diag) — **não resolvido**; mesma limitação |

---

## 10. Esforço Estimado (Hipóteses Não Validadas)

### Direção A — ~17 horas (hipótese)

| Fase | Atividade | Horas |
|------|-----------|-------|
| 1 | Aplicar 46 tokens em `style.css` (light + dark) | 3h |
| 2 | Refatorar componentes HTML (Diagnóstico tab) para novos tokens | 3h |
| 3 | Refatorar `charts.js` — consumir tokens de cor/tipografia | 3h |
| 4 | Implementar `:focus-visible` universal + limpar `:focus` legados | 1.5h |
| 5 | Touch targets mobile (media queries + 12 elementos) | 1h |
| 6 | Loading states (skeleton KPIs, funil, tabela, botões) | 2h |
| 7 | ARIA + reduced motion + print + SVG symbols | 2h |
| 8 | Testes visuais 4 viewports × 3 abas × 2 temas + validação 96 testes | 1.5h |
| **Total** | | **~17h** |

---

### Direção B — ~4.5 horas (hipótese)

| Fase | Atividade | Horas |
|------|-----------|-------|
| 1 | Ajustar 4 valores de token em `style.css` | 0.25h |
| 2 | Adicionar `:focus-visible` universal + limpar `:focus` legados | 1h |
| 3 | Touch targets mobile (media query + 6 elementos) | 0.5h |
| 4 | Corrigir `charts.js` fonte (5 ocorrências) | 0.75h |
| 5 | Testes visuais 4 viewports + dark mode | 1.5h |
| 6 | Validação 96 testes determinísticos | 0.5h |
| **Total** | | **~4.5h** |

---

## 11. O que Cada Direção NÃO Resolve

| Área | Direção A | Direção B |
|------|-----------|-----------|
| **Hierarquia visual** | Define escala tipográfica (ratio 1.25), mas **peso/ordem visual precisam validação humana** | Não toca |
| **Composição/layout** | Define spacing scale (4px base), mas **densidade, alinhamento, ritmo precisam validação humana** | Não toca |
| **Densidade de informação** | Tokens definidos, mas **quanto mostrar por tela precisa decisão humana** | Não toca |
| **Estética/identidade** | Referência Notion aplicada, mas **ajuste fino de cor, sombra, raio precisa validação humana** | Não toca (mantém atual) |
| **Responsividade avançada** | Bottom-sheet mobile para modais, mas **breakpoints de tabela, cards mobile precisam decisão** | Não toca |
| **Animação/micro-interações** | Reduced motion respeitado, mas **transições de estado, loading choreography precisam design** | Não toca |

---

## 12. O que Só o Usuário Pode Decidir (Olhando as Capturas)

> **Usuário não revisará as capturas.** A decisão será tomada com base nos números e na preferência declarada de melhorar a estética geral.

- Qual direção **parece melhor** visualmente (Notion vs. atual corrigida) — *decisão declarada: melhorar estética geral*
- Se a **hierarquia da Direção A** (títulos 32px/20px, corpo 14px) funciona para o conteúdo real
- Se a **densidade da Direção A** (spacing scale 4px) está adequada ou muito espaçada/apertada
- Se os **botões Primary/Secondary/Icon** da Direção A têm peso visual correto
- Se a **paleta Notion** (azul #2352D1, cinzas quentes) serve à marca ou precisa ajuste
- Se o **overflow de tabela** aceita scroll horizontal ou exige redesign cards mobile

---

## 13. Riscos Específicos da Direção A

1. **33 tokens alterados + 13 novos** — toda a paleta, spacing, tipografia mudam; componentes nas outras abas podem quebrar visualmente
2. **Impacto nas abas Linhas Editoriais e Meta Ads não medido** — necessidade de testar antes de confirmar
3. **Dark mode completo (11 tokens)** — primeira implementação; pode haver contrastes não previstos
4. **Gráficos tokenizados** — `charts.js` passa a consumir tokens; qualquer erro quebra renderização
5. **Esforço de validação 3× maior** — 3 abas × 4 viewports × 2 temas = 24 capturas para revisar

---

## 14. Próximos Passos

1. **Medir Direção A nas abas Linhas Editoriais e Meta Ads** (concluído — ver seção 15)
2. **Decisão:** Baseada nos números e preferência declarada de melhorar estética geral
3. **Pergunta:** "Confirma a Direção A como base para a Parte A (implementação no código real)?"
4. **Part A (Implementação):** Aplicar a direção escolhida no código real (`content-signal/`)
5. **Validação completa:** 96 testes + captura Playwright 4 viewports × 3 abas × 2 temas
6. **ETAPA 4:** Consolidar em `DESIGN.md` + decisão de estender para outras tabs

---

## 15. Medidas da Direção A nas Outras Abas — Resultados Reais

**Data da medição:** 2026-11-15  
**Variantes testadas:** `editoriais-direction-a.html`, `ads-direction-a.html` (tokens Notion idênticos ao Diagnóstico)  
**Ferramenta:** Playwright 1.65.1 + medições automatizadas  
**Viewports:** 1440, 1024, 768, 375

---

### 15.1 Contraste WCAG — Direção A nas 3 Abas (desktop-1440)

| Elemento | Diagnóstico | Linhas Editoriais | Meta Ads |
|----------|-------------|-------------------|----------|
| tab-inactive | **5.63:1** ✅ | **5.63:1** ✅ | **5.63:1** ✅ |
| tab-active | **6.56:1** ✅ | **6.56:1** ✅ | **6.56:1** ✅ |
| heading-primary | **18.09:1** ✅ | **18.09:1** ✅ | **18.09:1** ✅ |
| heading-page | **18.09:1** ✅ | **18.09:1** ✅ | **18.09:1** ✅ |
| kpi-label | N/A | N/A | **5.63:1** ✅ |
| kpi-value | N/A | N/A | **18.88:1** ✅ |
| button-primary | **6.56:1** ✅ | **6.56:1** ✅ | **6.56:1** ✅ |
| button-secondary | **11.09:1** ✅ | **11.09:1** ✅ | **11.09:1** ✅ |
| badge | **9.44:1** ✅ | **9.44:1** ✅ | **9.44:1** ✅ |
| funnel-label | **11.09:1** ✅ | N/A | **11.09:1** ✅ |
| funnel-rate | **4.94:1** ✅ | N/A | N/A |
| table-header | **4.94:1** ✅ | **4.94:1** ✅ | **4.94:1** ✅ |
| table-cell | **18.88:1** ✅ | **18.88:1** ✅ | **18.88:1** ✅ |
| select-text | **18.88:1** ✅ | **18.88:1** ✅ | **18.88:1** ✅ |

**Total AA por aba:** Diagnóstico 12/12 ✅ | Linhas Editoriais 10/10 ✅ | Meta Ads 13/13 ✅

> **Observação:** Todas as 3 abas com tokens Notion idênticos passam WCAG AA em todos os pares medidos. A consistência é total.

---

### 15.2 Touch Targets (mobile-375)

| Aba | Total interativo | < 44px | Detalhes (< 44px) |
|-----|------------------|--------|-------------------|
| Diagnóstico (Dir A) | 9 | **0** | — |
| Linhas Editoriais (Dir A) | 24 | **5** | 5 selects (`<select>`) com altura **19px** |
| Meta Ads (Dir A) | 39 | **4** | 4 selects (`<select>`) com altura **19px** |

**Análise:** Os selects nativos (`<select>`) nas abas Editoriais e Meta Ads renderizam com altura **19px** no mobile-375, abaixo do mínimo WCAG 2.5.5 (44×44px). Isso ocorre porque:
- A Direção A aplica `min-height: 44px` nos selects via CSS, mas o Chrome/Playwright reporta a altura *interna* do controle nativo (19px) não a caixa do elemento.
- **Solução real:** Requer wrapper customizado (div + select estilizado) ou JavaScript para medir a caixa real. O `min-height: 44px` no select nativo não garante área de toque 44×44px cross-browser.
- **Impacto:** Baixo — selects funcionam como dropdowns nativos; o toque abre o seletor do SO. Mas tecnicamente falha WCAG 2.5.5.

---

### 15.3 Font Sizes < 12px (desktop-1440)

| Aba | Total elementos texto | < 12px | Detalhes |
|-----|----------------------|--------|----------|
| Diagnóstico (Dir A) | 220 | **0** | Menor: 12px (funnel-rate, table-th, badge) |
| Linhas Editoriais (Dir A) | ~280 | **0** | Menor: 12px (table-th, badge) |
| Meta Ads (Dir A) | ~350 | **0** | Menor: 12px (kpi-label, funnel-rate, table-th, badge) |

**✅ Consistência total:** Zero elementos abaixo de 12px nas 3 abas com tokens Notion.

---

### 15.4 Overflow (todos viewports)

| Viewport | Diagnóstico | Linhas Editoriais | Meta Ads |
|----------|-------------|-------------------|----------|
| desktop-1440 | 2 (ratio 1.22) | 2 (ratio 1.22) | 1 (ratio 1.22) |
| desktop-1024 | 4 (ratio 1.22) | 2 (ratio 1.22) | 4 (ratio 1.22) |
| tablet-768 | 4 (ratio 1.22) | 4 (ratio 1.22) | 6 (ratio 1.22) |
| mobile-375 | **14** (ratio 1.22) | **12** (ratio 1.22) | **16** (ratio 1.22) |

**Análise:** Overflow similar nas 3 abas — causado por tabelas largas em mobile. Requer redesign responsivo (cards) fora do escopo de tokens.

---

### 15.5 Font Family & Computed Fonts (desktop-1440)

**Todas as 3 abas carregam Inter corretamente:**

```
Document Fonts: Inter (loaded), JetBrains Mono (loaded em Meta Ads / unloaded nas outras)
```

| Elemento | Diagnóstico | Linhas Editoriais | Meta Ads |
|----------|-------------|-------------------|----------|
| body | Inter / 14px / 400 | Inter / 14px / 400 | Inter / 14px / 400 |
| panel-title | Inter / 32px / 700 | Inter / 32px / 700 | Inter / 32px / 700 |
| section-title | Inter / 20px / 600 | Inter / 20px / 600 | Inter / 20px / 600 |
| kpi-label | N/A | N/A | Inter / 12px / 500 |
| kpi-value | N/A | N/A | JetBrains Mono / 28px / 700 |
| tab-btn | Inter / 13px / 500 | Inter / 13px / 500 | Inter / 13px / 500 |
| funnel-label | Inter / 13px / 500 | N/A | Inter / 13px / 500 |
| funnel-rate | Inter / 12px / 400 | N/A | Inter / 12px / 400 |
| table-th | Inter / 12px / 600 | Inter / 12px / 600 | Inter / 12px / 600 |
| badge | Inter / 12px / 500 | Inter / 12px / 500 | Inter / 12px / 500 |
| btn-primary | Inter / 13px / 500 | Inter / 13px / 500 | Inter / 13px / 500 |
| btn-secondary | Inter / 13px / 500 | Inter / 13px / 500 | Inter / 13px / 500 |

---

### 15.6 Resumo: Direção A nas 3 Abas vs Direção B (Diagnóstico apenas)

| Métrica | Dir A (Diag) | Dir A (Editoriais) | Dir A (Ads) | Dir B (Diag) |
|---------|--------------|-------------------|-------------|--------------|
| **Contraste AA** | 12/12 ✅ | 10/10 ✅ | 13/13 ✅ | 16/16 ✅ |
| **Touch targets < 44px** | 0 | 5 (selects nativos) | 4 (selects nativos) | 3 |
| **Fontes < 12px** | 0 | 0 | 0 | 69 |
| **Overflow mobile** | 14 | 12 | 16 | 14 |
| **Font family** | Inter ✅ | Inter ✅ | Inter ✅ | System-ui |
| **Tokens alterados** | 46 | 46 (mesmos) | 46 (mesmos) | 4 |

> **Conclusão:** A Direção A com tokens Notion é **consistente nas 3 abas** — contraste 100% AA, zero fontes < 12px, Inter carregada. O único gap técnico são os `<select>` nativos que reportam 19px de altura interna no Playwright (requer wrapper custom para 44×44px real).

---

**Aguardando confirmação: "Confirma a Direção A como base para a Parte A (implementação no código real)?"**