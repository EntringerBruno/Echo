# Content Signal

<p align="center">
  <img src="https://img.shields.io/badge/status-v1.0-blue" alt="Status">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/privacy-local--only-orange" alt="Privacy">
  <img src="https://img.shields.io/badge/stack-vanilla%20JS%20%2B%20CSS-blueviolet" alt="Stack">
</p>

Dashboard local, minimalista e profissional para análise de métricas de **conteúdo orgânico do Instagram** e **desempenho de anúncios do Meta Ads**.

Feito para criadores de conteúdo, pequenos negócios, mentores e consultores que vendem serviços, cursos ou atendimentos — e querem entender o que funciona sem depender de ferramentas externas, assinaturas ou compartilhamento de dados.

---

## Problema que resolve

| Ferramentas atuais | Content Signal |
|-------------------|----------------|
| Dados espalhados (Insights, Ads Manager, planilhas) | Uma única visão unificada |
| Métricas sem contexto (números soltos) | Taxas, funis, diagnósticos automáticos |
| Promessas de "viralização" e "crescimento garantido" | Análise honesta: dado medido, hipótese, ação |
| Dados na nuvem de terceiros | **100% local no seu navegador** |
| Interface poluída, "startup genérica" | Design sóbrio, analítico, focado em leitura |

---

## Público-alvo

- Criadores de conteúdo (Instagram/Reels)
- Pequenos negócios e infoprodutores
- Mentores, consultores, terapeutas, professores
- Perfis que vendem serviços, cursos, atendimentos
- Analistas de dados juniores para portfólio

---

## Funcionalidades

### 📊 Aba 1 — Diagnóstico
- **Visão geral**: KPIs principais (alcance, engajamento, funil, taxas)
- **Desempenho por formato**: Reels vs Carrosséis vs Fotos vs Stories (tabelas + gráficos)
- **Rankings filtráveis**: Top/piores 10 por alcance, visualizações, salvamentos, compartilhamentos, comentários, visitas, cliques, seguidores
- **Reels dedicados**: Visualizações, retenção (quando disponível), conversão, diagnóstico por Reel
- **Funil orgânico**: Alcance → Visitas perfil → Cliques link → DMs → Conversões (etapas manuais marcadas)
- **Diagnóstico automático**: Identifica gargalos (alcance, visitas, cliques, conversão), melhores formatos/temas, posts para repetir/ajustar/virar anúncio — **separando dado medido, não disponível, hipótese e ação**

### ✍️ Aba 2 — Linhas Editoriais
- **Gestão de linhas**: Criar/editar/excluir linhas (Descoberta, Autoridade, Prática, Bastidores, Oferta + personalizadas)
- **Visão por linha**: Métricas agregadas + temas principais + melhores/piores posts
- **Comparação visual**: Gráficos de alcance, salvamentos, compartilhamentos, visitas por linha
- **Temas dentro da linha**: Performance por tema + sugestão (manter/ajustar/reduzir/testar)
- **Priorização baseada em dados**: Quais linhas/temas/formatos merecem mais frequência, quais testar, quais virar série/anúncio
- **Biblioteca de ideias**: CRUD de ideias com linha, tema, formato, gancho, CTA, status, potencial para anúncio — filtros combinados

### 📈 Aba 3 — Meta Ads
- **Visão geral**: Investimento, CPM, CPC, CTR, Custo/conv, ROAS, frequência
- **Hierarquia navegável**: Campanhas → Conjuntos → Anúncios → Criativos (ordenável por investimento, CTR, CPC, conv, custo/conv, ROAS)
- **Análise de criativos**: Scatter plots (CTR vs Custo/conv, Investimento vs ROAS) + tabela com diagnóstico (alto CTR/cara, baixo CTR/caro, bom ROAS, etc.)
- **Funil pago**: Investimento → Impressões → Alcance → Cliques → Cliques link → Conversões → Receita (taxas em cada etapa)
- **Diagnóstico de anúncios**: Concentração de investimento, melhores CTR/custo/ROAS, anúncios para pausar/testar, campanhas sem resultado

### 📁 Importação CSV
- Dois botões: "Atualizar dados orgânicos" / "Atualizar dados de anúncios"
- Validação de colunas, prévia (10 linhas), avisos de colunas extras/valores inválidos
- **"Baixar modelo"** — templates prontos
- **"Restaurar demo"** — volta aos dados sintéticos
- **Zero servidor**: Leitura via File API, processamento em memória

---

## Como executar localmente

```bash
# Opção 1: Abrir direto no navegador (simples)
# Duplo clique em index.html

# Opção 2: Servidor local (recomendado para evitar CORS)
npx serve .
# ou
python -m http.server 8000
# ou
php -S localhost:8000
```

Acesse `http://localhost:8000` (ou abra `index.html` direto).

---

## Como importar seus dados

### Orgânico (Instagram Insights)
1. Meta Business Suite → Insights → Conteúdo → Exportar CSV
2. No dashboard: **"Atualizar dados orgânicos"** → selecione o CSV
3. O dashboard aceita colunas em português/inglês; veja `templates/organic-template.csv`

### Anúncios (Meta Ads)
1. Gerenciador de Anúncios → Relatórios → Criar relatório personalizado
2. Níveis: Campanha, Conjunto, Anúncio, Criativo
3. Métricas: Investimento, Impressões, Alcance, Cliques, Cliques no link, CTR, CPC, Conversões, Valor, Frequência
4. No dashboard: **"Atualizar dados de anúncios"** → selecione o CSV
5. Modelo em `templates/ads-template.csv`

