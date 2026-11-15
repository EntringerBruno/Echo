import { safeDivide, safePercent, calculateRates, aggregateAds, calculateFunnelPaid } from '../assets/js/metrics.js';

function assertEqual(actual, expected, message, tolerance = 0.001) {
  if (actual === null && expected === null) { console.log('✓', message); return true; }
  if (actual === null || expected === null) { console.error('✗', message, 'expected', expected, 'got', actual); return false; }
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) { console.log('✓', message, actual.toFixed(4), '≈', expected.toFixed(4)); return true; }
  else { console.error('✗', message, 'expected', expected.toFixed(4), 'got', actual.toFixed(4), 'diff', diff.toFixed(4)); return false; }
}

let passed = 0, failed = 0;
function test(name, fn) { if (fn()) passed++; else failed++; }

// safeDivide
test('safeDivide 100/4=25', () => assertEqual(safeDivide(100,4), 25, '100/4=25'));
test('safeDivide 100/0=null', () => assertEqual(safeDivide(100,0), null, '100/0=null'));
test('safeDivide null/4=null', () => assertEqual(safeDivide(null,4), null, 'null/4=null'));
test('safeDivide 100/null=null', () => assertEqual(safeDivide(100,null), null, '100/null=null'));
test('safeDivide 0/100=0', () => assertEqual(safeDivide(0,100), 0, '0/100=0'));

// safePercent
test('safePercent 25/100=25', () => assertEqual(safePercent(25,100), 25, '25% of 100=25'));
test('safePercent 1/3≈33.333', () => assertEqual(safePercent(1,3), 33.333, '1/3*100≈33.333', 0.01));
test('safePercent 0/100=0', () => assertEqual(safePercent(0,100), 0, '0% of 100=0'));
test('safePercent 100/0=null', () => assertEqual(safePercent(100,0), null, '100% of 0=null'));
test('safePercent null/100=null', () => assertEqual(safePercent(null,100), null, 'null/100=null'));

// calculateRates
const post = { alcance:10000, salvamentos:500, compartilhamentos:200, cliques_link:300, curtidas:800, comentarios:100 };
const rates = calculateRates(post);
test('saveRate 500/10000=5%', () => assertEqual(rates.saveRate, 5.0, 'saveRate=5%'));
test('shareRate 200/10000=2%', () => assertEqual(rates.shareRate, 2.0, 'shareRate=2%'));
test('clickRate 300/10000=3%', () => assertEqual(rates.clickRate, 3.0, 'clickRate=3%'));
test('engagementRate (800+100+500+200)/10000=16%', () => assertEqual(rates.engagementRate, 16.0, 'engagementRate=16%'));
const postNoReach = {...post, alcance:null};
const ratesNoReach = calculateRates(postNoReach);
test('no reach -> null rates', () => assertEqual(ratesNoReach.saveRate, null, 'no reach=null'));

// aggregateAds
const adsData = [
  { account_id:'act_123', campaign_id:'camp_1', campaign_name:'Campanha Teste', adset_id:'adset_1', adset_name:'Conjunto A', ad_id:'ad_1', ad_name:'Anúncio 1', creative_id:'crv_1', creative_name:'Criativo Vídeo', creative_type:'video', objective:'CONVERSIONS', status:'active', currency:'BRL', timezone:'America/Sao_Paulo', attribution_window:'7d_click', data_inicio:'2026-01-01', data_fim:'2026-01-31', investimento:1000, impressoes:50000, alcance:30000, cliques:1000, cliques_link:800, visitas_perfil:200, conversoes:50, receita_atribuida:2500, frequencia:1.67 },
  { account_id:'act_123', campaign_id:'camp_1', campaign_name:'Campanha Teste', adset_id:'adset_1', adset_name:'Conjunto A', ad_id:'ad_2', ad_name:'Anúncio 2', creative_id:'crv_2', creative_name:'Criativo Carousel', creative_type:'carousel', objective:'CONVERSIONS', status:'active', currency:'BRL', timezone:'America/Sao_Paulo', attribution_window:'7d_click', data_inicio:'2026-01-01', data_fim:'2026-01-31', investimento:500, impressoes:25000, alcance:15000, cliques:500, cliques_link:400, visitas_perfil:100, conversoes:25, receita_atribuida:1250, frequencia:1.67 },
  { account_id:'act_123', campaign_id:'camp_2', campaign_name:'Campanha Brand', adset_id:'adset_2', adset_name:'Conjunto B', ad_id:'ad_3', ad_name:'Anúncio 3', creative_id:'crv_3', creative_name:'Criativo Imagem', creative_type:'image', objective:'BRAND_AWARENESS', status:'paused', currency:'BRL', timezone:'America/Sao_Paulo', attribution_window:'7d_click', data_inicio:'2026-02-01', data_fim:'2026-02-28', investimento:2000, impressoes:100000, alcance:60000, cliques:2000, cliques_link:0, visitas_perfil:0, conversoes:0, receita_atribuida:0, frequencia:1.67 }
];

