# Métricas e Limitações — Content Signal

## Métricas Orgânicas

### Alcance (Reach)
**Definição**: Número de contas únicas que visualizaram o conteúdo pelo menos uma vez.
**Fórmula**: Contagem única de contas (fornecida pelo Instagram Insights)
**Quando usar**: Base para todas as taxas; indica distribuição real.
**Limitações**: 
- Não disponível via API pública para posts passados
- Soma de reaches de posts ≠ alcance da conta (pessoas veem múltiplos posts)
- Stories: disponível apenas nas 24h/48h após publicação
**Erros comuns**: Somar reaches de posts achando que é alcance total único.

### Visualizações (Views/Plays)
**Definição**: Para Reels, número de vezes que o vídeo começou a tocar (≥ 0ms). Para outros, impressões.
**Fórmula**: Contagem de plays (Reels) ou impressões (outros)
**Quando usar**: Volume de consumo de vídeo; comparar Reels entre si.
**Limitações**: 
- Conta replays da mesma pessoa
- Não indica atenção (pode ser 0.1s)
- Não disponível para Fotos/Carrosséis no mesmo sentido

### Curtidas (Likes)
**Definição**: Contagem de interações "curtir" no post.
**Fórmula**: Contagem simples
**Quando usar**: Sinal de aprovação superficial; componente de engagement rate.
**Limitações**: Métrica de vaidade; baixa correlação com conversão.

### Comentários (Comments)
**Definição**: Contagem de comentários no post (inclui respostas do autor).
**Fórmula**: Contagem simples
**Quando usar**: Sinal de conversa/engajamento ativo.
**Limitações**: Pode incluir spam, perguntas de suporte, respostas do autor.

### Salvamentos (Saves)
**Definição**: Contagem de vezes que o post foi salvo na coleção do usuário.
**Fórmula**: Contagem simples
**Quando usar**: **Melhor proxy de intenção de retorno e valor percebido**. Correlação alta com conversão posterior.
**Limitações**: Não distingue "salvar para depois" de "salvar como referência".

### Compartilhamentos (Shares)
**Definição**: Contagem de envios via DM ou compartilhamento no Story/Feed.
**Fórmula**: Contagem simples
**Quando usar**: **Melhor proxy de viralização orgânica e alcance ampliado**.
**Limitações**: Não mensura alcance do compartilhamento (público do compartilhador).

### Visitas ao Perfil (Profile Visits)
**Definição**: Cliques no nome do perfil a partir do post.
**Fórmula**: Contagem simples
**Quando usar**: Indica curiosidade sobre o autor; etapa intermediária do funil.
**Limitações**: Não disponível para todos os formatos; Stories tem métrica separada.

### Cliques no Link (Link Clicks / Website Clicks)
**Definição**: Cliques no link da bio, botão de link no Story, ou link no post (quando disponível).
**Fórmula**: Contagem simples
**Quando usar**: Etapa de conversão de tráfego; pré-requisito para venda/lead.
**Limitações**: 
- Instagram não rastreia cliques no link da bio por post individual (atribuição agregada)
- Link no Story: disponível só para contas com 10k+ ou verificada

### Seguidores Novos (Follows from Post)
**Definição**: Seguidores ganhos atribuídos a um post específico.
**Fórmula**: Atribuição do Instagram (modelo proprietário)
**Quando usar**: Crescimento de audiência direto do conteúdo.
**Limitações**: 
- Modelo de atribuição opaco
- Não disponível via API pública
- Frequentemente subnotificado

---

## Taxas Derivadas (Orgânico)

### Taxa de Salvamento por Alcance (Save Rate)
**Fórmula**: `salvamentos / alcance * 100`
**Interpretação**: % de quem viu e achou valioso o suficiente para salvar.
**Benchmark**: > 3% = bom; > 5% = excelente (varia por nicho).
**Uso**: Identificar conteúdo "evergreen" e candidatos a anúncio.

### Taxa de Compartilhamento por Alcance (Share Rate)
**Fórmula**: `compartilhamentos / alcance * 100`
**Interpretação**: % de quem viu e achou relevante para compartilhar.
**Benchmark**: > 1% = bom; > 2% = viralizando.
**Uso**: Detectar conteúdo com potencial de alcance orgânico ampliado.

### Taxa de Cliques no Link por Alcance (Link Click Rate)
**Fórmula**: `cliques_link / alcance * 100`
**Interpretação**: Efetividade do CTA e interesse em saber mais.
**Benchmark**: > 2% = bom para orgânico.
**Uso**: Otimizar CTAs, bio, landing page.

### Taxa de Visita ao Perfil (Profile Visit Rate)
**Fórmula**: `visitas_perfil / alcance * 100`
**Interpretação**: Curiosidade sobre quem criou o conteúdo.
**Uso**: Avaliar força da marca pessoal; bio e highlights.

### Engagement Rate (por alcance)
**Fórmula**: `(curtidas + comentarios + salvamentos + compartilhamentos) / alcance * 100`
**Interpretação**: Engajamento total relativo à distribuição.
**Limitações**: Métrica composta; mascara quais ações importam para seu objetivo.

---

## Métricas de Anúncios (Meta Ads)

### Investimento (Amount Spent)
**Definição**: Valor gasto no período (BRL).
**Quando usar**: Base para todos os custos unitários; controle orçamentário.