> **Dica**: Deixe vazio (não zero) métricas que não tiver. O dashboard trata vazio como "não disponível".

---

## Estrutura do Projeto

```
content-signal/
├── index.html              # Dashboard principal (SPA)
├── assets/
│   ├── css/style.css       # Estilos (tema claro/escuro automático)
│   └── js/
│       ├── app.js          # Lógica principal (estado, render, modais, import)
│       ├── csv.js          # Parser/validador CSV
│       ├── metrics.js      # Cálculos: agregações, taxas, funis, diagnósticos
│       └── charts.js       # Gráficos em Canvas vanilla (sem deps)
├── data/
│   ├── sample-organic.csv  # 35 posts sintéticos (demo)
│   └── sample-ads.csv      # 28 linhas sintéticas (3 campanhas, demo)
├── templates/
│   ├── organic-template.csv
│   └── ads-template.csv
├── docs/
│   ├── README.md           # Este guia detalhado
│   ├── data-model.md       # Esquemas, tipos, regras de validação
│   ├── metrics.md          # Definição, fórmula, limitações de cada métrica
│   └── privacy.md          # Modelo de privacidade, .gitignore, futura API
├── .gitignore              # Bloqueia CSVs reais, segredos, node_modules
├── LICENSE                 # MIT
└── README.md               # Este arquivo
```

---

## Privacidade e Segurança

- **Dados nunca saem do seu navegador** — File API + JS puro
- **Nenhuma credencial solicitada** — sem OAuth, tokens, API keys
- **Nenhum recurso de terceiros** exceto Google Fonts (IBM Plex Sans)
- **`.gitignore` robusto** — impede commit acidental de exports reais
- **Documentação completa** em `docs/privacy.md`

---

## Limitações da v1

| Limitação | Detalhe |
|-----------|---------|
| Alcance/Impressões/Salvamentos/Compartilhamentos orgânicos | Não disponíveis via API pública; use exportação manual do Meta Business Suite |
| Stories | Métricas limitadas a 24h; exporte diariamente se quiser histórico |
| DMs / Conversões orgânicas | Não disponíveis via API; preencha manualmente no CSV se quiser no funil |
| Atribuição paga/orgânica | Só separada se CSV tiver coluna `pago_organico` |
| Alcance total ≠ soma dos reaches | Pessoas veem múltiplos posts; use alcance agregado da conta |
| Retenção de Reels | Não no CSV padrão; exporte de Insights → Reels → Retenção |
| Servidor/backend | Não há — roda 100% client-side |

---

## Roadmap Futuro (ideias)

- [ ] Exportação de relatório em PDF/Markdown
- [ ] Comparação de períodos (WoW, MoM)
- [ ] Detecção automática de outliers (posts anômalos)
- [ ] Integração opcional com Instagram Graph API (backend próprio, OAuth)
- [ ] Multi-conta / multi-perfil
- [ ] Temas customizados (cores, tipografia)
- [ ] PWA para uso offline

---

## Decisões de Design (Raciocínio de Analista)

1. **Vanilla JS + CSS** — Zero dependências, zero build, zero vulnerabilidades de supply chain, roda em qualquer navegador moderno, ideal para portfólio técnico.

2. **Canvas para gráficos** — Evita Chart.js (60KB+); implementação própria ~3KB, controle total de estilo, acessibilidade, tema escuro.

3. **CSV como contrato de dados** — Formato universal, versionável, auditável, não prende a vendor. Templates documentam o esquema.

4. **Null ≠ Zero** — Decisão crítica: métrica ausente não é zero. Evita taxas falsas e diagnósticos enganosos.

5. **Diagnóstico = Hipótese + Ação** — Não apresenta "verdades". Cada item separa: dado medido | não disponível | hipótese | ação. Honestidade analítica.

6. **Funil com etapas manuais marcadas** — DMs e conversões orgânicas não vêm da API. O dashboard mostra "manual" e só calcula taxa quando ambas as etapas têm dado.

7. **Separação paga/orgânico** — Não mistura. Abas separadas, CSVs separados, diagnósticos separados. Só une se o dado explícito permitir.

---

## Logbook — Melhoria de UI (ui/signal-pilot)

### 2026-11-15 — Lote 1: Tokens (Concluído)
- **Branch**: `ui/signal-pilot` (commit f9daeee)
- **Entregável**: `assets/css/style.css` — 33 tokens remapeados + 13 novos (Direction A: Notion princípios, Inter font)
- **Validação**: 3 abas × 4 viewports × 2 temas = 24 capturas + medições automatizadas (Playwright)
- **Resultados**:
  - Contraste: 0 falhas (eram 3 críticas: tab-inactive 3.48→5.63:1, funnel-rate 3.20→4.94:1, table-header 3.20→4.94:1)
  - Fontes <12px desktop: 0 (eram 124)
  - Touch targets <44px mobile: 4/42 (todos `<select>` nativos — limitação conhecida)
  - Testes: 96/96 passando
- **Próximo**: Lote 2 — Aplicar tokens em componentes (botões, tabs, inputs, selects, badges, modais)

---

## Licença

MIT — veja `LICENSE`. Livre para uso, modificação, distribuição, incluindo comercial.

---

## Autor

Desenvolvido como projeto de portfólio **AI Builder / Analista de Dados**.

---

<p align="center">
  <strong>Content Signal</strong> — Dados locais. Análise honesta. Decisões melhores.
</p>