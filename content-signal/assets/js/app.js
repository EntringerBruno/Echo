/**
 * Content Signal — Main Application
 * Dashboard local para análise de métricas Instagram e Meta Ads
 */

import { parseCSV, generateTemplate, rowsToCSV, CSV_HEADERS } from './csv.js';
import {
  aggregateOrganic,
  calculateRates,
  calculateFunnelOrganic,
  aggregateAds,
  calculateFunnelPaid,
  diagnoseOrganic,
  diagnoseAds,
  rankPosts,
  sortAds,
  formatNumber,
  formatPercent,
  formatCurrency,
  formatDate,
  safeDivide,
  safePercent
} from './metrics.js';
import {
  renderBarChart,
  renderGroupedBarChart,
  renderScatterChart,
  renderRetentionChart,
  clearChart
} from './charts.js';

/* ==========================================================================
   Estado Global
   ========================================================================== */

const state = {
  organicPosts: [],
  adsRows: [],
  editorialLines: [],
  ideas: [],
  lastOrganicLoad: null,
  lastAdsLoad: null,
  isDemoData: true,
  currentPeriod: '30d'
};

const DEFAULT_EDITORIAL_LINES = [
  { id: 'descoberta', name: 'Descoberta', description: 'Conteúdo para atrair novos seguidores', color: '#2563eb' },
  { id: 'autoridade', name: 'Autoridade', description: 'Demonstra expertise e conhecimento', color: '#16a34a' },
  { id: 'pratica', name: 'Prática séria', description: 'Ensina algo aplicável passo a passo', color: '#d97706' },
  { id: 'bastidores', name: 'Bastidores e prova', description: 'Mostra processo real, resultados, dia a dia', color: '#7c3aed' },
  { id: 'oferta', name: 'Oferta clara', description: 'Apresenta serviço, curso ou produto diretamente', color: '#dc2626' }
];

const DEFAULT_THEMES = [
  'dúvidas frequentes', 'mitos e verdades', 'bastidores', 'prática guiada',
  'depoimento genérico', 'oferta de serviço', 'reflexão', 'dica prática',
  'pergunta para a audiência', 'estudo de caso', 'ferramenta', 'mentalidade'
];

/* ==========================================================================
   Utilitários DOM
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showTab(tabName) {
  $$('.tab-panel').forEach(p => { p.hidden = true; p.classList.remove('active'); });
  $$('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
  const panel = $('#panel-' + tabName);
  const btn = $('#tab-' + tabName);
  if (panel) { panel.hidden = false; panel.classList.add('active'); }
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
}

function setBadge(text) {
  const badge = $('#data-badge');
  if (badge) badge.textContent = text;
}

function setLastUpdated(type, date) {
  const el = $('#last-updated');
  if (el) el.textContent = `Última atualização ${type}: ${date.toLocaleString('pt-BR')}`;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.showModal();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.close();
}

/* ==========================================================================
   Dados de Demonstração
   ========================================================================== */

function generateDemoOrganic() {
  const lines = DEFAULT_EDITORIAL_LINES.map(l => l.name);
  const formats = ['reel', 'carousel', 'photo', 'story'];
  const themes = DEFAULT_THEMES;
  const posts = [];
  // Gera datas nos últimos 90 dias para garantir que passem no filtro '30d'/'90d'
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 90);

  for (let i = 0; i < 35; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 90));
    const format = formats[Math.floor(Math.random() * formats.length)];
    const line = lines[Math.floor(Math.random() * lines.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const isReel = format === 'reel';
    const baseReach = isReel ? 2000 : 800;
    const variance = 0.3 + Math.random() * 1.5;
    const reach = Math.round(baseReach * variance);
    const views = isReel ? Math.round(reach * (1.2 + Math.random() * 1.5)) : null;
    const likes = Math.round(reach * (0.02 + Math.random() * 0.08));
    const comments = Math.round(likes * (0.05 + Math.random() * 0.15));
    const saves = Math.round(likes * (0.03 + Math.random() * 0.12));
    const shares = Math.round(likes * (0.02 + Math.random() * 0.1));
    const profileVisits = Math.round(reach * (0.01 + Math.random() * 0.04));
    const linkClicks = Math.round(profileVisits * (0.1 + Math.random() * 0.3));
    const newFollowers = Math.round(reach * (0.002 + Math.random() * 0.008));

    posts.push({
      id: `demo_org_${i}`,
      data_publicacao: date.toISOString().split('T')[0],
      tipo_conteudo: format,
      titulo_interno: `${theme} - ${date.toLocaleDateString('pt-BR')}`,
      tema: theme,
      linha_editorial: line,
      link_post: null,
      alcance: reach,
      visualizacoes: views,
      curtidas: likes,
      comentarios: comments,
      salvamentos: saves,
      compartilhamentos: shares,
      visitas_perfil: profileVisits,
      cliques_link: linkClicks,
      seguidores_novos: newFollowers,
      origem_trafego: 'orgânico',
      pago_organico: 'organic',
      observacoes: null
    });
  }
  return posts.sort((a, b) => b.alcance - a.alcance);
}