### Impressões (Impressions)
**Definição**: Total de vezes que o anúncio foi exibido (inclui múltiplas exibições para mesma pessoa).
**Quando usar**: Denominador para CPM e CTR; mede exposição bruta.

### Alcance (Reach)
**Definição**: Pessoas únicas que viram o anúncio.
**Quando usar**: Denominador para frequência; mede amplitude real de entrega.

### Frequência (Frequency)
**Fórmula**: `impressoes / alcance`
**Interpretação**: Média de vezes que cada pessoa viu o anúncio.
**Benchmark**: 1.5–2.5 = saudável; > 4 = risco de fadiga; > 8 = saturação provável.
**Uso**: Decidir quando renovar criativos ou excluir públicos.

### Cliques (Clicks - All)
**Definição**: Todos os cliques no anúncio (link, perfil, "ver mais", curtir, comentar, compartilhar).
**Quando usar**: Base para CPC; mede interesse geral.

### Cliques no Link (Link Clicks / Outbound Clicks)
**Definição**: Cliques que levam para fora do Instagram (site, landing page, WhatsApp).
**Quando usar**: Numerador para CTR de tráfego; etapa de funil.

### CTR (Click-Through Rate)
**Fórmula**: `cliques / impressoes * 100` (ou `cliques_link / impressoes * 100` para link CTR)
**Interpretação**: Atratividade do criativo + relevância do público.
**Benchmark**: 
- Conversão: 1–2% (link CTR)
- Tráfego: 1.5–3% (link CTR)
- Reconhecimento: 0.5–1% (all clicks CTR)
**Limitações**: CTR alto ≠ conversão; pode ser clickbait.

### CPC (Cost Per Click)
**Fórmula**: `investimento / cliques` (ou `/ cliques_link` para link CPC)
**Interpretação**: Eficiência de custo para gerar tráfego.
**Uso**: Comparar criativos, públicos, posicionamentos.

### CPM (Cost Per Mille)
**Fórmula**: `investimento / (impressoes / 1000)`
**Interpretação**: Custo de mil impressões; indicador de competitividade do leilão.
**Uso**: Diagnóstico de entrega; CPM alto = público competitivo ou creative ruim.

### Conversões (Conversions / Results)
**Definição**: Eventos de conversão atribuídos (compra, lead, cadastro, etc.).
**Quando usar**: Numerador para custo por conversão e ROAS.
**Limitações**: 
- Depende de Pixel/CAPI configurado corretamente
- Janela de atribuição afeta contagem (1d click, 7d click, 1d view)
- "Resultado" no Meta Ads = evento otimizado, não necessariamente venda

### Custo por Conversão (Cost Per Result / CPA)
**Fórmula**: `investimento / conversoes`
**Interpretação**: Eficiência para gerar o resultado otimizado.
**Uso**: Principal KPI de campanhas de conversão; comparar entre criativos/conjuntos.

### Receita Atribuída (Purchase Value / Conversion Value)
**Definição**: Valor monetário das conversões (ex: valor da venda).
**Quando usar**: Numerador para ROAS; só disponível se evento de compra configurado com valor.

### ROAS (Return on Ad Spend)
**Fórmula**: `receita_atribuida / investimento`
**Interpretação**: Retorno financeiro direto do investimento em anúncios.
**Benchmark**: > 1 = lucro bruto (antes de custos); > 3 = saudável para maioria; > 5 = excelente.
**Limitações**: 
- Atribuição não é causalidade (pessoas comprariam assim mesmo?)
- Não inclui custos de produto, frete, operação
- Janela de atribuição infla ROAS em ciclos de venda longos

---

## Métricas de Funil

### Funil Orgânico
```
Alcance → Visitas Perfil → Cliques Link → DMs (manual) → Conversões (manual)
```
**Taxas calculadas apenas quando ambas as etapas têm dados**.
**Nunca some reaches de posts** — use alcance agregado da conta (exportação Insights → Visão geral).

### Funil Pago
```
Investimento → Impressões → Alcance → Cliques → Cliques Link → Conversões → Receita
```
**Taxas em cada transição**: CPM, Frequência, CTR, Link CTR, Conversão Rate, ROAS.

---

## Limitações Críticas de Interpretação

| Armadilha | Realidade |
|-----------|-----------|
| "Alcance total = soma dos reaches" | Falso — pessoas veem múltiplos posts |
| "CTR alto = criativo bom" | Falso — pode ser clickbait, público errado, ou landing page ruim |
| "ROAS > 1 = lucro" | Falso — não inclui COGS, frete, taxas, operação |
| "Salvamentos = vendas futuras" | Correlação, não causalidade; use como sinal, não garantia |
| "Métricas de 7 dias = tendência" | Ruído alto; use 30+ dias para decisões |
| "Benchmark do setor = minha meta" | Benchmarks variam por produto, preço, público, criativo, época |

---

## Decisões de Design do Dashboard

1. **Vazio ≠ Zero**: Campos vazios no CSV viram `null` e mostram "—", nunca 0.
2. **Taxas só com denominador**: Se alcance = null, taxa = "—".
3. **Agregação por formato/linha/tema**: Média aritmética simples (não ponderada por alcance).
4. **Período de medição ≠ Data de publicação**: Anúncios usam data_inicio/data_fim; orgânico usa data_publicacao.
5. **Pago/Orgânico separado**: Só misturados se CSV tiver coluna `pago_organico` preenchida.
6. **Diagnóstico = hipótese, não verdade**: Cada item separa "dado medido", "não disponível", "hipótese", "ação".