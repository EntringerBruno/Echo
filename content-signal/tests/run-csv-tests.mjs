import { parseCSV, generateTemplate, CSV_HEADERS, REQUIRED_HEADERS } from '../assets/js/csv.js';

function assertEqual(actual, expected, message) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) console.log('✓', message);
  else console.error('✗', message, 'expected', JSON.stringify(expected), 'got', JSON.stringify(actual));
  return pass;
}

function assertThrows(fn, message) {
  try { fn(); console.error('✗', message, 'should have thrown'); return false; }
  catch (e) { console.log('✓', message); return true; }
}

let passed = 0, failed = 0;
function test(name, fn) { if (fn()) passed++; else failed++; }

test('organic template has all headers', () => assertEqual(generateTemplate('organic').split('\n')[0], CSV_HEADERS.organic.join(','), 'organic template headers'));
test('ads template has all headers', () => assertEqual(generateTemplate('ads').split('\n')[0], CSV_HEADERS.ads.join(','), 'ads template headers'));

const validOrganic = `data_publicacao,tipo_conteudo,titulo_interno,tema,linha_editorial,link_post,alcance,visualizacoes,curtidas,comentarios,salvamentos,compartilhamentos,visitas_perfil,cliques_link,seguidores_novos,origem_trafego,pago_organico,observacoes
2026-06-01,reel,Teste,runas,Descoberta,https://instagram.com/reel/abc,1000,1200,100,10,20,15,50,30,5,orgânico,organic,obs
2026-06-02,carousel,Teste2,tarot,Autoridade,https://instagram.com/p/def,500,,80,5,15,10,30,20,3,orgânico,organic,`;

const organicResult = parseCSV(validOrganic, 'organic');
test('organic parse returns 2 rows', () => assertEqual(organicResult.rows.length, 2, 'organic rows count'));
test('organic parse no errors', () => assertEqual(organicResult.errors.length, 0, 'organic no errors'));
test('organic row 1 alcance=1000', () => assertEqual(organicResult.rows[0].alcance, 1000, 'organic row1 alcance'));
test('organic row 1 visualizacoes=1200', () => assertEqual(organicResult.rows[0].visualizacoes, 1200, 'organic row1 visualizacoes'));
test('organic row 2 visualizacoes=null', () => assertEqual(organicResult.rows[1].visualizacoes, null, 'organic row2 visualizacoes null'));
test('organic row 1 tipo=reel', () => assertEqual(organicResult.rows[0].tipo_conteudo, 'reel', 'organic row1 tipo'));
test('organic row 2 tipo=carousel', () => assertEqual(organicResult.rows[1].tipo_conteudo, 'carousel', 'organic row2 tipo'));
test('organic row 1 data=2026-06-01', () => assertEqual(organicResult.rows[0].data_publicacao, '2026-06-01', 'organic row1 data'));

const validAds = `data_inicio,data_fim,account_id,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,creative_id,creative_name,creative_type,objective,status,currency,timezone,attribution_window,investimento,impressoes,alcance,cliques,cliques_link,visitas_perfil,conversoes,receita_atribuida,frequencia,observacoes
2026-07-01,2026-07-14,act_123,camp_1,Campanha,adset_1,Adset,ad_1,Ad,crv_1,Creative,video,CONVERSIONS,active,BRL,America/Sao_Paulo,7d_click,1000,50000,30000,1000,800,200,50,2500,1.67,obs`;

const adsResult = parseCSV(validAds, 'ads');
test('ads parse returns 1 row', () => assertEqual(adsResult.rows.length, 1, 'ads rows count'));
test('ads parse no errors', () => assertEqual(adsResult.errors.length, 0, 'ads no errors'));
test('ads row investimento=1000', () => assertEqual(adsResult.rows[0].investimento, 1000, 'ads investimento'));
test('ads row creative_type=video', () => assertEqual(adsResult.rows[0].creative_type, 'video', 'ads creative_type'));
test('ads row status=active', () => assertEqual(adsResult.rows[0].status, 'active', 'ads status'));

test('organic missing data_publicacao throws', () => assertThrows(() => parseCSV('tipo_conteudo\nreel', 'organic'), 'missing data_publicacao throws'));
test('ads missing campaign_id throws', () => assertThrows(() => parseCSV('data_inicio,adset_id,ad_id,creative_id\n2026-01-01,adset_1,ad_1,crv_1', 'ads'), 'missing campaign_id throws'));