function generateDemoAds() {
  const campaigns = [
    { id: 'camp_runas_01', name: 'Conversão - Curso Runas', objective: 'CONVERSIONS', status: 'active' },
    { id: 'camp_trafego_01', name: 'Tráfego - Link na Bio', objective: 'LINK_CLICKS', status: 'active' },
    { id: 'camp_brand_01', name: 'Reconhecimento - Marca', objective: 'BRAND_AWARENESS', status: 'paused' },
    { id: 'camp_mentoria_01', name: 'Conversão - Mentoria Q3', objective: 'CONVERSIONS', status: 'active' }
  ];
  const adsets = [
    { id: 'adset_bruxaria_01', name: 'Interesse Bruxaria', campaign_id: 'camp_runas_01' },
    { id: 'adset_lookalike_01', name: 'Lookalike Alunos', campaign_id: 'camp_runas_01' },
    { id: 'adset_engajados_01', name: 'Engajados 30d', campaign_id: 'camp_trafego_01' },
    { id: 'adset_ocultismo_01', name: 'Interesse Ocultismo', campaign_id: 'camp_trafego_01' },
    { id: 'adset_amplo_01', name: 'Público Amplo Brasil', campaign_id: 'camp_brand_01' },
    { id: 'adset_avancado_01', name: 'Interesse Avançado', campaign_id: 'camp_mentoria_01' },
    { id: 'adset_retarget_01', name: 'Retargeting Site', campaign_id: 'camp_mentoria_01' }
  ];
  const ads = [
    { id: 'ad_runas_a', name: 'Anúncio Runas A', adset_id: 'adset_bruxaria_01', creative_id: 'crv_video_a', creative_name: 'Runas Video A', creative_type: 'video' },
    { id: 'ad_runas_b', name: 'Anúncio Runas B', adset_id: 'adset_bruxaria_01', creative_id: 'crv_carousel_b', creative_name: 'Runas Carousel B', creative_type: 'carousel' },
    { id: 'ad_runas_c', name: 'Anúncio Runas C', adset_id: 'adset_lookalike_01', creative_id: 'crv_image_c', creative_name: 'Runas Image C', creative_type: 'image' },
    { id: 'ad_runas_d', name: 'Anúncio Runas D', adset_id: 'adset_lookalike_01', creative_id: 'crv_video_d', creative_name: 'Runas Video D', creative_type: 'video' },
    { id: 'ad_link_a', name: 'Anúncio Link A', adset_id: 'adset_engajados_01', creative_id: 'crv_video_a', creative_name: 'Link Video A', creative_type: 'video' },
    { id: 'ad_link_b', name: 'Anúncio Link B', adset_id: 'adset_engajados_01', creative_id: 'crv_image_b', creative_name: 'Link Image B', creative_type: 'image' },
    { id: 'ad_link_c', name: 'Anúncio Link C', adset_id: 'adset_ocultismo_01', creative_id: 'crv_carousel_c', creative_name: 'Link Carousel C', creative_type: 'carousel' },
    { id: 'ad_brand_a', name: 'Anúncio Brand A', adset_id: 'adset_amplo_01', creative_id: 'crv_brand_video_a', creative_name: 'Brand Video A', creative_type: 'video' },
    { id: 'ad_brand_b', name: 'Anúncio Brand B', adset_id: 'adset_amplo_01', creative_id: 'crv_brand_image_b', creative_name: 'Brand Image B', creative_type: 'image' },
    { id: 'ad_mentoria_a', name: 'Anúncio Mentoria A', adset_id: 'adset_avancado_01', creative_id: 'crv_mentoria_video_a', creative_name: 'Mentoria Video A', creative_type: 'video' },
    { id: 'ad_mentoria_b', name: 'Anúncio Mentoria B', adset_id: 'adset_avancado_01', creative_id: 'crv_mentoria_carousel_b', creative_name: 'Mentoria Carousel B', creative_type: 'carousel' },
    { id: 'ad_mentoria_c', name: 'Anúncio Mentoria C', adset_id: 'adset_retarget_01', creative_id: 'crv_mentoria_image_c', creative_name: 'Mentoria Image C', creative_type: 'image' },
    { id: 'ad_mentoria_d', name: 'Anúncio Mentoria D', adset_id: 'adset_retarget_01', creative_id: 'crv_mentoria_video_d', creative_name: 'Mentoria Video D', creative_type: 'video' }
  ];

  // Gera datas nos últimos 90 dias
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 90);

  const adData = [
    // Runas - Bruxaria (duas semanas atrás)
    makeAd('camp_runas_01', 'Conversão - Curso Runas', 'adset_bruxaria_01', 'Interesse Bruxaria', 'ad_runas_a', 'Anúncio Runas A', 'crv_video_a', 'Runas Video A', 'video', 'CONVERSIONS', 'active', baseDate, 1450, 42300, 25800, 567, 445, 112, 23, 3420, 1.64),
    makeAd('camp_runas_01', 'Conversão - Curso Runas', 'adset_bruxaria_01', 'Interesse Bruxaria', 'ad_runas_b', 'Anúncio Runas B', 'crv_carousel_b', 'Runas Carousel B', 'carousel', 'CONVERSIONS', 'active', baseDate, 1440, 36600, 22400, 556, 447, 122, 22, 3360, 1.63),
    makeAd('camp_runas_01', 'Conversão - Curso Runas', 'adset_lookalike_01', 'Lookalike Alunos', 'ad_runas_c', 'Anúncio Runas C', 'crv_image_c', 'Runas Image C', 'image', 'CONVERSIONS', 'active', baseDate, 1280, 34500, 21200, 489, 378, 98, 21, 2890, 1.63),
    makeAd('camp_runas_01', 'Conversão - Curso Runas', 'adset_lookalike_01', 'Lookalike Alunos', 'ad_runas_d', 'Anúncio Runas D', 'crv_video_d', 'Runas Video D', 'video', 'CONVERSIONS', 'active', baseDate, 1250, 32200, 19800, 522, 408, 91, 23, 2780, 1.63),
    // Tráfego - Link na Bio (uma semana atrás)
    makeAd('camp_trafego_01', 'Tráfego - Link na Bio', 'adset_engajados_01', 'Engajados 30d', 'ad_link_a', 'Anúncio Link A', 'crv_video_a', 'Link Video A', 'video', 'LINK_CLICKS', 'active', addDays(baseDate, 7), 890, 28900, 17800, 523, 432, 108, 0, 0, 1.62),
    makeAd('camp_trafego_01', 'Tráfego - Link na Bio', 'adset_engajados_01', 'Engajados 30d', 'ad_link_b', 'Anúncio Link B', 'crv_image_b', 'Link Image B', 'image', 'LINK_CLICKS', 'active', addDays(baseDate, 7), 790, 23400, 14300, 464, 380, 93, 0, 0, 1.64),
    makeAd('camp_trafego_01', 'Tráfego - Link na Bio', 'adset_ocultismo_01', 'Interesse Ocultismo', 'ad_link_c', 'Anúncio Link C', 'crv_carousel_c', 'Link Carousel C', 'carousel', 'LINK_CLICKS', 'active', addDays(baseDate, 7), 1530, 46400, 30200, 889, 731, 186, 0, 0, 1.54),
    // Brand (três semanas atrás)
    makeAd('camp_brand_01', 'Reconhecimento - Marca', 'adset_amplo_01', 'Público Amplo Brasil', 'ad_brand_a', 'Anúncio Brand A', 'crv_brand_video_a', 'Brand Video A', 'video', 'BRAND_AWARENESS', 'paused', addDays(baseDate, 21), 950, 62300, 39800, 345, 0, 0, 0, 0, 1.57),
    makeAd('camp_brand_01', 'Reconhecimento - Marca', 'adset_amplo_01', 'Público Amplo Brasil', 'ad_brand_b', 'Anúncio Brand B', 'crv_brand_image_b', 'Brand Image B', 'image', 'BRAND_AWARENESS', 'paused', addDays(baseDate, 21), 940, 61100, 39100, 333, 0, 0, 0, 0, 1.56),
    // Mentoria (quatro semanas atrás)
    makeAd('camp_mentoria_01', 'Conversão - Mentoria Q3', 'adset_avancado_01', 'Interesse Avançado', 'ad_mentoria_a', 'Anúncio Mentoria A', 'crv_mentoria_video_a', 'Mentoria Video A', 'video', 'CONVERSIONS', 'active', addDays(baseDate, 28), 1180, 32100, 19800, 489, 392, 98, 19, 2680, 1.62),
    makeAd('camp_mentoria_01', 'Conversão - Mentoria Q3', 'adset_avancado_01', 'Interesse Avançado', 'ad_mentoria_b', 'Anúncio Mentoria B', 'crv_mentoria_carousel_b', 'Mentoria Carousel B', 'carousel', 'CONVERSIONS', 'active', addDays(baseDate, 28), 1160, 31300, 19100, 498, 397, 100, 19, 2550, 1.64),
    makeAd('camp_mentoria_01', 'Conversão - Mentoria Q3', 'adset_retarget_01', 'Retargeting Site', 'ad_mentoria_c', 'Anúncio Mentoria C', 'crv_mentoria_image_c', 'Mentoria Image C', 'image', 'CONVERSIONS', 'active', addDays(baseDate, 28), 890, 24500, 15200, 389, 312, 78, 17, 2340, 1.61),
    makeAd('camp_mentoria_01', 'Conversão - Mentoria Q3', 'adset_retarget_01', 'Retargeting Site', 'ad_mentoria_d', 'Anúncio Mentoria D', 'crv_mentoria_video_d', 'Mentoria Video D', 'video', 'CONVERSIONS', 'active', addDays(baseDate, 28), 890, 24400, 14800, 413, 322, 80, 17, 2280, 1.65)
  ];

  function makeAd(campaign_id, campaign_name, adset_id, adset_name, ad_id, ad_name, creative_id, creative_name, creative_type, objective, status, date, spend, impressions, reach, clicks, link_clicks, profile_visits, conversions, revenue, frequency) {
    const d = new Date(date);
    const data_inicio = d.toISOString().split('T')[0];
    const d2 = new Date(d);
    d2.setDate(d2.getDate() + 14);
    const data_fim = d2.toISOString().split('T')[0];
    return { campaign_id, campaign_name, adset_id, adset_name, ad_id, ad_name, creative_id, creative_name, creative_type, objective, status, data_inicio, data_fim, spend, impressions, reach, clicks, link_clicks, profile_visits, conversions, revenue, frequency };
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  return adData.map(d => ({
    account_id: 'act_788838833086433',
    campaign_id: d.campaign_id,
    campaign_name: d.campaign_name,
    adset_id: d.adset_id,
    adset_name: d.adset_name,
    ad_id: d.ad_id,
    ad_name: d.ad_name,
    creative_id: d.creative_id,
    creative_name: d.creative_name,
    creative_type: d.creative_type,
    objective: d.objective,
    status: d.status,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    attribution_window: '7d_click',
    data_inicio: d.data_inicio,
    data_fim: d.data_fim,
    investimento: d.spend,
    impressoes: d.impressions,
    alcance: d.reach,
    cliques: d.clicks,
    cliques_link: d.link_clicks,
    visitas_perfil: d.profile_visits,
    conversoes: d.conversions,
    receita_atribuida: d.revenue,
    frequencia: d.frequency
  }));
}

/* ==========================================================================
   Inicialização
   ========================================================================== */

function init() {
  // Carrega dados demo
  state.organicPosts = generateDemoOrganic();
  state.adsRows = generateDemoAds();
  state.editorialLines = [...DEFAULT_EDITORIAL_LINES];
  state.isDemoData = true;
  setBadge('Dados de demonstração');

  // Event listeners
  bindEvents();

  // Render inicial
  renderAll();

  console.log('Content Signal iniciado com dados de demonstração');
}

