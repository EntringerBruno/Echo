# Modelo de Dados — Content Signal

## Visão Geral

O dashboard opera sobre dois conjuntos de dados independentes:
1. **Orgânico** — Posts do Instagram (Reels, Carrosséis, Fotos, Stories)
2. **Anúncios** — Dados do Meta Ads (Campanhas, Conjuntos, Anúncios, Criativos)

Ambos são carregados via CSV no navegador, processados em memória e renderizados.

---

## Esquema Orgânico (`organic`)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string | auto | Identificador único gerado na importação |
| `data_publicacao` | string (YYYY-MM-DD) | ✅ | Data de publicação do conteúdo |
| `tipo_conteudo` | enum | ✅ | `reel`, `carousel`, `photo`, `story` |
| `titulo_interno` | string | não | Título/identificação interna |
| `tema` | string | não | Assunto/tópico do conteúdo |
| `linha_editorial` | string | não | Classificação editorial (default: "Sem linha") |
| `link_post` | string (URL) | não | Link direto para o post |
| `alcance` | number | não | Pessoas únicas que viram |
| `visualizacoes` | number | não | Visualizações (Reels) ou impressões |
| `curtidas` | number | não | Curtidas |
| `comentarios` | number | não | Comentários |
| `salvamentos` | number | não | Salvamentos |
| `compartilhamentos` | number | não | Compartilhamentos |
| `visitas_perfil` | number | não | Visitas ao perfil originadas do post |
| `cliques_link` | number | não | Cliques no link da bio/Stories |
| `seguidores_novos` | number | não | Seguidores ganhos atribuídos ao post |
| `origem_trafego` | string | não | Fonte de tráfego (ex: orgânico, hashtag, explore) |
| `pago_organico` | enum | não | `organic`, `paid`, ou vazio |
| `observacoes` | string | não | Notas livres |

### Regras de Validação Orgânico

- `data_publicacao`: formato ISO `YYYY-MM-DD` (aceita `DD/MM/YYYY` na importação)
- `tipo_conteudo`: normalizado para `reel`, `carousel`, `photo`, `story` (case-insensitive, aceita aliases)
- Métricas numéricas: vírgula decimal convertida para ponto; não-numéricos → `null`
- Campos vazios → `null` (nunca zero)
- `pago_organico`: detecta "pago/paid/ads/boosted" → `paid`; "orgânico/organic" → `organic`

---

## Esquema Anúncios (`ads`)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string | auto | Identificador único gerado na importação |
| `data_inicio` | string (YYYY-MM-DD) | ✅ | Início da veiculação |
| `data_fim` | string (YYYY-MM-DD) | não | Fim da veiculação |
| `account_id` | string | não | ID da conta de anúncios (ex: `act_123456789`) |
| `campaign_id` | string | ✅ | ID estável da campanha |
| `campaign_name` | string | ✅ | Nome da campanha |
| `adset_id` | string | ✅ | ID estável do conjunto de anúncios |
| `adset_name` | string | ✅ | Nome do conjunto de anúncios |
| `ad_id` | string | ✅ | ID estável do anúncio |
| `ad_name` | string | ✅ | Nome do anúncio |
| `creative_id` | string | ✅ | ID estável do criativo |
| `creative_name` | string | ✅ | Nome do criativo |
| `creative_type` | enum | não | `video`, `image`, `carousel`, `other` |
| `objective` | string | não | Objetivo da campanha (ex: `CONVERSIONS`, `LINK_CLICKS`, `BRAND_AWARENESS`) |
| `status` | enum | não | `active`, `paused`, `deleted`, `archived`, `learning`, `pending_review` |
| `currency` | string | não | Moeda (padrão: `BRL`) |
| `timezone` | string | não | Fuso horário (padrão: `America/Sao_Paulo`) |
| `attribution_window` | string | não | Janela de atribuição (padrão: `7d_click`) |
| `investimento` | number | não | Valor gasto (BRL) |
| `impressoes` | number | não | Impressões |
| `alcance` | number | não | Alcance (pessoas únicas) |
| `cliques` | number | não | Cliques (todos) |
| `cliques_link` | number | não | Cliques no link (outbound) |
| `visitas_perfil` | number | não | Visitas ao perfil |
| `conversoes` | number | não | Conversões (evento otimizado) |
| `receita_atribuida` | number | não | Receita atribuída (BRL) |
| `frequencia` | number | não | Frequência média (impressões/alcance) |
| `observacoes` | string | não | Notas livres |

### Regras de Validação Anúncios

- `data_inicio`/`data_fim`: formato ISO `YYYY-MM-DD`
- `creative_type`: normalizado para `video`, `image`, `carousel`, `other`
- `status`: normalizado para valores padrão do Meta Ads
- Métricas numéricas: mesma regra do orgânico
- **Agregação**: feita a partir do nível de anúncio (fact table) para cima:
  - **Campanha**: agrupado por `campaign_id`
  - **Conjunto**: agrupado por `adset_id`
  - **Anúncio**: agrupado por `ad_id`
  - **Criativo**: agrupado por `creative_id`
- As agregações usam soma simples para métricas absolutas e média ponderada por alcance para frequência

---

## Métricas Derivadas (Calculadas em Runtime)

### Orgânico

| Métrica | Fórmula | Disponível quando |
|---------|---------|-------------------|
| `saveRate` | `salvamentos / alcance * 100` | alcance > 0 |
| `shareRate` | `compartilhamentos / alcance * 100` | alcance > 0 |
| `clickRate` | `cliques_link / alcance * 100` | alcance > 0 |
| `engagementRate` | `(curtidas+comentarios+salvamentos+compartilhamentos) / alcance * 100` | alcance > 0 |
| `profileVisitRate` | `visitas_perfil / alcance * 100` | alcance > 0 e visitas_perfil |