const agg = aggregateAds(adsData);

// Totals
test('totals investimento=3500', () => assertEqual(agg.totals.investimento, 3500, 'investimento total'));
test('totals impressoes=175000', () => assertEqual(agg.totals.impressoes, 175000, 'impressoes total'));
test('totals alcance=105000', () => assertEqual(agg.totals.alcance, 105000, 'alcance total'));
test('totals cliques=3500', () => assertEqual(agg.totals.cliques, 3500, 'cliques total'));
test('totals cliques_link=1200', () => assertEqual(agg.totals.cliques_link, 1200, 'cliques_link total'));
test('totals conversoes=75', () => assertEqual(agg.totals.conversoes, 75, 'conversoes total'));
test('totals receita=3750', () => assertEqual(agg.totals.receita_atribuida, 3750, 'receita total'));

const expectedCpm = 3500 / (175000 / 1000);
test('CPM total=20', () => assertEqual(agg.totals.cpm, expectedCpm, 'CPM total'));

const expectedCpc = 3500 / 3500;
test('CPC total=1', () => assertEqual(agg.totals.cpc, expectedCpc, 'CPC total'));

const expectedCtr = (3500 / 175000) * 100;
test('CTR total=2%', () => assertEqual(agg.totals.ctr, expectedCtr, 'CTR total'));

const expectedCpa = 3500 / 75;
test('CPA total≈46.67', () => assertEqual(agg.totals.costPerConversion, expectedCpa, 'CPA total', 0.01));

const expectedRoas = 3750 / 3500;
test('ROAS total≈1.0714', () => assertEqual(agg.totals.roas, expectedRoas, 'ROAS total', 0.0001));

test('frequência agregada=null (sem alcance deduplicado)', () => assertEqual(agg.totals.frequencia, null, 'freq agregada null'));

// Campaign level
const camp1 = agg.byCampaign.find(c => c.campaign_id === 'camp_1');
const camp2 = agg.byCampaign.find(c => c.campaign_id === 'camp_2');
test('camp1 investimento=1500', () => assertEqual(camp1.investimento, 1500, 'camp1 investimento'));
test('camp1 impressoes=75000', () => assertEqual(camp1.impressoes, 75000, 'camp1 impressoes'));
test('camp1 conversoes=75', () => assertEqual(camp1.conversoes, 75, 'camp1 conversoes'));
test('camp1 receita=3750', () => assertEqual(camp1.receita_atribuida, 3750, 'camp1 receita'));
test('camp1 ROAS=2.5', () => assertEqual(camp1.roas, 3750/1500, 'camp1 ROAS', 0.001));
test('camp2 investimento=2000', () => assertEqual(camp2.investimento, 2000, 'camp2 investimento'));
test('camp2 conversoes=0', () => assertEqual(camp2.conversoes, 0, 'camp2 conversoes'));
test('camp2 ROAS=0', () => assertEqual(camp2.roas, 0, 'camp2 ROAS'));

// Adset level
const adset1 = agg.byAdset.find(a => a.adset_id === 'adset_1');
const adset2 = agg.byAdset.find(a => a.adset_id === 'adset_2');
test('adset1 investimento=1500', () => assertEqual(adset1.investimento, 1500, 'adset1 investimento'));
test('adset1 count=2', () => assertEqual(adset1.count, 2, 'adset1 count'));
test('adset2 investimento=2000', () => assertEqual(adset2.investimento, 2000, 'adset2 investimento'));
test('adset2 count=1', () => assertEqual(adset2.count, 1, 'adset2 count'));