function bindEvents() {
  // Tabs
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  // Import buttons
  $('#import-organic')?.addEventListener('click', () => openImportModal('organic'));
  $('#import-ads')?.addEventListener('click', () => openImportModal('ads'));

  // Period selector
  $('#period-select')?.addEventListener('change', (e) => {
    state.currentPeriod = e.target.value;
    renderAll();
  });

  // Editorial lines
  $('#add-editorial-line')?.addEventListener('click', () => openEditorialLineModal());
  $('#editorial-line-form')?.addEventListener('submit', saveEditorialLine);
  $$('#editorial-line-modal .modal-close, #editorial-line-modal .modal-cancel')
    .forEach(btn => btn.addEventListener('click', () => closeModal('editorial-line-modal')));

  // Ideas
  $('#add-idea')?.addEventListener('click', () => openIdeaModal());
  $('#idea-form')?.addEventListener('submit', saveIdea);
  $$('#idea-modal .modal-close, #idea-modal .modal-cancel')
    .forEach(btn => btn.addEventListener('click', () => closeModal('idea-modal')));

  // Filters
  $('#ranking-metric, #ranking-direction, #ranking-limit')?.forEach(el => {
    el?.addEventListener('change', () => renderRanking());
  });

  $('#theme-filter-line')?.addEventListener('change', () => renderThemes());
  $('#ads-level-select, #ads-sort-select')?.forEach(el => {
    el?.addEventListener('change', () => renderAds());
  });

  // Idea filters
  $$('#idea-filter-line, #idea-filter-theme, #idea-filter-format, #idea-filter-status, #idea-filter-ad-potential')
    .forEach(el => el?.addEventListener('change', () => renderIdeas()));

  // CSV Import Modal
  $$('#csv-import-modal .modal-close, #csv-import-modal .modal-cancel')
    .forEach(btn => btn.addEventListener('click', () => closeModal('csv-import-modal')));
  $('#csv-file')?.addEventListener('change', handleFileSelect);
  $('#download-template')?.addEventListener('click', downloadTemplate);
  $('#restore-demo')?.addEventListener('click', restoreDemoData);
  $('#confirm-import')?.addEventListener('click', confirmImport);

  // Post detail modal
  $$('#post-detail-modal .modal-close').forEach(btn => btn.addEventListener('click', () => closeModal('post-detail-modal')));

  // Modal backdrop click to close
  $$('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  });

  // Keyboard: Escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal[open]').forEach(m => m.close());
    }
  });
}

/* ==========================================================================
   Render Principal
   ========================================================================== */

function renderAll() {
  renderDiagnostico();
  renderEditoriais();
  renderAds();
  updateIdeaFilters();
}

function filterByPeriod(posts, period) {
  if (period === 'custom' || !posts.length) return posts;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return posts.filter(p => {
    const postDate = new Date(p.data_publicacao || p.data_inicio);
    return postDate >= cutoff;
  });
}

/* ==========================================================================
   ABA 1: DIAGNÓSTICO
   ========================================================================== */

function renderDiagnostico() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const agg = aggregateOrganic(posts);

  if (!agg) {
    renderEmptyDiagnostico();
    return;
  }

  // Visão Geral - KPIs
  renderKPIs(agg);

  // Desempenho por Formato
  renderFormatPerformance(agg);

  // Ranking
  renderRanking();

  // Reels
  renderReels(posts);

  // Funil Orgânico
  renderFunnelOrganic(agg);

  // Diagnóstico Automático
  renderAutoDiagnosis(posts, agg);
}

function renderEmptyDiagnostico() {
  $('#kpi-overview').innerHTML = '<p class="empty-state">Nenhum dado orgânico carregado. Importe um CSV ou use os dados de demonstração.</p>';
  $('#table-format-performance tbody').innerHTML = '';
  $('#table-ranking tbody').innerHTML = '';
  $('#kpi-reels').innerHTML = '';
  $('#table-reels tbody').innerHTML = '';
  $('#funnel-organic .funnel-value').forEach(el => el.textContent = '—');
  $('#auto-diagnosis').innerHTML = '<p class="empty-state">Importe dados para ver o diagnóstico.</p>';
}

function renderKPIs(agg) {
  const totals = agg.totals;
  const count = agg.count;
  const avgs = agg.averages;

  const saveRate = safePercent(totals.salvamentos, totals.alcance);
  const shareRate = safePercent(totals.compartilhamentos, totals.alcance);
  const clickRate = safePercent(totais.cliques_link, totals.alcance);

  const kpis = [
    { label: 'Publicações', value: count, primary: true },
    { label: 'Alcance total', value: formatNumber(totals.alcance), primary: true },
    { label: 'Alcance médio', value: formatNumber(avgs.alcance), primary: true },
    { label: 'Visualizações totais', value: formatNumber(totals.visualizacoes) },
    { label: 'Curtidas', value: formatNumber(totals.curtidas) },
    { label: 'Comentários', value: formatNumber(totals.comentarios) },
    { label: 'Salvamentos', value: formatNumber(totals.salvamentos) },
    { label: 'Compartilhamentos', value: formatNumber(totals.compartilhamentos) },
    { label: 'Visitas ao perfil', value: formatNumber(totals.visitas_perfil) },
    { label: 'Cliques no link', value: formatNumber(totals.cliques_link) },
    { label: 'Seguidores novos', value: formatNumber(totals.seguidores_novos) },
    { label: 'Taxa salv./alcance', value: formatPercent(saveRate, 2) },
    { label: 'Taxa compart./alcance', value: formatPercent(shareRate, 2) },
    { label: 'Taxa cliques/alcance', value: formatPercent(clickRate, 2) }
  ];

  $('#kpi-overview').innerHTML = kpis.map((kpi, i) => `
    <div class="kpi-card ${kpi.primary ? 'primary' : ''}">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
    </div>
  `).join('');
}

function renderFormatPerformance(agg) {
  const formats = ['reel', 'carousel', 'photo', 'story'];
  const formatLabels = { reel: 'Reels', carousel: 'Carrosséis', photo: 'Fotos', story: 'Stories' };

  // Table
  const tbody = $('#table-format-performance tbody');
  tbody.innerHTML = formats.map(fmt => {
    const data = agg.byFormat[fmt];
    if (!data) return '<tr><td colspan="13" class="unavailable">Sem dados</td></tr>';

    const avgs = data.averages;
    const saveRate = safePercent(avgs.salvamentos, avgs.alcance);
    const shareRate = safePercent(avgs.compartilhamentos, avgs.alcance);
    const clickRate = safePercent(avgs.cliques_link, avgs.alcance);

    return `
      <tr>
        <td><span class="badge badge-format-${fmt}">${formatLabels[fmt]}</span></td>
        <td class="numeric">${data.count}</td>
        <td class="numeric">${formatNumber(avgs.alcance)}</td>
        <td class="numeric">${formatNumber(avgs.visualizacoes)}</td>
        <td class="numeric">${formatNumber(avgs.curtidas)}</td>
        <td class="numeric">${formatNumber(avgs.comentarios)}</td>
        <td class="numeric">${formatNumber(avgs.salvamentos)}</td>
        <td class="numeric">${formatNumber(avgs.compartilhamentos)}</td>
        <td class="numeric">${formatNumber(avgs.visitas_perfil)}</td>
        <td class="numeric">${formatNumber(avgs.cliques_link)}</td>
        <td class="numeric">${formatPercent(saveRate, 2)}</td>
        <td class="numeric">${formatPercent(shareRate, 2)}</td>
        <td class="numeric">${formatPercent(clickRate, 2)}</td>
      </tr>
    `;
  }).join('');

  // Charts
  const labels = formats.filter(f => agg.byFormat[f]).map(f => formatLabels[f]);
  const reachValues = labels.map(l => {
    const fmt = Object.keys(formatLabels).find(k => formatLabels[k] === l);
    return agg.byFormat[fmt]?.averages?.alcance || 0;
  });
  const saveRates = labels.map(l => {
    const fmt = Object.keys(formatLabels).find(k => formatLabels[k] === l);
    const avgs = agg.byFormat[fmt]?.averages;
    return safePercent(avgs?.salvamentos, avgs?.alcance) || 0;
  });

  renderBarChart('chart-format-reach', { labels, values: reachValues }, {
    labels, values: reachValues,
    formatValue: formatNumber,
    barColor: getColors().primary
  });

  renderBarChart('chart-format-save-rate', { labels, values: saveRates }, {
    labels, values: saveRates,
    formatValue: v => formatPercent(v, 1),
    barColor: getColors().success
  });
}