### Anúncios

| Métrica | Fórmula | Disponível quando |
|---------|---------|-------------------|
| `ctr` | `cliques / impressoes * 100` | impressoes > 0 |
| `cpc` | `investimento / cliques` | cliques > 0 |
| `cpm` | `investimento / (impressoes / 1000)` | impressoes > 0 |
| `costPerConversion` | `investimento / conversoes` | conversoes > 0 |
| `roas` | `receita_atribuida / investimento` | investimento > 0 e receita > 0 |
| `conversionRate` | `conversoes / cliques_link * 100` | cliques_link > 0 |

### Funil Orgânico

| Etapa | Métrica | Taxa |
|-------|---------|------|
| 1. Alcance | `totals.alcance` | — |
| 2. Visitas perfil | `totals.visitas_perfil` | `visitas/alcance` |
| 3. Cliques link | `totals.cliques_link` | `cliques/visitas` |
| 4. DMs | manual | `DMs/cliques` |
| 5. Conversões | manual | `Conversões/DMs` |

### Funil Pago

| Etapa | Métrica | Taxa |
|-------|---------|------|
| 1. Investimento | `totals.investimento` | — |
| 2. Impressões | `totals.impressoes` | `impressoes/R$` |
| 3. Alcance | `totals.alcance` | `alcance/impressoes` |
| 4. Cliques | `totals.cliques` | `CTR` |
| 5. Cliques link | `totals.cliques_link` | `cliques_link/cliques` |
| 6. Conversões | `totals.conversoes` | `conv/cliques_link` + `custo/conv` |
| 7. Receita | `totals.receita_atribuida` | `ROAS` |

---

## Tipos de Dados Internos (TypeScript-like)

```typescript
interface OrganicPost {
  id: string;
  data_publicacao: string;
  tipo_conteudo: 'reel' | 'carousel' | 'photo' | 'story';
  titulo_interno: string | null;
  tema: string | null;
  linha_editorial: string;
  link_post: string | null;
  alcance: number | null;
  visualizacoes: number | null;
  curtidas: number | null;
  comentarios: number | null;
  salvamentos: number | null;
  compartilhamentos: number | null;
  visitas_perfil: number | null;
  cliques_link: number | null;
  seguidores_novos: number | null;
  origem_trafego: string | null;
  pago_organico: 'organic' | 'paid' | null;
  observacoes: string | null;
}

interface AdsRow {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  account_id: string | null;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  ad_id: string;
  ad_name: string;
  creative_id: string;
  creative_name: string;
  creative_type: 'video' | 'image' | 'carousel' | 'other' | null;
  objective: string | null;
  status: 'active' | 'paused' | 'deleted' | 'archived' | 'learning' | 'pending_review' | null;
  currency: string;
  timezone: string;
  attribution_window: string;
  investimento: number | null;
  impressoes: number | null;
  alcance: number | null;
  cliques: number | null;
  cliques_link: number | null;
  visitas_perfil: number | null;
  conversoes: number | null;
  receita_atribuida: number | null;
  frequencia: number | null;
  observacoes: string | null;
}

interface EditorialLine {
  id: string;
  name: string;
  description: string;
  color: string; // hex
}

interface Idea {
  id: string;
  title: string;
  line: string;
  theme: string;
  format: 'reel' | 'carousel' | 'photo' | 'story';
  hook: string;
  cta: string;
  status: 'idea' | 'production' | 'published' | 'archived';
  adPotential: 'low' | 'medium' | 'high';
  notes: string;
}
```

---

## Agregações Disponíveis

### `aggregateOrganic(posts[])`
Retorna:
- `count`: total de posts
- `totals`: soma de cada métrica numérica
- `averages`: média de cada métrica (só posts com valor)
- `byFormat`: agregação por `tipo_conteudo`
- `byEditorialLine`: agregação por `linha_editorial`
- `byTheme`: agregação por `tema`
- `period`: `{start, end}` do intervalo

### `aggregateAds(ads[])`
Recebe array de linhas no nível de anúncio (fact table) e retorna agregações hierárquicas:
- `totals`: somatório geral (nível conta)
- `byCampaign`: array de campanhas agregadas por `campaign_id`
- `byAdset`: array de conjuntos agregados por `adset_id`
- `byAd`: array de anúncios agregados por `ad_id`
- `byCreative`: array de criativos agregados por `creative_id`
- `campaigns`: alias para `byCampaign` (compatibilidade)

---

## Regras de Importação CSV

1. **Encoding**: UTF-8
2. **Separador**: vírgula (`,`)
3. **Aspas**: aspas duplas para campos com vírgula/quebra de linha
4. **Datas**: `YYYY-MM-DD` ou `DD/MM/YYYY`
5. **Números**: ponto ou vírgula decimal; separador de milhar ignorado
6. **Vazios**: string vazia → `null`
7. **Linhas inválidas**: reportadas em `errors`; não interrompem importação
8. **Colunas extras**: ignoradas com aviso em `warnings`
9. **Colunas obrigatórias ausentes**: erro bloqueante

---

## Limitações Conhecidas

- Não há deduplicação de posts (mesmo `id` gerado na importação)
- Agregação de anúncios assume hierarquia consistente nos nomes
- Frequência média ponderada por alcance (aproximação)
- ROAS só calculado quando `receita_atribuida > 0`
- Funil orgânico: DMs e Conversões são sempre manuais