// Creative level
const crv1 = agg.byCreative.find(c => c.creative_id === 'crv_1');
const crv2 = agg.byCreative.find(c => c.creative_id === 'crv_2');
const crv3 = agg.byCreative.find(c => c.creative_id === 'crv_3');
test('crv1 investimento=1000', () => assertEqual(crv1.investimento, 1000, 'crv1 investimento'));
test('crv1 CTR=2%', () => assertEqual(crv1.ctr, (1000/50000)*100, 'crv1 CTR', 0.01));
test('crv2 investimento=500', () => assertEqual(crv2.investimento, 500, 'crv2 investimento'));
test('crv3 investimento=2000', () => assertEqual(crv3.investimento, 2000, 'crv3 investimento'));

// calculateFunnelPaid
const funnel = calculateFunnelPaid(agg.totals);
test('funnel spend=3500', () => assertEqual(funnel.spend, 3500, 'spend'));
test('funnel impressions=175000', () => assertEqual(funnel.impressions, 175000, 'impressions'));
test('funnel reach=105000', () => assertEqual(funnel.reach, 105000, 'reach'));
test('funnel clicks=3500', () => assertEqual(funnel.clicks, 3500, 'clicks'));
test('funnel linkClicks=1200', () => assertEqual(funnel.linkClicks, 1200, 'linkClicks'));
test('funnel conversions=75', () => assertEqual(funnel.conversions, 75, 'conversions'));
test('funnel revenue=3750', () => assertEqual(funnel.revenue, 3750, 'revenue'));
test('funnel rateSpendImpr=50', () => assertEqual(funnel.rateSpendImpr, 175000/3500, 'impr./R$', 0.01));
test('funnel rateImprReach=60%', () => assertEqual(funnel.rateImprReach, (105000/175000)*100, 'alcance/impr.', 0.01));
test('funnel rateReachClicks=2%', () => assertEqual(funnel.rateReachClicks, (3500/175000)*100, 'CTR', 0.01));
test('funnel rateClicksLink≈34.29%', () => assertEqual(funnel.rateClicksLink, (1200/3500)*100, 'link/cliques', 0.01));
test('funnel rateLinkConv=6.25%', () => assertEqual(funnel.rateLinkConv, (75/1200)*100, 'conv/link', 0.01));
test('funnel rateConvRevenue≈1.0714x', () => assertEqual(funnel.rateConvRevenue, 3750/3500, 'ROAS', 0.0001));

// Edge cases
const noConvAgg = aggregateAds([{...adsData[0], ad_id:'ad_4', creative_id:'crv_4', creative_name:'Criativo Sem Conv', conversoes:0, receita_atribuida:0}]);
test('CPA null when conv=0', () => assertEqual(noConvAgg.totals.costPerConversion, null, 'CPA null'));
test('ROAS=0 when revenue=0', () => assertEqual(noConvAgg.totals.roas, 0, 'ROAS=0'));
test('conversionRate=0% when conv=0 but link_clicks>0', () => assertEqual(noConvAgg.totals.conversionRate, 0, 'convRate=0%'));

const noClicksAgg = aggregateAds([{...adsData[0], ad_id:'ad_5', creative_id:'crv_5', creative_name:'Criativo Sem Cliques', cliques:0, cliques_link:0}]);
test('CPC null when clicks=0', () => assertEqual(noClicksAgg.totals.cpc, null, 'CPC null'));
test('CTR=0 when clicks=0', () => assertEqual(noClicksAgg.totals.ctr, 0, 'CTR=0'));

// Weighted frequency - AGORA: frequência agregada = null (sem alcance deduplicado)
const freqAgg = aggregateAds([
  {...adsData[0], ad_id:'ad_6', creative_id:'crv_6', creative_name:'Freq Alta', alcance:10000, impressoes:20000, frequencia:2.0},
  {...adsData[0], ad_id:'ad_7', creative_id:'crv_7', creative_name:'Freq Baixa', alcance:10000, impressoes:15000, frequencia:1.5}
]);
test('frequência agregada=null com públicos sobrepostos', () => assertEqual(freqAgg.totals.frequencia, null, 'freq agregada null com sobreposição'));

console.log('\n=== RESULTADO:', passed, 'passed,', failed, 'failed ===');
if (failed === 0) console.log('✓ Todos os testes passaram!');
else console.error('✗', failed, 'teste(s) falharam');

process.exit(failed > 0 ? 1 : 0);