function renderRanking() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const metric = $('#ranking-metric')?.value || 'alcance';
  const direction = $('#ranking-direction')?.value || 'desc';
  const limit = parseInt($('#ranking-limit')?.value || '10');

  const ranked = rankPosts(posts, metric, direction, limit);

  const metricLabels = {
    alcance: 'Alcance', views: 'Visualizações', saves: 'Salvamentos',
    shares: 'Compartilhamentos', comments: 'Comentários',
    profile_visits: 'Visitas perfil', link_clicks: 'Cliques link',
    new_followers: 'Seg. novos', engagement: 'Engajamento'
  };

  const fieldMap = {
    alcance: 'alcance', views: 'visualizacoes', saves: 'salvamentos',
    shares: 'compartilhamentos', comments: 'comentarios',
    profile_visits: 'visitas_perfil', link_clicks: 'cliques_link',
    new_followers: 'seguidores_novos',
    engagement: (p) => (p.curtidas||0)+(p.comentarios||0)+(p.salvamentos||0)+(p.compartilhamentos||0)
  };

  const tbody = $('#table-ranking tbody');
  tbody.innerHTML = ranked.map((post, i) => {
    const value = typeof fieldMap[metric] === 'function' ? fieldMap[metric](post) : post[fieldMap[metric]];
    const rates = calculateRates(post);
    return `
      <tr>
        <td class="numeric">${direction === 'desc' ? i + 1 : ranked.length - i}</td>
        <td>${formatDate(post.data_publicacao)}</td>
        <td><span class="badge badge-format-${post.tipo_conteudo}">${formatLabel(post.tipo_conteudo)}</span></td>
        <td>${post.tema || '—'}</td>
        <td>${post.linha_editorial}</td>
        <td class="numeric">${formatNumber(post.alcance)}</td>
        <td class="numeric">${formatNumber(post.visualizacoes)}</td>
        <td class="numeric">${formatNumber(post.curtidas)}</td>
        <td class="numeric">${formatNumber(post.comentarios)}</td>
        <td class="numeric">${formatNumber(post.salvamentos)}</td>
        <td class="numeric">${formatNumber(post.compartilhamentos)}</td>
        <td class="numeric">${formatNumber(post.visitas_perfil)}</td>
        <td class="numeric">${formatNumber(post.cliques_link)}</td>
        <td>
          <button class="btn-icon" data-post-id="${post.id}" aria-label="Ver detalhes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Bind detail buttons
  $$('#table-ranking .btn-icon').forEach(btn => {
    btn.addEventListener('click', () => showPostDetail(btn.dataset.postId));
  });
}

function formatLabel(fmt) {
  const labels = { reel: 'Reels', carousel: 'Carrosséis', photo: 'Fotos', story: 'Stories' };
  return labels[fmt] || fmt;
}

function showPostDetail(postId) {
  const post = state.organicPosts.find(p => p.id === postId);
  if (!post) return;

  const rates = calculateRates(post);
  $('#modal-title').textContent = post.titulo_interno || post.tema || 'Detalhes do post';
  $('#modal-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">Data</span><span class="detail-value">${formatDate(post.data_publicacao)}</span></div>
      <div class="detail-item"><span class="detail-label">Formato</span><span class="detail-value"><span class="badge badge-format-${post.tipo_conteudo}">${formatLabel(post.tipo_conteudo)}</span></span></div>
      <div class="detail-item"><span class="detail-label">Tema</span><span class="detail-value">${post.tema || '—'}</span></div>
      <div class="detail-item"><span class="detail-label">Linha editorial</span><span class="detail-value">${post.linha_editorial}</span></div>
      <div class="detail-item"><span class="detail-label">Origem</span><span class="detail-value">${post.pago_organico || 'não informado'}</span></div>
      <div class="detail-item"><span class="detail-label">Alcance</span><span class="detail-value">${formatNumber(post.alcance)}</span></div>
      <div class="detail-item"><span class="detail-label">Visualizações</span><span class="detail-value">${formatNumber(post.visualizacoes)}</span></div>
      <div class="detail-item"><span class="detail-label">Curtidas</span><span class="detail-value">${formatNumber(post.curtidas)}</span></div>
      <div class="detail-item"><span class="detail-label">Comentários</span><span class="detail-value">${formatNumber(post.comentarios)}</span></div>
      <div class="detail-item"><span class="detail-label">Salvamentos</span><span class="detail-value">${formatNumber(post.salvamentos)}</span></div>
      <div class="detail-item"><span class="detail-label">Compartilhamentos</span><span class="detail-value">${formatNumber(post.compartilhamentos)}</span></div>
      <div class="detail-item"><span class="detail-label">Visitas ao perfil</span><span class="detail-value">${formatNumber(post.visitas_perfil)}</span></div>
      <div class="detail-item"><span class="detail-label">Cliques no link</span><span class="detail-value">${formatNumber(post.cliques_link)}</span></div>
      <div class="detail-item"><span class="detail-label">Seguidores novos</span><span class="detail-value">${formatNumber(post.seguidores_novos)}</span></div>
      <div class="detail-item"><span class="detail-label">Taxa salv./alc.</span><span class="detail-value">${formatPercent(rates.saveRate, 2)}</span></div>
      <div class="detail-item"><span class="detail-label">Taxa compart./alc.</span><span class="detail-value">${formatPercent(rates.shareRate, 2)}</span></div>
      <div class="detail-item"><span class="detail-label">Taxa cliques/alc.</span><span class="detail-value">${formatPercent(rates.clickRate, 2)}</span></div>
      ${post.link_post ? `<div class="detail-item full"><span class="detail-label">Link</span><a class="detail-value" href="${post.link_post}" target="_blank" rel="noopener">${post.link_post}</a></div>` : ''}
      ${post.observacoes ? `<div class="detail-item full"><span class="detail-label">Observações</span><span class="detail-value">${post.observacoes}</span></div>` : ''}
    </div>
  `;
  openModal('post-detail-modal');
}

function renderReels(posts) {
  const reels = posts.filter(p => p.tipo_conteudo === 'reel');

  if (!reels.length) {
    $('#kpi-reels').innerHTML = '<p class="empty-state">Nenhum Reel no período.</p>';
    $('#table-reels tbody').innerHTML = '';
    renderRetentionChart('chart-reels-retention', {});
    renderScatterChart('chart-reels-conversion', { points: [] }, { xKey: 'views', yKey: 'clicks', xLabel: 'Visualizações', yLabel: 'Cliques no link' });
    return;
  }

  const totalViews = reels.reduce((sum, r) => sum + (r.visualizacoes || 0), 0);
  const avgViews = totalViews / reels.length;
  const avgReach = reels.reduce((sum, r) => sum + (r.alcance || 0), 0) / reels.length;
  const totalSaves = reels.reduce((sum, r) => sum + (r.salvamentos || 0), 0);
  const totalShares = reels.reduce((sum, r) => sum + (r.compartilhamentos || 0), 0);
  const totalComments = reels.reduce((sum, r) => sum + (r.comentarios || 0), 0);
  const totalProfileVisits = reels.reduce((sum, r) => sum + (r.visitas_perfil || 0), 0);
  const totalLinkClicks = reels.reduce((sum, r) => sum + (r.cliques_link || 0), 0);
  const totalNewFollowers = reels.reduce((sum, r) => sum + (r.seguidores_novos || 0), 0);

  const kpis = [
    { label: 'Total de Reels', value: reels.length },
    { label: 'Visualizações totais', value: formatNumber(totalViews) },
    { label: 'Visualizações médias', value: formatNumber(avgViews) },
    { label: 'Alcance médio', value: formatNumber(avgReach) },
    { label: 'Salvamentos', value: formatNumber(totalSaves) },
    { label: 'Compartilhamentos', value: formatNumber(totalShares) },
    { label: 'Comentários', value: formatNumber(totalComments) },
    { label: 'Visitas ao perfil', value: formatNumber(totalProfileVisits) },
    { label: 'Cliques no link', value: formatNumber(totalLinkClicks) },
    { label: 'Seguidores novos', value: formatNumber(totalNewFollowers) }
  ];

  $('#kpi-reels').innerHTML = kpis.map(kpi => `
    <div class="kpi-card">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
    </div>
  `).join('');

  // Table
  const tbody = $('#table-reels tbody');
  tbody.innerHTML = reels
    .sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
    .map(reel => {
      const rates = calculateRates(reel);
      const lowRetention = reel.visualizacoes && reel.alcance && (reel.visualizacoes / reel.alcance) < 1.2;
      const lowConversion = reel.visitas_perfil && reel.visualizacoes && (reel.visitas_perfil / reel.visualizacoes) < 0.02;
      let diagnostic = 'Desempenho dentro do esperado';
      if (lowRetention && lowConversion) diagnostic = '⚠ Baixa retenção e baixa conversão';
      else if (lowRetention) diagnostic = '⚠ Boa visualização, baixa retenção';
      else if (lowConversion) diagnostic = '⚠ Boa retenção, baixa conversão';
      else if (rates.saveRate && rates.saveRate > 5) diagnostic = '✓ Alto potencial de salvamento';
      else if (rates.shareRate && rates.shareRate > 2) diagnostic = '✓ Alto potencial de compartilhamento';

      return `
        <tr>
          <td>${formatDate(reel.data_publicacao)}</td>
          <td>${reel.tema || '—'}</td>
          <td class="numeric">${formatNumber(reel.visualizacoes)}</td>
          <td class="numeric">${formatNumber(reel.alcance)}</td>
          <td class="unavailable">—</td>
          <td class="unavailable">—</td>
          <td class="unavailable">—</td>
          <td class="numeric">${formatNumber(reel.salvamentos)}</td>
          <td class="numeric">${formatNumber(reel.compartilhamentos)}</td>
          <td class="numeric">${formatNumber(reel.visitas_perfil)}</td>
          <td class="numeric">${formatNumber(reel.cliques_link)}</td>
          <td>${diagnostic}</td>
        </tr>
      `;
    }).join('');

  // Charts
  renderRetentionChart('chart-reels-retention', {});

  const scatterPoints = reels.filter(r => r.visualizacoes && r.cliques_link).map(r => ({
    x: r.visualizacoes, y: r.cliques_link, color: getColors().primary,
    label: reel.tema || formatDate(reel.data_publicacao)
  }));
  renderScatterChart('chart-reels-conversion', { points: scatterPoints }, {
    xKey: 'x', yKey: 'y', xLabel: 'Visualizações', yLabel: 'Cliques no link',
    xFormat: formatNumber, yFormat: formatNumber, quadrants: true
  });
}

function renderFunnelOrganic(agg) {
  const funnel = calculateFunnelOrganic(agg);
  if (!funnel) return;

  $('#funnel-reach').textContent = formatNumber(funnel.reach);
  $('#funnel-reach').classList.toggle('unavailable', !funnel.reach);

  $('#funnel-profile-visits').textContent = formatNumber(funnel.profileVisits);
  $('#funnel-profile-visits').classList.toggle('unavailable', !funnel.profileVisits);
  $('#rate-reach-profile').textContent = funnel.rateReachProfile !== null ? formatPercent(funnel.rateReachProfile, 2) : '—';
  $('#rate-reach-profile').className = 'funnel-rate ' + (funnel.rateReachProfile !== null && funnel.rateReachProfile > 2 ? 'positive' : 'negative');

  $('#funnel-link-clicks').textContent = formatNumber(funnel.linkClicks);
  $('#funnel-link-clicks').classList.toggle('unavailable', !funnel.linkClicks);
  $('#rate-profile-clicks').textContent = funnel.rateProfileClicks !== null ? formatPercent(funnel.rateProfileClicks, 1) : '—';
  $('#rate-profile-clicks').className = 'funnel-rate ' + (funnel.rateProfileClicks !== null && funnel.rateProfileClicks > 5 ? 'positive' : 'negative');

  $('#funnel-dms').textContent = '—';
  $('#funnel-dms').classList.add('unavailable');
  $('#rate-clicks-dms').textContent = '—';

  $('#funnel-conversions').textContent = '—';
  $('#funnel-conversions').classList.add('unavailable');
  $('#rate-dms-conversions').textContent = '—';
}

function renderAutoDiagnosis(posts, agg) {
  const diagnosis = diagnoseOrganic(agg, posts);
  const container = $('#auto-diagnosis');

  if (!diagnosis.length) {
    container.innerHTML = '<p class="empty-state">Dados insuficientes para diagnóstico automático.</p>';
    return;
  }

  container.innerHTML = diagnosis.map(item => `
    <div class="diagnosis-item ${item.type}">
      <div class="diagnosis-header">
        <div class="diagnosis-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            ${item.type === 'alert' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' :
              item.type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
              item.type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' :
              '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
          </svg>
        </div>
        <div class="diagnosis-title">${item.title}</div>
      </div>
      <div class="diagnosis-body">
        ${item.body.map(b => `<p><span class="diagnosis-label ${b.label}">${labelText(b.label)}</span>${b.text}</p>`).join('')}
      </div>
    </div>
  `).join('');
}

function labelText(label) {
  const texts = {
    'label-measured': 'Dado medido',
    'label-unavailable': 'Dado não disponível',
    'label-hypothesis': 'Hipótese a validar',
    'label-action': 'Ação sugerida'
  };
  return texts[label] || label;
}

/* ==========================================================================
   ABA 2: LINHAS EDITORIAIS
   ========================================================================== */

function renderEditoriais() {
  renderEditorialLines();
  renderEditorialComparison();
  renderThemes();
  renderPrioritization();
  renderIdeas();
  updateEditorialLineSelects();
}

function renderEditorialLines() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const lines = state.editorialLines;

  const tbody = $('#table-editorial-lines tbody');
  tbody.innerHTML = lines.map(line => {
    const linePosts = posts.filter(p => p.linha_editorial === line.name);
    if (!linePosts.length) {
      return `
        <tr>
          <td>${line.name}</td>
          <td class="numeric">0</td>
          <td class="unavailable" colspan="13">Sem posts nesta linha</td>
          <td><button class="btn-icon" data-line-id="${line.id}" aria-label="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>
        </tr>
      `;
    }

    const agg = aggregateOrganic(linePosts);
    const totals = agg.totals;
    const avgs = agg.averages;
    const saveRate = safePercent(totals.salvamentos, totals.alcance);
    const shareRate = safePercent(totals.compartilhamentos, totals.alcance);
    const clickRate = safePercent(totals.cliques_link, totals.alcance);

    const themes = [...new Set(linePosts.map(p => p.tema).filter(Boolean))].slice(0, 3).join(', ') || '—';
    const bestPost = linePosts.sort((a, b) => (b.alcance || 0) - (a.alcance || 0))[0];
    const worstPost = linePosts.sort((a, b) => (a.alcance || 0) - (b.alcance || 0))[0];

    return `
      <tr>
        <td style="border-left: 3px solid ${line.color};">${line.name}</td>
        <td class="numeric">${linePosts.length}</td>
        <td class="numeric">${formatNumber(totals.alcance)}</td>
        <td class="numeric">${formatNumber(avgs.alcance)}</td>
        <td class="numeric">${formatNumber(avgs.visualizacoes)}</td>
        <td class="numeric">${formatNumber(avgs.curtidas)}</td>
        <td class="numeric">${formatNumber(avgs.comentarios)}</td>
        <td class="numeric">${formatNumber(avgs.salvamentos)}</td>
        <td class="numeric">${formatNumber(avgs.compartilhamentos)}</td>
        <td class="numeric">${formatNumber(avgs.visitas_perfil)}</td>
        <td class="numeric">${formatNumber(avgs.cliques_link)}</td>
        <td class="numeric">${formatNumber(avgs.seguidores_novos)}</td>
        <td class="numeric">${formatPercent(saveRate, 2)}</td>
        <td class="numeric">${formatPercent(shareRate, 2)}</td>
        <td class="numeric">${formatPercent(clickRate, 2)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" data-line-id="${line.id}" aria-label="Editar linha" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" data-line-id="${line.id}" aria-label="Excluir linha" title="Excluir" style="color: var(--color-alert);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind actions
  $$('#table-editorial-lines .btn-icon[aria-label="Editar linha"]').forEach(btn => {
    btn.addEventListener('click', () => openEditorialLineModal(btn.dataset.lineId));
  });
  $$('#table-editorial-lines .btn-icon[aria-label="Excluir linha"]').forEach(btn => {
    btn.addEventListener('click', () => deleteEditorialLine(btn.dataset.lineId));
  });
}

function openEditorialLineModal(lineId = null) {
  const line = lineId ? state.editorialLines.find(l => l.id === lineId) : null;
  $('#editorial-line-modal-title').textContent = line ? 'Editar linha editorial' : 'Nova linha editorial';
  $('#editorial-line-id').value = line?.id || '';
  $('#editorial-line-name').value = line?.name || '';
  $('#editorial-line-description').value = line?.description || '';
  $('#editorial-line-color').value = line?.color || '#2563eb';
  openModal('editorial-line-modal');
}

function saveEditorialLine(e) {
  e.preventDefault();
  const id = $('#editorial-line-id').value;
  const name = $('#editorial-line-name').value.trim();
  const description = $('#editorial-line-description').value.trim();
  const color = $('#editorial-line-color').value;

  if (!name) return alert('Nome é obrigatório');

  if (id) {
    const idx = state.editorialLines.findIndex(l => l.id === id);
    if (idx >= 0) {
      state.editorialLines[idx] = { ...state.editorialLines[idx], name, description, color };
    }
  } else {
    const newId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    state.editorialLines.push({ id: newId, name, description, color });
  }

  closeModal('editorial-line-modal');
  renderEditorials();
}

function deleteEditorialLine(lineId) {
  if (!confirm('Excluir esta linha editorial? Os posts associados ficarão sem linha.')) return;
  state.editorialLines = state.editorialLines.filter(l => l.id !== lineId);
  renderEditorials();
}

function renderEditorialComparison() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const lines = state.editorialLines.filter(l => posts.some(p => p.linha_editorial === l.name));

  if (!lines.length) return;

  const groups = lines.map(line => {
    const linePosts = posts.filter(p => p.linha_editorial === line.name);
    const agg = aggregateOrganic(linePosts);
    return {
      label: line.name,
      values: [
        agg.averages?.alcance || 0,
        agg.averages?.salvamentos || 0,
        agg.averages?.compartilhamentos || 0,
        agg.averages?.visitas_perfil || 0
      ]
    };
  });

  const series = [
    { key: 'reach', label: 'Alcance médio', color: getColors().primary },
    { key: 'saves', label: 'Salvamentos médios', color: getColors().success },
    { key: 'shares', label: 'Compart. médios', color: getColors().warning },
    { key: 'visits', label: 'Visitas perfil', color: '#7c3aed' }
  ];

  renderGroupedBarChart('chart-editorial-reach', { groups, series }, {
    groups: groups.map(g => ({ label: g.label, values: [g.values[0]] })),
    series: [{ key: 'reach', label: 'Alcance médio', color: getColors().primary }],
    formatValue: formatNumber
  });

  renderGroupedBarChart('chart-editorial-saves', { groups, series }, {
    groups: groups.map(g => ({ label: g.label, values: [g.values[1]] })),
    series: [{ key: 'saves', label: 'Salvamentos médios', color: getColors().success }],
    formatValue: formatNumber
  });

  renderGroupedBarChart('chart-editorial-shares', { groups, series }, {
    groups: groups.map(g => ({ label: g.label, values: [g.values[2]] })),
    series: [{ key: 'shares', label: 'Compart. médios', color: getColors().warning }],
    formatValue: formatNumber
  });

  renderGroupedBarChart('chart-editorial-visits', { groups, series }, {
    groups: groups.map(g => ({ label: g.label, values: [g.values[3]] })),
    series: [{ key: 'visits', label: 'Visitas perfil', color: '#7c3aed' }],
    formatValue: formatNumber
  });
}

function renderThemes() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const filterLine = $('#theme-filter-line')?.value;
  const filteredPosts = filterLine ? posts.filter(p => p.linha_editorial === filterLine) : posts;

  const themes = {};
  filteredPosts.forEach(post => {
    if (!post.tema) return;
    if (!themes[post.tema]) themes[post.tema] = { posts: [], line: post.linha_editorial };
    themes[post.tema].posts.push(post);
  });

  const tbody = $('#table-themes tbody');
  tbody.innerHTML = Object.entries(themes)
    .map(([theme, data]) => {
      const agg = aggregateOrganic(data.posts);
      const avgs = agg.averages;
      const totals = agg.totals;
      const saveRate = safePercent(avgs?.salvamentos, avgs?.alcance);
      const shareRate = safePercent(avgs?.compartilhamentos, avgs?.alcance);
      let suggestion = 'Manter';
      if (totals.alcance && totals.alcance / data.posts.length < 200) suggestion = 'Ajustar (baixo alcance)';
      else if (saveRate && saveRate > 5) suggestion = '✓ Manter + replicar';
      else if (totals.comentarios && totals.comentarios / data.posts.length > 10) suggestion = '✓ Engajamento alto';

      return `
        <tr>
          <td>${data.line}</td>
          <td>${theme}</td>
          <td class="numeric">${data.posts.length}</td>
          <td class="numeric">${formatNumber(avgs?.alcance)}</td>
          <td class="numeric">${formatNumber(totals.salvamentos)}</td>
          <td class="numeric">${formatNumber(totals.compartilhamentos)}</td>
          <td class="numeric">${formatNumber(totals.comentarios)}</td>
          <td class="numeric">${formatNumber(totals.visitas_perfil)}</td>
          <td class="numeric">${formatNumber(totals.cliques_link)}</td>
          <td>${suggestion}</td>
        </tr>
      `;
    }).join('');
}

function renderPrioritization() {
  const posts = filterByPeriod(state.organicPosts, state.currentPeriod);
  const agg = aggregateOrganic(posts);
  if (!agg) {
    $('#prioritization-suggestions').innerHTML = '<p class="empty-state">Importe dados para ver sugestões.</p>';
    return;
  }

  const suggestions = [];

  // Linhas com melhor desempenho
  const linePerformance = Object.entries(agg.byEditorialLine || {})
    .map(([line, data]) => ({ line, avgReach: data.averages?.alcance || 0, count: data.count, saveRate: safePercent(data.averages?.salvamentos, data.averages?.alcance) }))
    .filter(l => l.count >= 2)
    .sort((a, b) => b.avgReach - a.avgReach);

  if (linePerformance.length) {
    const best = linePerformance[0];
    suggestions.push({
      type: 'success',
      title: `Priorizar linha: ${best.line}`,
      body: [
        { label: 'label-measured', text: `Alcance médio: ${formatNumber(best.avgReach)} (${best.count} posts)` },
        { label: 'label-action', text: 'Aumentar frequência desta linha em 20-30% nas próximas semanas' }
      ]
    });
  }

  // Temas com melhor save rate
  const themePerformance = Object.entries(agg.byTheme || {})
    .map(([theme, data]) => ({ theme, avgReach: data.averages?.alcance || 0, saveRate: safePercent(data.averages?.salvamentos, data.averages?.alcance), count: data.count }))
    .filter(t => t.count >= 2)
    .sort((a, b) => (b.saveRate || 0) - (a.saveRate || 0));

  if (themePerformance.length) {
    const best = themePerformance[0];
    suggestions.push({
      type: 'info',
      title: `Tema para série recorrente: ${best.theme}`,
      body: [
        { label: 'label-measured', text: `Taxa salvamento: ${formatPercent(best.saveRate, 2)} | Alcance médio: ${formatNumber(best.avgReach)}` },
        { label: 'label-action', text: 'Criar série semanal/quinzenal sobre este tema' }
      ]
    });
  }

  // Formatos
  const formatPerf = Object.entries(agg.byFormat || {})
    .map(([fmt, data]) => ({ fmt, avgReach: data.averages?.alcance || 0, count: data.count }))
    .filter(f => f.count >= 2)
    .sort((a, b) => b.avgReach - a.avgReach);

  if (formatPerf.length) {
    suggestions.push({
      type: 'success',
      title: `Formato principal: ${formatLabel(formatPerf[0].fmt)}`,
      body: [
        { label: 'label-measured', text: `Alcance médio: ${formatNumber(formatPerf[0].avgReach)} (${formatPerf[0].count} posts)` },
        { label: 'label-action', text: 'Concentrar 60%+ da produção neste formato' }
      ]
    });
  }

  // Linhas para testar
  const lowLines = linePerformance.filter(l => l.avgReach < 300).slice(0, 2);
  lowLines.forEach(l => {
    suggestions.push({
      type: 'warning',
      title: `Testar nova abordagem: ${l.line}`,
      body: [
        { label: 'label-measured', text: `Alcance médio: ${formatNumber(l.avgReach)} (${l.count} posts)` },
        { label: 'label-hypothesis', text: 'Formato, gancho ou tema podem não ressoar' },
        { label: 'label-action', text: 'Testar mesmo tema em Reels, mudar gancho inicial, ou pausar por 2 semanas' }
      ]
    });
  });

  // Potencial para anúncio
  const adCandidates = posts.filter(p => {
    const rates = calculateRates(p);
    return p.alcance && p.alcance > 500 && (rates.saveRate > 3 || rates.shareRate > 1);
  }).slice(0, 2);

  adCandidates.forEach(post => {
    suggestions.push({
      type: 'info',
      title: `Potencial para criativo pago: "${post.titulo_interno || post.tema}"`,
      body: [
        { label: 'label-measured', text: `Alcance orgânico: ${formatNumber(post.alcance)} | Salvamentos: ${formatPercent(calculateRates(post).saveRate, 2)}` },
        { label: 'label-hypothesis', text: 'Conteúdo que ressoa organicamente costuma performar bem pago' },
        { label: 'label-action', text: 'Testar como anúncio em campanha de conversão com público lookalike' }
      ]
    });
  });

  $('#prioritization-suggestions').innerHTML = suggestions.map(s => `
    <div class="suggestion-item">
      <div class="suggestion-header">
        <div class="suggestion-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            ${s.type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : s.type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' }
          </svg>
        </div>
        <div class="suggestion-title">${s.title}</div>
      </div>
      <div class="suggestion-body">
        ${s.body.map(b => `<p><span class="suggestion-label ${b.label}">${labelText(b.label)}</span>${b.text}</p>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderIdeas() {
  const tbody = $('#table-ideas tbody');
  let ideas = [...state.ideas];

  // Filters
  const lineFilter = $('#idea-filter-line')?.value;
  const themeFilter = $('#idea-filter-theme')?.value;
  const formatFilter = $('#idea-filter-format')?.value;
  const statusFilter = $('#idea-filter-status')?.value;
  const adFilter = $('#idea-filter-ad-potential')?.value;

  if (lineFilter) ideas = ideas.filter(i => i.line === lineFilter);
  if (themeFilter) ideas = ideas.filter(i => i.theme === themeFilter);
  if (formatFilter) ideas = ideas.filter(i => i.format === formatFilter);
  if (statusFilter) ideas = ideas.filter(i => i.status === statusFilter);
  if (adFilter) ideas = ideas.filter(i => i.adPotential === adFilter);

  tbody.innerHTML = ideas.map(idea => `
    <tr>
      <td>${idea.title}</td>
      <td>${idea.line}</td>
      <td>${idea.theme}</td>
      <td><span class="badge badge-format-${idea.format}">${formatLabel(idea.format)}</span></td>
      <td>${idea.hook || '—'}</td>
      <td>${idea.cta || '—'}</td>
      <td><span class="badge badge-status-${idea.status}">${idea.status}</span></td>
      <td><span class="badge badge-ad-${idea.adPotential}">${idea.adPotential}</span></td>
      <td>${idea.notes || '—'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" data-idea-id="${idea.id}" aria-label="Editar ideia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="btn-icon" data-idea-id="${idea.id}" aria-label="Excluir ideia" style="color: var(--color-alert);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');

  $$('#table-ideas .btn-icon[aria-label="Editar ideia"]').forEach(btn => {
    btn.addEventListener('click', () => openIdeaModal(btn.dataset.ideaId));
  });
  $$('#table-ideas .btn-icon[aria-label="Excluir ideia"]').forEach(btn => {
    btn.addEventListener('click', () => deleteIdea(btn.dataset.ideaId));
  });
}

function openIdeaModal(ideaId = null) {
  const idea = ideaId ? state.ideas.find(i => i.id === ideaId) : null;
  $('#idea-modal-title').textContent = idea ? 'Editar ideia' : 'Nova ideia';
  $('#idea-id').value = idea?.id || '';
  $('#idea-title').value = idea?.title || '';
  $('#idea-line').value = idea?.line || '';
  $('#idea-theme').value = idea?.theme || '';
  $('#idea-format').value = idea?.format || '';
  $('#idea-hook').value = idea?.hook || '';
  $('#idea-cta').value = idea?.cta || '';
  $('#idea-status').value = idea?.status || 'idea';
  $('#idea-ad-potential').value = idea?.adPotential || 'medium';
  $('#idea-notes').value = idea?.notes || '';
  openModal('idea-modal');
}

function saveIdea(e) {
  e.preventDefault();
  const id = $('#idea-id').value;
  const newIdea = {
    id: id || `idea_${Date.now()}`,
    title: $('#idea-title').value.trim(),
    line: $('#idea-line').value,
    theme: $('#idea-theme').value.trim(),
    format: $('#idea-format').value,
    hook: $('#idea-hook').value.trim(),
    cta: $('#idea-cta').value.trim(),
    status: $('#idea-status').value,
    adPotential: $('#idea-ad-potential').value,
    notes: $('#idea-notes').value.trim()
  };

  if (!newIdea.title || !newIdea.line || !newIdea.theme || !newIdea.format) {
    return alert('Preencha todos os campos obrigatórios');
  }

  if (id) {
    const idx = state.ideas.findIndex(i => i.id === id);
    if (idx >= 0) state.ideas[idx] = newIdea;
  } else {
    state.ideas.push(newIdea);
  }

  closeModal('idea-modal');
  renderIdeas();
}

function deleteIdea(ideaId) {
  if (!confirm('Excluir esta ideia?')) return;
  state.ideas = state.ideas.filter(i => i.id !== ideaId);
  renderIdeas();
}

function updateEditorialLineSelects() {
  const options = state.editorialLines.map(l => `<option value="${l.name}">${l.name}</option>`).join('');
  $$('#idea-line, #theme-filter-line').forEach(select => {
    if (select) select.innerHTML = '<option value="">Todas as linhas</option>' + options;
  });
}

function updateIdeaFilters() {
  const themes = [...new Set(state.organicPosts.map(p => p.tema).filter(Boolean))];
  const themeOptions = themes.map(t => `<option value="${t}">${t}</option>`).join('');
  const themeFilter = $('#idea-filter-theme');
  if (themeFilter) themeFilter.innerHTML = '<option value="">Todos os temas</option>' + themeOptions;
}

/* ==========================================================================
   ABA 3: META ADS
   ========================================================================== */

function renderAds() {
  renderAdsOverview();
  renderAdsHierarchy();
  renderCreativeAnalysis();
  renderFunnelPaid();
  renderAdsDiagnosis();
}

function renderAdsOverview() {
  const agg = aggregateAds(state.adsRows);
  if (!agg) {
    $('#kpi-ads-overview').innerHTML = '<p class="empty-state">Nenhum dado de anúncios carregado.</p>';
    return;
  }

  const totals = agg.totals;

  const kpis = [
    { label: 'Investimento total', value: formatCurrency(totals.investimento), primary: true },
    { label: 'Investimento médio/dia', value: formatCurrency(totals.avgDailySpend), primary: true },
    { label: 'Impressões', value: formatNumber(totals.impressoes) },
    { label: 'Alcance', value: formatNumber(totals.alcance) },
    { label: 'Cliques', value: formatNumber(totals.cliques) },
    { label: 'Cliques no link', value: formatNumber(totals.cliques_link) },
    { label: 'Visitas ao perfil', value: formatNumber(totals.visitas_perfil) },
    { label: 'Conversões', value: formatNumber(totals.conversoes) },
    { label: 'Receita atribuída', value: formatCurrency(totals.receita_atribuida) },
    { label: 'CPM', value: formatCurrency(totals.cpm) },
    { label: 'CPC', value: formatCurrency(totals.cpc) },
    { label: 'CTR', value: formatPercent(totals.ctr, 2) },
    { label: 'Custo por conversão', value: formatCurrency(totals.costPerConversion) },
    { label: 'ROAS', value: totals.roas !== null ? totals.roas.toFixed(2) + 'x' : '—' },
    { label: 'Frequência média', value: totals.frequencia ? totals.frequencia.toFixed(1) : '—' }
  ];

  $('#kpi-ads-overview').innerHTML = kpis.map(kpi => `
    <div class="kpi-card ${kpi.primary ? 'primary' : ''}">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
    </div>
  `).join('');
}

function renderAdsHierarchy() {
  const level = $('#ads-level-select')?.value || 'campaign';
  const sortBy = $('#ads-sort-select')?.value || 'investimento';
  const agg = aggregateAds(state.adsRows);
  if (!agg) {
    $('#table-ads tbody').innerHTML = '<tr><td colspan="17" class="unavailable">Sem dados de anúncios</td></tr>';
    return;
  }

  let items;
  switch (level) {
    case 'campaign': items = agg.byCampaign; break;
    case 'adset': items = agg.byAdset; break;
    case 'ad': items = agg.byAd; break;
    case 'creative': items = agg.byCreative; break;
    default: items = agg.byCampaign;
  }

  const sorted = sortAds(items, sortBy, 'desc');

  const tbody = $('#table-ads tbody');
  tbody.innerHTML = sorted.map(item => `
    <tr>
      <td><span class="badge">${level}</span></td>
      <td>${item.creative_name || item.ad_name || item.adset_name || item.campaign_name || '—'}</td>
      <td>${item.campaign_name || '—'}</td>
      <td>${item.adset_name || '—'}</td>
      <td>${item.objective || '—'}</td>
      <td>${item.status || '—'}</td>
      <td>${item.data_inicio ? formatDate(item.data_inicio) : '—'}${item.data_fim ? ' a ' + formatDate(item.data_fim) : ''}</td>
      <td class="numeric">${formatCurrency(item.investimento)}</td>
      <td class="numeric">${formatNumber(item.impressoes)}</td>
      <td class="numeric">${formatNumber(item.alcance)}</td>
      <td class="numeric">${formatNumber(item.cliques)}</td>
      <td class="numeric">${formatNumber(item.cliques_link)}</td>
      <td class="numeric">${formatPercent(item.ctr, 2)}</td>
      <td class="numeric">${formatCurrency(item.cpc)}</td>
      <td class="numeric">${formatNumber(item.conversoes)}</td>
      <td class="numeric">${formatCurrency(item.costPerConversion)}</td>
      <td class="numeric">${item.roas !== null ? item.roas.toFixed(2) + 'x' : '—'}</td>
    </tr>
  `).join('');
}

function renderCreativeAnalysis() {
  const agg = aggregateAds(state.adsRows);
  if (!agg) {
    $('#table-creatives tbody').innerHTML = '<tr><td colspan="18" class="unavailable">Sem dados de criativos</td></tr>';
    return;
  }

  const creatives = agg.byCreative
    .map(c => ({
      ...c,
      ctr: c.ctr || safePercent(c.cliques, c.impressoes),
      cpc: c.cpc || safeDivide(c.investimento, c.cliques),
      costPerConversion: c.costPerConversion || safeDivide(c.investimento, c.conversoes),
      roas: c.roas || safeDivide(c.receita_atribuida, c.investimento)
    }))
    .filter(c => c.impressoes && c.impressoes > 50);

  // Scatter: CTR vs Custo por conversão
  const scatter1 = creatives.filter(c => c.ctr !== null && c.costPerConversion !== null).map(c => ({
    x: c.ctr, y: c.costPerConversion, color: getColors().primary,
    label: c.creative_name
  }));
  renderScatterChart('chart-creative-ctr-cpc', { points: scatter1 }, {
    xKey: 'x', yKey: 'y', xLabel: 'CTR (%)', yLabel: 'Custo por conversão (R$)',
    xFormat: v => formatPercent(v, 2), yFormat: formatCurrency, quadrants: true
  });

  // Scatter: Investimento vs ROAS
  const scatter2 = creatives.filter(c => c.investimento && c.roas !== null).map(c => ({
    x: c.investimento, y: c.roas, color: getColors().success,
    label: c.creative_name
  }));
  renderScatterChart('chart-creative-spend-roas', { points: scatter2 }, {
    xKey: 'x', yKey: 'y', xLabel: 'Investimento (R$)', yLabel: 'ROAS',
    xFormat: formatCurrency, yFormat: v => v.toFixed(2) + 'x', quadrants: true
  });

  // Table
  const tbody = $('#table-creatives tbody');
  tbody.innerHTML = creatives
    .sort((a, b) => (b.investimento || 0) - (a.investimento || 0))
    .map(c => {
      let diagnostic = 'Desempenho padrão';
      if (c.ctr && c.ctr > 1.5 && c.costPerConversion && agg.totals.costPerConversion && c.costPerConversion > agg.totals.costPerConversion * 2) {
        diagnostic = '⚠ Alto CTR, conversão cara';
      } else if (c.ctr && c.ctr < 0.5 && c.investimento > agg.totals.investimento * 0.1) {
        diagnostic = '🔴 Baixo CTR, alto investimento';
      } else if (c.costPerConversion && agg.totals.costPerConversion && c.costPerConversion < agg.totals.costPerConversion * 0.7) {
        diagnostic = '✓ Baixo custo/conv.';
      } else if (c.roas && c.roas > 3) {
        diagnostic = '✓ Bom ROAS';
      }

      return `
        <tr>
          <td>${c.creative_name || '—'}</td>
          <td>${c.creative_type || '—'}</td>
          <td>${c.campaign_name || '—'}</td>
          <td>${c.adset_name || '—'}</td>
          <td class="numeric">${formatCurrency(c.investimento)}</td>
          <td class="numeric">${formatNumber(c.impressoes)}</td>
          <td class="numeric">${formatNumber(c.alcance)}</td>
          <td class="numeric">${formatNumber(c.cliques)}</td>
          <td class="numeric">${formatNumber(c.cliques_link)}</td>
          <td class="numeric">${formatPercent(c.ctr, 2)}</td>
          <td class="numeric">${formatCurrency(c.cpc)}</td>
          <td class="numeric">${formatNumber(c.conversoes)}</td>
          <td class="numeric">${formatCurrency(c.costPerConversion)}</td>
          <td class="numeric">${c.roas !== null ? c.roas.toFixed(2) + 'x' : '—'}</td>
          <td class="numeric">${c.frequencia ? c.frequencia.toFixed(1) : '—'}</td>
          <td>${c.data_inicio ? formatDate(c.data_inicio) + (c.data_fim ? ' a ' + formatDate(c.data_fim) : '') : '—'}</td>
          <td>${c.status || '—'}</td>
          <td>${diagnostic}</td>
        </tr>
      `;
    }).join('');
}

function renderFunnelPaid() {
  const agg = aggregateAds(state.adsRows);
  if (!agg) return;

  const funnel = calculateFunnelPaid(agg.totals);

  $('#funnel-spend').textContent = formatCurrency(funnel.spend);
  $('#funnel-impressions').textContent = formatNumber(funnel.impressions);
  $('#rate-spend-impr').textContent = funnel.rateSpendImpr ? formatNumber(funnel.rateSpendImpr) + ' impr./R$' : '—';

  $('#funnel-reach-paid').textContent = formatNumber(funnel.reach);
  $('#rate-impr-reach').textContent = funnel.rateImprReach !== null ? formatPercent(funnel.rateImprReach, 1) : '—';

  $('#funnel-clicks').textContent = formatNumber(funnel.clicks);
  $('#rate-reach-clicks').textContent = funnel.rateReachClicks !== null ? 'CTR: ' + formatPercent(funnel.rateReachClicks, 2) : '—';

  $('#funnel-link-clicks-paid').textContent = formatNumber(funnel.linkClicks);
  $('#rate-clicks-link').textContent = funnel.rateClicksLink !== null ? formatPercent(funnel.rateClicksLink, 1) : '—';

  $('#funnel-conversions-paid').textContent = formatNumber(funnel.conversions);
  $('#rate-link-conv').textContent = funnel.rateLinkConv !== null ? 'Custo/conv.: ' + formatCurrency(funnel.costPerConversion) : '—';

  $('#funnel-revenue').textContent = formatCurrency(funnel.revenue);
  $('#rate-conv-revenue').textContent = funnel.rateConvRevenue !== null ? 'ROAS: ' + funnel.rateConvRevenue.toFixed(2) + 'x' : '—';
}

function renderAdsDiagnosis() {
  const agg = aggregateAds(state.adsRows);
  if (!agg) {
    $('#ads-diagnosis').innerHTML = '<p class="empty-state">Importe dados de anúncios para ver o diagnóstico.</p>';
    return;
  }

  const diagnosis = diagnoseAds(agg);
  const container = $('#ads-diagnosis');

  if (!diagnosis.length) {
    container.innerHTML = '<p class="empty-state">Dados insuficientes para diagnóstico de anúncios.</p>';
    return;
  }

  container.innerHTML = diagnosis.map(item => `
    <div class="diagnosis-item ${item.type}">
      <div class="diagnosis-header">
        <div class="diagnosis-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            ${item.type === 'alert' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' :
              item.type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
              item.type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' :
              '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
          </svg>
        </div>
        <div class="diagnosis-title">${item.title}</div>
      </div>
      <div class="diagnosis-body">
        ${item.body.map(b => `<p><span class="diagnosis-label ${b.label}">${labelText(b.label)}</span>${b.text}</p>`).join('')}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   CSV Import
   ========================================================================== */

let pendingImport = { type: 'organic', file: null, result: null };

function openImportModal(type) {
  pendingImport = { type, file: null, result: null };
  $('#csv-modal-title').textContent = type === 'organic' ? 'Importar dados orgânicos' : 'Importar dados de anúncios';
  $('input[name="import-type"][value="' + type + '"]').checked = true;
  $('#csv-file').value = '';
  $('#import-preview').hidden = true;
  $('#import-result').hidden = true;
  $('#import-warnings').textContent = '';
  openModal('csv-import-modal');
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  pendingImport.file = file;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = event.target.result;
      const result = parseCSV(text, pendingImport.type);
      pendingImport.result = result;

      if (result.errors.length > 0) {
        $('#import-warnings').innerHTML = '<strong>Erros:</strong><ul>' + result.errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
        $('#import-warnings').style.display = 'block';
        $('#confirm-import').disabled = true;
      } else {
        $('#import-warnings').style.display = 'none';
        $('#confirm-import').disabled = false;
      }

      if (result.warnings.length > 0) {
        const warnEl = $('#import-warnings');
        warnEl.innerHTML = (warnEl.innerHTML || '') + '<strong>Avisos:</strong><ul>' + result.warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
        warnEl.style.display = 'block';
      }

      // Preview table
      const previewRows = result.rows.slice(0, 10);
      const headers = CSV_HEADERS[pendingImport.type];
      $('#preview-table').innerHTML = `
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${previewRows.map(row => `<tr>${headers.map(h => `<td>${row[h] !== null && row[h] !== undefined ? row[h] : '<span class="unavailable">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
      `;
      $('#import-preview').hidden = false;
    } catch (err) {
      $('#import-warnings').innerHTML = `<strong>Erro ao ler arquivo:</strong> ${err.message}`;
      $('#import-warnings').style.display = 'block';
      $('#confirm-import').disabled = true;
    }
  };
  reader.readAsText(file);
}

function downloadTemplate() {
  const type = $('input[name="import-type"]:checked')?.value || pendingImport.type;
  const csv = generateTemplate(type);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = type === 'organic' ? 'organic-template.csv' : 'ads-template.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

function restoreDemoData() {
  if (pendingImport.type === 'organic') {
    state.organicPosts = generateDemoOrganic();
    state.isDemoData = true;
    setBadge('Dados de demonstração');
    setLastUpdated('orgânicos', new Date());
  } else {
    state.adsRows = generateDemoAds();
    state.isDemoData = true;
    setBadge('Dados de demonstração');
    setLastUpdated('anúncios', new Date());
  }
  renderAll();
  closeModal('csv-import-modal');
  showToast('Dados de demonstração restaurados');
}

function confirmImport() {
  if (!pendingImport.result || pendingImport.result.errors.length > 0) {
    return alert('Corrija os erros antes de importar');
  }

  if (pendingImport.type === 'organic') {
    state.organicPosts = pendingImport.result.rows;
    state.isDemoData = false;
    setBadge('Dados importados');
    setLastUpdated('orgânicos', new Date());
  } else {
    state.adsRows = pendingImport.result.rows;
    state.isDemoData = false;
    setBadge('Dados importados');
    setLastUpdated('anúncios', new Date());
  }

  renderAll();
  closeModal('csv-import-modal');
  showToast(`${pendingImport.result.rows.length} linhas importadas com sucesso`);
}

function showToast(message) {
  // Simple toast
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    background: var(--color-success); color: white;
    padding: 12px 20px; border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg); font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ==========================================================================
   Inicialização
   ========================================================================== */

document.addEventListener('DOMContentLoaded', init);

// Adiciona keyframes para toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  .empty-state { text-align: center; color: var(--text-muted); padding: var(--space-xl); font-size: var(--font-size-sm); }
  .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); }
  .detail-item { display: flex; flex-direction: column; gap: 4px; }
  .detail-item.full { grid-column: 1 / -1; }
  .detail-label { font-size: var(--font-size-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .detail-value { font-size: var(--font-size-sm); color: var(--text-primary); }
  .action-buttons { display: flex; gap: 4px; }
`;
document.head.appendChild(style);