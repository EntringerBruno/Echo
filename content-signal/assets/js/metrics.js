/**
 * Metrics Calculator — Content Signal
 * Cálculos de métricas, taxas, agregações e diagnósticos
 */

export function safeDivide(numerator, denominator) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

export function safePercent(numerator, denominator) {
  const ratio = safeDivide(numerator, denominator);
  return ratio !== null ? ratio * 100 : null;
}

export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '—';
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return Number(num.toFixed(decimals)).toLocaleString('pt-BR');
}

export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined) return '—';
  return num.toFixed(decimals) + '%';
}

export function formatCurrency(num, decimals = 2) {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/* ==========================================================================
   Agregações Orgânicas
   ========================================================================== */

export function aggregateOrganic(posts) {
  if (!posts.length) return null;

  const totals = posts.reduce((acc, post) => {
    const metrics = ['alcance', 'visualizacoes', 'curtidas', 'comentarios', 'salvamentos', 'compartilhamentos', 'visitas_perfil', 'cliques_link', 'seguidores_novos'];
    metrics.forEach(m => {
      if (post[m] !== null) acc[m] = (acc[m] || 0) + post[m];
    });
    return acc;
  }, {});

  const count = posts.length;
  const avg = {};
  metrics.forEach(m => {
    const validPosts = posts.filter(p => p[m] !== null);
    if (validPosts.length) {
      avg[m] = totals[m] / validPosts.length;
    }
  });

  const byFormat = {};
  VALID_FORMATS.forEach(fmt => {
    const fmtPosts = posts.filter(p => p.tipo_conteudo === fmt);
    if (fmtPosts.length) {
      byFormat[fmt] = aggregateOrganic(fmtPosts);
      byFormat[fmt].count = fmtPosts.length;
    }
  });

  const byEditorialLine = {};
  const lines = [...new Set(posts.map(p => p.linha_editorial).filter(Boolean))];
  lines.forEach(line => {
    const linePosts = posts.filter(p => p.linha_editorial === line);
    byEditorialLine[line] = aggregateOrganic(linePosts);
    byEditorialLine[line].count = linePosts.length;
  });

  const themes = {};
  posts.forEach(post => {
    if (post.tema) {
      if (!themes[post.tema]) themes[post.tema] = [];
      themes[post.tema].push(post);
    }
  });
  const byTheme = {};
  Object.entries(themes).forEach(([theme, themePosts]) => {
    byTheme[theme] = aggregateOrganic(themePosts);
    byTheme[theme].count = themePosts.length;
  });

  return {
    count,
    totals,
    averages: avg,
    byFormat,
    byEditorialLine,
    byTheme,
    period: getPeriod(posts)
  };
}

const VALID_FORMATS = ['reel', 'carousel', 'photo', 'story'];
const metrics = ['alcance', 'visualizacoes', 'curtidas', 'comentarios', 'salvamentos', 'compartilhamentos', 'visitas_perfil', 'cliques_link', 'seguidores_novos'];

function getPeriod(posts) {
  const dates = posts.map(p => p.data_publicacao).filter(Boolean).sort();
  if (!dates.length) return null;
  return { start: dates[0], end: dates[dates.length - 1] };
}

export function calculateRates(post) {
  const rates = {
    saveRate: null,
    shareRate: null,
    clickRate: null,
    engagementRate: null,
    profileVisitRate: null
  };
  if (post.alcance !== null) {
    rates.saveRate = safePercent(post.salvamentos, post.alcance);
    rates.shareRate = safePercent(post.compartilhamentos, post.alcance);
    rates.clickRate = safePercent(post.cliques_link, post.alcance);
    rates.engagementRate = safePercent(
      (post.curtidas || 0) + (post.comentarios || 0) + (post.salvamentos || 0) + (post.compartilhamentos || 0),
      post.alcance
    );
  }
  if (post.visitas_perfil !== null && post.alcance !== null) {
    rates.profileVisitRate = safePercent(post.visitas_perfil, post.alcance);
  }
  return rates;
}

export function calculateFunnelOrganic(agg) {
  if (!agg || !agg.totals) return null;

  const totals = agg.totals;
  const reach = totals.alcance;
  const profileVisits = totals.visitas_perfil;
  const linkClicks = totals.cliques_link;

  return {
    reach: reach || null,
    profileVisits: profileVisits || null,
    linkClicks: linkClicks || null,
    dms: null, // manual
    conversions: null, // manual
    rateReachProfile: safePercent(profileVisits, reach),
    rateProfileClicks: safePercent(linkClicks, profileVisits),
    rateClicksDms: null,
    rateDmsConversions: null
  };
}

/* ==========================================================================
   Agregações Meta Ads (fact table no nível de anúncio)
   ========================================================================== */

export function aggregateAds(ads) {
  if (!ads.length) return null;

  // Agrega por campanha
  const byCampaign = {};
  // Agrega por conjunto de anúncios
  const byAdset = {};
  // Agrega por anúncio
  const byAd = {};
  // Agrega por criativo
  const byCreative = {};

  ads.forEach(ad => {
    // Por campanha
    const campKey = ad.campaign_id;
    if (!byCampaign[campKey]) {
      byCampaign[campKey] = {
        campaign_id: ad.campaign_id,
        campaign_name: ad.campaign_name,
        objective: ad.objective,
        status: ad.status,
        currency: ad.currency,
        timezone: ad.timezone,
        attribution_window: ad.attribution_window,
        count: 0,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        cliques_link: 0,
        visitas_perfil: 0,
        conversoes: 0,
        receita_atribuida: 0,
        _freqWeight: 0,
        _freqSum: 0
      };
    }
    const camp = byCampaign[campKey];
    camp.count++;
    addMetrics(camp, ad);

    // Por adset
    const adsetKey = ad.adset_id;
    if (!byAdset[adsetKey]) {
      byAdset[adsetKey] = {
        adset_id: ad.adset_id,
        adset_name: ad.adset_name,
        campaign_id: ad.campaign_id,
        campaign_name: ad.campaign_name,
        count: 0,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        cliques_link: 0,
        visitas_perfil: 0,
        conversoes: 0,
        receita_atribuida: 0,
        _freqWeight: 0,
        _freqSum: 0
      };
    }
    const adset = byAdset[adsetKey];
    adset.count++;
    addMetrics(adset, ad);

    // Por anúncio
    const adKey = ad.ad_id;
    if (!byAd[adKey]) {
      byAd[adKey] = {
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        adset_id: ad.adset_id,
        adset_name: ad.adset_name,
        campaign_id: ad.campaign_id,
        campaign_name: ad.campaign_name,
        creative_id: ad.creative_id,
        creative_name: ad.creative_name,
        creative_type: ad.creative_type,
        count: 0,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        cliques_link: 0,
        visitas_perfil: 0,
        conversoes: 0,
        receita_atribuida: 0,
        _freqWeight: 0,
        _freqSum: 0
      };
    }
    const adAgg = byAd[adKey];
    adAgg.count++;
    addMetrics(adAgg, ad);

    // Por criativo
    const creativeKey = ad.creative_id;
    if (!byCreative[creativeKey]) {
      byCreative[creativeKey] = {
        creative_id: ad.creative_id,
        creative_name: ad.creative_name,
        creative_type: ad.creative_type,
        count: 0,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        cliques_link: 0,
        visitas_perfil: 0,
        conversoes: 0,
        receita_atribuida: 0,
        _freqWeight: 0,
        _freqSum: 0
      };
    }
    const creative = byCreative[creativeKey];
    creative.count++;
    addMetrics(creative, ad);
  });

  // Calcula taxas e frequência final para todos os níveis
  [byCampaign, byAdset, byAd, byCreative].forEach(level => {
    Object.values(level).forEach(agg => {
      finalizeAgg(agg);
    });
  });

  // Totais gerais
  const totals = Object.values(byCampaign).reduce((acc, c) => {
    ['investimento', 'impressoes', 'alcance', 'cliques', 'cliques_link', 'visitas_perfil', 'conversoes', 'receita_atribuida'].forEach(m => {
      acc[m] = (acc[m] || 0) + (c[m] || 0);
    });
    return acc;
  }, {});

  finalizeAgg(totals);
  totals.avgDailySpend = Object.keys(byCampaign).length ? totals.investimento / Object.keys(byCampaign).length : null;

  return {
    totals,
    byCampaign: Object.values(byCampaign),
    byAdset: Object.values(byAdset),
    byAd: Object.values(byAd),
    byCreative: Object.values(byCreative),
    campaigns: Object.values(byCampaign)
  };
}

function addMetrics(target, source) {
  ['investimento', 'impressoes', 'alcance', 'cliques', 'cliques_link', 'visitas_perfil', 'conversoes', 'receita_atribuida'].forEach(m => {
    if (source[m] !== null) target[m] = (target[m] || 0) + source[m];
  });
  // Frequência: apenas acumula se temos frequência E alcance da mesma linha
  // NOTA: alcance somado entre linhas NÃO é alcance deduplicado.
  // Agregados só terão frequência se alcance deduplicado for fornecido externamente.
  if (source.frequencia !== null && source.alcance !== null) {
    target._freqWeight = (target._freqWeight || 0) + source.alcance;
    target._freqSum = (target._freqSum || 0) + source.frequencia * source.alcance;
  }
}

function finalizeAgg(agg) {
  // Frequência: NÃO calcular média ponderada com alcance somado.
  // Alcance somado entre anúncios/campanhas/dias NÃO é alcance deduplicado.
  // Só calcular frequência agregada se alcance deduplicado for fornecido externamente.
  // Sem esse dado: frequência = null (aviso deve ser emitido pelo consumidor).
  delete agg._freqWeight;
  delete agg._freqSum;
  agg.frequencia = null;
  agg.ctr = safePercent(agg.cliques, agg.impressoes);
  agg.cpc = safeDivide(agg.investimento, agg.cliques);
  agg.cpm = safeDivide(agg.investimento, agg.impressoes / 1000);
  agg.costPerConversion = safeDivide(agg.investimento, agg.conversoes);
  agg.roas = safeDivide(agg.receita_atribuida, agg.investimento);
  agg.conversionRate = safePercent(agg.conversoes, agg.cliques_link);
}

export function calculateFunnelPaid(totals) {
  if (!totals) return null;

  return {
    spend: totals.investimento || null,
    impressions: totals.impressoes || null,
    reach: totals.alcance || null,
    clicks: totals.cliques || null,
    linkClicks: totals.cliques_link || null,
    conversions: totals.conversoes || null,
    revenue: totals.receita_atribuida || null,
    ctr: totals.ctr || null,
    cpc: totals.cpc || null,
    costPerConversion: totals.costPerConversion || null,
    roas: totals.roas || null,
    rateSpendImpr: safeDivide(totals.impressoes, totals.investimento), // impressões por real
    rateImprReach: safePercent(totals.alcance, totals.impressoes),
    rateReachClicks: totals.ctr,
    rateClicksLink: safePercent(totals.cliques_link, totals.cliques),
    rateLinkConv: safePercent(totals.conversoes, totals.cliques_link),
    rateConvRevenue: totals.roas
  };
}

/* ==========================================================================
   Diagnósticos Automáticos
   ========================================================================== */

export function diagnoseOrganic(agg, posts) {
  const diagnosis = [];
  if (!agg) return diagnosis;

  const totals = agg.totals;
  const reach = totals.alcance;
  const profileVisits = totals.visitas_perfil;
  const linkClicks = totals.cliques_link;

  // 1. Gargalo de alcance
  if (reach !== null && agg.count > 0) {
    const avgReach = reach / agg.count;
    if (avgReach < 100) {
      diagnosis.push({
        type: 'alert',
        title: 'Alcance muito baixo',
        body: [
          { label: 'label-measured', text: `Alcance médio por post: ${formatNumber(avgReach)}` },
          { label: 'label-hypothesis', text: 'Conteúdo não está sendo distribuído organicamente' },
          { label: 'label-action', text: 'Testar horários, formatos (Reels), hashtags e engajamento inicial nos primeiros 30 min' }
        ]
      });
    }
  }

  // 2. Alcance mas poucas visitas ao perfil
  if (reach !== null && profileVisits !== null) {
    const rate = safePercent(profileVisits, reach);
    if (rate !== null && rate < 1) {
      diagnosis.push({
        type: 'warning',
        title: 'Alcance não converte em visitas ao perfil',
        body: [
          { label: 'label-measured', text: `Taxa visita/alcance: ${formatPercent(rate, 2)}` },
          { label: 'label-hypothesis', text: 'CTA fraco, bio não atrativa ou conteúdo não gera curiosidade sobre o autor' },
          { label: 'label-action', text: 'Adicionar CTA para perfil nos posts/Reels, otimizar bio, usar "link na bio" de forma consistente' }
        ]
      });
    }
  }

  // 3. Visitas mas poucos cliques no link
  if (profileVisits !== null && linkClicks !== null) {
    const rate = safePercent(linkClicks, profileVisits);
    if (rate !== null && rate < 5) {
      diagnosis.push({
        type: 'warning',
        title: 'Visitas ao perfil não geram cliques no link',
        body: [
          { label: 'label-measured', text: `Taxa cliques/visitas: ${formatPercent(rate, 1)}` },
          { label: 'label-hypothesis', text: 'Link na bio não claro, oferta não atrativa ou página de destino fraca' },
          { label: 'label-action', text: 'Testar Linktree com oferta clara, melhorar landing page, usar CTA direto nos Stories' }
        ]
      });
    }
  }

  // 4. Melhores formatos
  const formatPerformance = Object.entries(agg.byFormat || {}).map(([fmt, data]) => ({
    format: fmt,
    avgReach: data.averages?.alcance || 0,
    avgSaves: data.averages?.salvamentos || 0,
    avgShares: data.averages?.compartilhamentos || 0,
    count: data.count
  })).filter(f => f.count >= 2).sort((a, b) => b.avgReach - a.avgReach);

  if (formatPerformance.length > 0) {
    const best = formatPerformance[0];
    diagnosis.push({
      type: 'success',
      title: `Melhor formato: ${formatLabel(best.format)}`,
      body: [
        { label: 'label-measured', text: `Alcance médio: ${formatNumber(best.avgReach)} (${best.count} posts)` },
        { label: 'label-action', text: `Priorizar ${formatLabel(best.format)} nas próximas semanas` }
      ]
    });
  }

  // 5. Melhores temas
  const themePerformance = Object.entries(agg.byTheme || {}).map(([theme, data]) => ({
    theme,
    avgReach: data.averages?.alcance || 0,
    avgSaves: data.averages?.salvamentos || 0,
    count: data.count
  })).filter(t => t.count >= 2).sort((a, b) => b.avgReach - a.avgReach);

  if (themePerformance.length > 0) {
    const bestTheme = themePerformance[0];
    diagnosis.push({
      type: 'info',
      title: `Tema destaque: ${bestTheme.theme}`,
      body: [
        { label: 'label-measured', text: `Alcance médio: ${formatNumber(bestTheme.avgReach)} (${bestTheme.count} posts)` },
        { label: 'label-action', text: 'Criar série recorrente ou variações deste tema' }
      ]
    });
  }

  // 6. Posts para repetir
  const topPosts = [...posts].filter(p => p.alcance !== null).sort((a, b) => b.alcance - a.alcance).slice(0, 3);
  if (topPosts.length) {
    topPosts.forEach(post => {
      const rates = calculateRates(post);
      const highSave = rates.saveRate && rates.saveRate > 5;
      const highShare = rates.shareRate && rates.shareRate > 2;
      if (highSave || highShare) {
        diagnosis.push({
          type: 'success',
          title: `Potencial para repetir: "${post.titulo_interno || post.tema || 'Sem título'}"`,
          body: [
            { label: 'label-measured', text: `Alcance: ${formatNumber(post.alcance)} | Salvamentos: ${formatPercent(rates.saveRate, 2)} | Compartilhamentos: ${formatPercent(rates.shareRate, 2)}` },
            { label: 'label-action', text: 'Criar variação (mesmo tema, formato diferente) ou transformar em anúncio' }
          ]
        });
      }
    });
  }

  // 7. Posts para ajustar
  const lowPosts = [...posts].filter(p => p.alcance !== null && p.alcance > 0).sort((a, b) => a.alcance - b.alcance).slice(0, 3);
  if (lowPosts.length) {
    lowPosts.forEach(post => {
      diagnosis.push({
        type: 'warning',
        title: `Baixo desempenho: "${post.titulo_interno || post.tema || 'Sem título'}"`,
        body: [
          { label: 'label-measured', text: `Alcance: ${formatNumber(post.alcance)} | Formato: ${formatLabel(post.tipo_conteudo)}` },
          { label: 'label-hypothesis', text: 'Horário ruim, gancho fraco, hashtags irrelevantes ou tema saturado' },
          { label: 'label-action', text: 'Analisar horário, melhorar gancho inicial, testar mesmo tema em Reels' }
        ]
      });
    });
  }

  // 8. Potencial para anúncio
  const adCandidates = posts.filter(p => {
    const rates = calculateRates(p);
    return p.alcance !== null && p.alcance > 500 && (rates.saveRate > 3 || rates.shareRate > 1);
  }).slice(0, 3);

  if (adCandidates.length) {
    adCandidates.forEach(post => {
      diagnosis.push({
        type: 'info',
        title: `Potencial para criativo pago: "${post.titulo_interno || post.tema || 'Sem título'}"`,
        body: [
          { label: 'label-measured', text: `Alcance orgânico: ${formatNumber(post.alcance)} | Taxa salvamento: ${formatPercent(calculateRates(post).saveRate, 2)}` },
          { label: 'label-hypothesis', text: 'Conteúdo que ressoa organicamente tende a performar bem como anúncio' },
          { label: 'label-action', text: 'Testar como criativo em campanha de conversão/tráfego com público semelhante' }
        ]
      });
    });
  }

  return diagnosis;
}

export function diagnoseAds(agg) {
  const diagnosis = [];
  if (!agg || !agg.totals) return diagnosis;

  const totals = agg.totals;
  const creatives = Object.values(agg.byLevel.creative || {});

  // 1. Investimento concentrado
  if (creatives.length > 0) {
    const totalSpend = totals.investimento || 0;
    const sorted = [...creatives].sort((a, b) => (b.investimento || 0) - (a.investimento || 0));
    const top3Spend = sorted.slice(0, 3).reduce((sum, c) => sum + (c.investimento || 0), 0);
    if (totalSpend > 0 && top3Spend / totalSpend > 0.7) {
      diagnosis.push({
        type: 'warning',
        title: 'Investimento concentrado em poucos criativos',
        body: [
          { label: 'label-measured', text: `Top 3 criativos = ${formatPercent(top3Spend / totalSpend * 100, 0)} do investimento total` },
          { label: 'label-hypothesis', text: 'Risco de saturação e queda de performance; diversificação baixa' },
          { label: 'label-action', text: 'Criar variações dos melhores criativos, testar novos ângulos, ampliar pool de criativos' }
        ]
      });
    }
  }

  // 2. Melhores CTR
  const validCreatives = creatives.filter(c => c.impressoes && c.impressoes > 100 && c.ctr !== null);
  if (validCreatives.length) {
    const bestCtr = [...validCreatives].sort((a, b) => b.ctr - a.ctr)[0];
    diagnosis.push({
      type: 'success',
      title: `Melhor CTR: ${bestCtr.nome_criativo || bestCtr.nome_anuncio || 'Sem nome'}`,
      body: [
        { label: 'label-measured', text: `CTR: ${formatPercent(bestCtr.ctr, 2)} | Investimento: ${formatCurrency(bestCtr.investimento)}` },
        { label: 'label-action', text: 'Analisar elementos visuais/copy deste criativo para replicar em novos testes' }
      ]
    });
  }

  // 3. Melhor custo por conversão
  const validConv = creatives.filter(c => c.conversoes && c.conversoes > 0 && c.costPerConversion !== null);
  if (validConv.length) {
    const bestConv = [...validConv].sort((a, b) => a.costPerConversion - b.costPerConversion)[0];
    diagnosis.push({
      type: 'success',
      title: `Melhor custo por conversão: ${bestConv.nome_criativo || bestConv.nome_anuncio || 'Sem nome'}`,
      body: [
        { label: 'label-measured', text: `Custo/conv.: ${formatCurrency(bestConv.costPerConversion)} | Conversões: ${bestConv.conversoes}` },
        { label: 'label-action', text: 'Aumentar investimento neste criativo ou duplicar em novos conjuntos' }
      ]
    });
  }

  // 4. Melhor ROAS
  const validRoas = creatives.filter(c => c.receita_atribuida && c.receita_atribuida > 0 && c.roas !== null);
  if (validRoas.length) {
    const bestRoas = [...validRoas].sort((a, b) => b.roas - a.roas)[0];
    diagnosis.push({
      type: 'success',
      title: `Melhor ROAS: ${bestRoas.nome_criativo || bestRoas.nome_anuncio || 'Sem nome'}`,
      body: [
        { label: 'label-measured', text: `ROAS: ${bestRoas.roas.toFixed(2)}x | Receita: ${formatCurrency(bestRoas.receita_atribuida)}` },
        { label: 'label-action', text: 'Escalar este criativo; analisar público e oferta para replicar' }
      ]
    });
  }

  // 5. Alto CTR, baixa conversão
  const highCtrLowConv = validCreatives.filter(c => c.ctr > 1.5 && c.costPerConversion && c.costPerConversion > totals.costPerConversion * 2);
  if (highCtrLowConv.length) {
    highCtrLowConv.slice(0, 2).forEach(c => {
      diagnosis.push({
        type: 'warning',
        title: `Alto CTR, alta conversão cara: ${c.nome_criativo || c.nome_anuncio || 'Sem nome'}`,
        body: [
          { label: 'label-measured', text: `CTR: ${formatPercent(c.ctr, 2)} | Custo/conv.: ${formatCurrency(c.costPerConversion)}` },
          { label: 'label-hypothesis', text: 'Criativo atrai cliques mas landing page/oferta não converte; possível mismatch' },
          { label: 'label-action', text: 'Verificar congruência anúncio → landing page; testar nova oferta ou página' }
        ]
      });
    });
  }

  // 6. Baixo CTR e alto custo
  const lowCtrHighCost = validCreatives.filter(c => c.ctr < 0.5 && c.investimento > totals.investimento * 0.1);
  if (lowCtrHighCost.length) {
    lowCtrHighCost.slice(0, 2).forEach(c => {
      diagnosis.push({
        type: 'alert',
        title: `Baixo CTR consumindo orçamento: ${c.nome_criativo || c.nome_anuncio || 'Sem nome'}`,
        body: [
          { label: 'label-measured', text: `CTR: ${formatPercent(c.ctr, 2)} | Investimento: ${formatCurrency(c.investimento)}` },
          { label: 'label-hypothesis', text: 'Criativo não ressoa com público; possível fadiga ou segmentação errada' },
          { label: 'label-action', text: 'Pausar ou substituir criativo; testar novo gancho visual ou copy' }
        ]
      });
    });
  }

  // 7. Campanhas sem resultado claro
  const campaigns = agg.campaigns || [];
  campaigns.forEach(camp => {
    if (camp.investimento > 0 && (!camp.conversoes || camp.conversoes < 3)) {
      diagnosis.push({
        type: 'warning',
        title: `Campanha sem conversões claras: ${camp.nome_campanha}`,
        body: [
          { label: 'label-measured', text: `Investimento: ${formatCurrency(camp.investimento)} | Conversões: ${camp.conversoes || 0}` },
          { label: 'label-hypothesis', text: 'Objetivo da campanha pode não estar alinhado com otimização; pixel/eventos podem não estar configurados' },
          { label: 'label-action', text: 'Verificar eventos de conversão no Pixel/CAPI; revisar objetivo da campanha; testar otimização para evento mais próximo da venda' }
        ]
      });
    }
  });

  // 8. Conteúdos orgânicos com potencial para anúncio
  // (requer dados orgânicos - não implementado aqui)

  return diagnosis;
}

function formatLabel(fmt) {
  const labels = { reel: 'Reels', carousel: 'Carrosséis', photo: 'Fotos', story: 'Stories' };
  return labels[fmt] || fmt;
}

/* ==========================================================================
   Ranking & Sorting
   ========================================================================== */

export function rankPosts(posts, metric = 'alcance', direction = 'desc', limit = 10) {
  const validPosts = posts.filter(p => p[metric] !== null);
  const sorted = [...validPosts].sort((a, b) => {
    const av = a[metric] || 0;
    const bv = b[metric] || 0;
    return direction === 'desc' ? bv - av : av - bv;
  });
  return sorted.slice(0, limit);
}

export function sortAds(ads, metric = 'investimento', direction = 'desc') {
  return [...ads].sort((a, b) => {
    const av = a[metric] !== null ? a[metric] : (direction === 'desc' ? -Infinity : Infinity);
    const bv = b[metric] !== null ? b[metric] : (direction === 'desc' ? -Infinity : Infinity);
    return direction === 'desc' ? bv - av : av - bv;
  });
}