test('invalid date returns error', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\ninvalid,reel', 'organic');
  return assertEqual(r.errors.length > 0, true, 'invalid date has error') && assertEqual(r.rows.length, 0, 'invalid date no rows');
});
test('invalid format returns error and no rows', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n2026-01-01,invalid', 'organic');
  return assertEqual(r.errors.length > 0, true, 'invalid format has error') && assertEqual(r.rows.length, 0, 'invalid format no rows');
});
test('invalid number returns null', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo,alcance\n2026-01-01,reel,abc', 'organic');
  return assertEqual(r.rows[0].alcance, null, 'invalid number null');
});
test('empty string number returns null', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo,alcance\n2026-01-01,reel,', 'organic');
  return assertEqual(r.rows[0].alcance, null, 'empty string null');
});

test('format Reels -> reel', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n2026-01-01,Reels', 'organic');
  return assertEqual(r.rows[0].tipo_conteudo, 'reel', 'Reels -> reel');
});
test('format Carrossel -> carousel', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n2026-01-01,Carrossel', 'organic');
  return assertEqual(r.rows[0].tipo_conteudo, 'carousel', 'Carrossel -> carousel');
});
test('format Foto -> photo', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n2026-01-01,Foto', 'organic');
  return assertEqual(r.rows[0].tipo_conteudo, 'photo', 'Foto -> photo');
});
test('format Story -> story', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n2026-01-01,Story', 'organic');
  return assertEqual(r.rows[0].tipo_conteudo, 'story', 'Story -> story');
});
test('ad format video -> video', () => {
  const r = parseCSV('data_inicio,campaign_id,adset_id,ad_id,creative_id,creative_type\n2026-01-01,camp_1,adset_1,ad_1,crv_1,video', 'ads');
  return assertEqual(r.rows[0].creative_type, 'video', 'ad video -> video');
});
test('ad format imagem -> image', () => {
  const r = parseCSV('data_inicio,campaign_id,adset_id,ad_id,creative_id,creative_type\n2026-01-01,camp_1,adset_1,ad_1,crv_1,imagem', 'ads');
  return assertEqual(r.rows[0].creative_type, 'image', 'ad imagem -> image');
});
test('ad status ativo -> active', () => {
  const r = parseCSV('data_inicio,campaign_id,adset_id,ad_id,creative_id,status\n2026-01-01,camp_1,adset_1,ad_1,crv_1,ativo', 'ads');
  return assertEqual(r.rows[0].status, 'active', 'ad ativo -> active');
});
test('ad status pausado -> paused', () => {
  const r = parseCSV('data_inicio,campaign_id,adset_id,ad_id,creative_id,status\n2026-01-01,camp_1,adset_1,ad_1,crv_1,pausado', 'ads');
  return assertEqual(r.rows[0].status, 'paused', 'ad pausado -> paused');
});
test('paid/organic detection pago -> paid', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo,pago_organico\n2026-01-01,reel,pago', 'organic');
  return assertEqual(r.rows[0].pago_organico, 'paid', 'pago -> paid');
});
test('BR date format DD/MM/YYYY', () => {
  const r = parseCSV('data_publicacao,tipo_conteudo\n01/06/2026,reel', 'organic');
  return assertEqual(r.rows[0].data_publicacao, '2026-06-01', 'BR date format');
});

test('quoted fields with commas', () => {
  const csv = 'data_publicacao,tipo_conteudo,titulo_interno\n2026-01-01,reel,"Titulo, com vírgula"';
  const r = parseCSV(csv, 'organic');
  return assertEqual(r.rows[0].titulo_interno, 'Titulo, com vírgula', 'quoted comma field');
});

import { rowsToCSV } from '../assets/js/csv.js';
test('rowsToCSV generates valid CSV', () => {
  const rows = [{data_publicacao: '2026-01-01', tipo_conteudo: 'reel', titulo_interno: 'Test', tema: null, linha_editorial: 'Descoberta', link_post: null, alcance: 100, visualizacoes: null, curtidas: 10, comentarios: 1, salvamentos: 2, compartilhamentos: 1, visitas_perfil: 5, cliques_link: 3, seguidores_novos: 1, origem_trafego: 'orgânico', pago_organico: 'organic', observacoes: null}];
  const csv = rowsToCSV(rows, 'organic');
  return assertEqual(csv.split('\n').length, 2, 'rowsToCSV header + 1 row');
});

console.log('\n=== RESULTADO:', passed, 'passed,', failed, 'failed ===');
if (failed === 0) console.log('✓ Todos os testes passaram!');
else console.error('✗', failed, 'teste(s) falharam');

process.exit(failed > 0 ? 1 : 0);