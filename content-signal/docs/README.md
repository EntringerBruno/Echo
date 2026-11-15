# Documentação — Content Signal

## Como rodar localmente

1. Clone ou baixe este repositório
2. Abra `index.html` diretamente no navegador (duplo clique)  
   **Ou** sirva com servidor local:
   ```bash
   npx serve .
   # ou
   python -m http.server 8000
   ```
   Servidor local é recomendado para evitar políticas de CORS ao carregar CSVs.

## Exportar métricas do Instagram

1. Acesse **Meta Business Suite** → **Insights** → **Conteúdo**
2. Selecione o período desejado (7, 30, 90 dias)
3. Clique em **Exportar** → **CSV**
4. O arquivo baixado terá colunas em inglês; renomeie ou use o modelo abaixo

## Preencher CSV orgânico

Use `templates/organic-template.csv` como base. Colunas obrigatórias:
- `data_publicacao` (AAAA-MM-DD)
- `tipo_conteudo` (reel, carousel, photo, story)

Colunas opcionais (preencha quando tiver o dado):
- `titulo_interno` — identificação interna
- `tema` — assunto do post
- `linha_editorial` — ex: Descoberta, Autoridade, Prática séria, Bastidores, Oferta
- `link_post` — URL do post
- `alcance`, `visualizacoes`, `curtidas`, `comentarios`, `salvamentos`, `compartilhamentos`
- `visitas_perfil`, `cliques_link`, `seguidores_novos`
- `origem_trafego`, `pago_organico` (organic/paid), `observacoes`

**Importante**: Deixe vazio (não zero) quando a métrica não estiver disponível. O dashboard trata vazio como "não disponível".

## Exportar métricas do Meta Ads

1. No **Gerenciador de Anúncios**, selecione a conta
2. Vá em **Relatórios** → **Criar relatório personalizado**
3. Níveis: Campanha, Conjunto de anúncios, Anúncio, Criativo
4. Métricas sugeridas: Investimento, Impressões, Alcance, Cliques, Cliques no link, CTR, CPC, Conversões, Valor de conversão, Frequência
5. Exporte em CSV

## Preencher CSV de anúncios

Use `templates/ads-template.csv`. Colunas obrigatórias:
- `data_inicio`, `nivel` (campaign, adset, ad, creative), `nome_campanha`

Recomendadas:
- `data_fim`, `nome_conjunto`, `nome_anuncio`, `nome_criativo`, `tipo_criativo`
- `objetivo_campanha`, `status`
- `investimento`, `impressoes`, `alcance`, `cliques`, `cliques_link`
- `visitas_perfil`, `conversoes`, `receita_atribuida`, `frequencia`

## Usar os botões de importação

1. Clique em **"Atualizar dados orgânicos"** ou **"Atualizar dados de anúncios"**
2. Selecione o arquivo CSV exportado
3. O dashboard valida colunas e mostra prévia (primeiras 10 linhas)
4. Avisos aparecem para colunas não reconhecidas ou valores não numéricos
5. Clique em **"Confirmar importação"** para carregar
6. **"Baixar modelo"** baixa o template vazio
7. **"Restaurar demo"** volta aos dados sintéticos de exemplo

## Interpretar os indicadores

| Indicador | O que significa | Como usar |
|-----------|----------------|-----------|
| Alcance | Pessoas únicas que viram | Base para todas as taxas |
| Taxa salv./alcance | % que salvou | Indica intenção de retorno |
| Taxa compart./alcance | % que compartilhou | Indica viralização orgânica |
| Taxa cliques/alcance | % que clicou no link | Efetividade do CTA |
| Visitas/Alcance | % que visitou perfil | Curiosidade sobre o autor |
| CTR (Ads) | Cliques / Impressões | Atratividade do criativo |
| CPC (Ads) | Investimento / Cliques | Eficiência de custo |
| Custo/conv. (Ads) | Investimento / Conversões | Eficiência de resultado |
| ROAS (Ads) | Receita / Investimento | Retorno financeiro |

## Limitações dos dados

- **Orgânico**: Instagram não expõe via API pública reach/impressions/saves/shares de posts passados. Use exportação manual do Meta Business Suite.
- **Stories**: Métricas limitadas a 24h; exporte diariamente se quiser histórico.
- **DMs/Conversões**: Não disponíveis via API; preencha manualmente no CSV se quiser no funil.
- **Alcance ≠ Soma de reaches**: Alcance total da conta ≠ soma dos reaches dos posts (pessoas veem múltiplos posts).
- **Período de medição**: Métricas de anúncio referem-se ao período de veiculação, não à data de criação.

## Regras de privacidade

- Dados reais **nunca** saem do seu navegador
- Nenhum servidor externo recebe seus CSVs
- Nenhuma credencial, token ou chave é solicitada
- O repositório não deve conter exports reais (`.gitignore` bloqueia)
- Futura integração com Meta Ads exigiria OAuth, escopos mínimos e backend próprio

## Adaptar para outro criador

1. Edite `state.editorialLines` em `assets/js/app.js` para suas linhas
2. Ajuste `DEFAULT_THEMES` para seus temas recorrentes
3. Modifique cores em `:root` no CSS para sua identidade visual
4. Atualize textos nas abas se necessário