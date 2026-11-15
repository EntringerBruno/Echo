/**
 * CSV Parser — Content Signal
 * Leitura e validação de CSV no navegador
 */

export const CSV_HEADERS = {
  organic: [
    'data_publicacao',
    'tipo_conteudo',
    'titulo_interno',
    'tema',
    'linha_editorial',
    'link_post',
    'alcance',
    'visualizacoes',
    'curtidas',
    'comentarios',
    'salvamentos',
    'compartilhamentos',
    'visitas_perfil',
    'cliques_link',
    'seguidores_novos',
    'origem_trafego',
    'pago_organico',
    'observacoes'
  ],
  ads: [
    'data_inicio',
    'data_fim',
    'account_id',
    'campaign_id',
    'campaign_name',
    'adset_id',
    'adset_name',
    'ad_id',
    'ad_name',
    'creative_id',
    'creative_name',
    'creative_type',
    'objective',
    'status',
    'currency',
    'timezone',
    'attribution_window',
    'investimento',
    'impressoes',
    'alcance',
    'cliques',
    'cliques_link',
    'visitas_perfil',
    'conversoes',
    'receita_atribuida',
    'frequencia',
    'observacoes'
  ]
};

export const REQUIRED_HEADERS = {
  organic: ['data_publicacao', 'tipo_conteudo'],
  ads: ['data_inicio', 'campaign_id', 'adset_id', 'ad_id', 'creative_id']
};

export const VALID_FORMATS = ['reel', 'carousel', 'photo', 'story'];
export const VALID_AD_FORMATS = ['video', 'image', 'carousel', 'other'];
export const VALID_STATUSES = ['active', 'paused', 'deleted', 'archived', 'learning', 'pending_review'];

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value || value === '') return null;
  const str = String(value).trim();
  // Aceita YYYY-MM-DD, DD/MM/YYYY, YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month}-${day}`;
  }
  const brMatch = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }
  return null;
}

function normalizeFormat(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (['reel', 'reels', 'vídeo', 'video'].includes(v)) return 'reel';
  if (['carousel', 'carrossel', 'carrocel'].includes(v)) return 'carousel';
  if (['photo', 'foto', 'image', 'imagem', 'single_image'].includes(v)) return 'photo';
  if (['story', 'stories', 'storie'].includes(v)) return 'story';
  return null;
}

function normalizeAdLevel(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (['campaign', 'campanha', 'campanhas'].includes(v)) return 'campaign';
  if (['adset', 'ad_set', 'conjunto', 'conjunto_de_anuncios', 'conjuntos'].includes(v)) return 'adset';
  if (['ad', 'anuncio', 'anúncio', 'anúncios', 'ads'].includes(v)) return 'ad';
  if (['creative', 'criativo', 'criativos'].includes(v)) return 'creative';
  return null;
}

function normalizeAdFormat(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (['video', 'vídeo', 'reel', 'reels'].includes(v)) return 'video';
  if (['image', 'imagem', 'foto', 'photo', 'single_image'].includes(v)) return 'image';
  if (['carousel', 'carrossel', 'carrocel'].includes(v)) return 'carousel';
  return 'other';
}

function normalizeStatus(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (['active', 'ativo', 'ativa', 'rodando', 'running'].includes(v)) return 'active';
  if (['paused', 'pausado', 'pausada', 'paused_by_user'].includes(v)) return 'paused';
  if (['deleted', 'deletado', 'deletada', 'removed'].includes(v)) return 'deleted';
  if (['archived', 'arquivado', 'arquivada'].includes(v)) return 'archived';
  if (['learning', 'aprendizado', 'em_aprendizado'].includes(v)) return 'learning';
  if (['pending_review', 'pending', 'em_analise', 'em_análise', 'aguardando'].includes(v)) return 'pending_review';
  return v;
}

function detectPaidOrganic(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (['pago', 'paid', 'ads', 'anúncio', 'anuncio', 'boosted', 'impulsionado'].includes(v)) return 'paid';
  if (['orgânico', 'organico', 'organic', 'natural'].includes(v)) return 'organic';
  return null;
}

export function parseCSV(text, type) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV vazio ou apenas cabeçalho');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const expectedHeaders = CSV_HEADERS[type] || [];
  const requiredHeaders = REQUIRED_HEADERS[type] || [];

  // Valida headers obrigatórios
  const missingRequired = requiredHeaders.filter(h => !headers.includes(h));
  if (missingRequired.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingRequired.join(', ')}`);
  }

  // Avisa sobre colunas extras não reconhecidas
  const extraHeaders = headers.filter(h => !expectedHeaders.includes(h) && h !== '');
  const warnings = [];
  if (extraHeaders.length > 0) {
    warnings.push(`Colunas não reconhecidas (serão ignoradas): ${extraHeaders.join(', ')}`);
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV simples (sem aspas escapadas complexas)
    const values = parseCSVLine(line);
    if (values.length < headers.length) {
      // Preenche com vazios se faltar colunas
      while (values.length < headers.length) values.push('');
    }

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    const parsed = parseRow(row, type, i + 1);
    if (parsed.errors.length > 0) {
      errors.push(...parsed.errors.map(e => `Linha ${i + 1}: ${e}`));
    }
    if (parsed.warnings.length > 0) {
      warnings.push(...parsed.warnings.map(w => `Linha ${i + 1}: ${w}`));
    }
    if (parsed.data) {
      rows.push(parsed.data);
    }
  }

  return { rows, warnings: [...new Set(warnings)], errors };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseRow(row, type, lineNumber) {
  const errors = [];
  const warnings = [];

  if (type === 'organic') {
    const data = {
      id: `organic_${lineNumber}`,
      data_publicacao: parseDate(row.data_publicacao),
      tipo_conteudo: normalizeFormat(row.tipo_conteudo),
      titulo_interno: row.titulo_interno || null,
      tema: row.tema || null,
      linha_editorial: row.linha_editorial || 'Sem linha',
      link_post: row.link_post || null,
      alcance: parseNumber(row.alcance),
      visualizacoes: parseNumber(row.visualizacoes),
      curtidas: parseNumber(row.curtidas),
      comentarios: parseNumber(row.comentarios),
      salvamentos: parseNumber(row.salvamentos),
      compartilhamentos: parseNumber(row.compartilhamentos),
      visitas_perfil: parseNumber(row.visitas_perfil),
      cliques_link: parseNumber(row.cliques_link),
      seguidores_novos: parseNumber(row.seguidores_novos),
      origem_trafego: row.origem_trafego || null,
      pago_organico: detectPaidOrganic(row.pago_organico),
      observacoes: row.observacoes || null
    };

    if (!data.data_publicacao) {
      errors.push('data_publicacao inválida ou ausente');
    }
    if (!data.tipo_conteudo) {
      errors.push(`tipo_conteúdo inválido: "${row.tipo_conteudo}". Use: reel, carousel, photo, story`);
    }

    // Avisos para métricas ausentes
    const metricFields = ['alcance', 'visualizacoes', 'curtidas', 'comentarios', 'salvamentos', 'compartilhamentos', 'visitas_perfil', 'cliques_link', 'seguidores_novos'];
    metricFields.forEach(field => {
      if (data[field] === null && row[field] !== '' && row[field] !== undefined) {
        warnings.push(`${field} não pôde ser convertido para número`);
      }
    });

    // Não retorna data se campos obrigatórios inválidos
    if (errors.length > 0) {
      return { data: null, errors, warnings };
    }

    return { data, errors, warnings };
  } else {
    const data = {
      id: `ads_${lineNumber}`,
      data_inicio: parseDate(row.data_inicio),
      data_fim: parseDate(row.data_fim),
      account_id: row.account_id || 'act_788838833086433',
      campaign_id: row.campaign_id || null,
      campaign_name: row.campaign_name || null,
      adset_id: row.adset_id || null,
      adset_name: row.adset_name || null,
      ad_id: row.ad_id || null,
      ad_name: row.ad_name || null,
      creative_id: row.creative_id || null,
      creative_name: row.creative_name || null,
      creative_type: normalizeAdFormat(row.creative_type),
      objective: row.objective || null,
      status: normalizeStatus(row.status),
      currency: row.currency || 'BRL',
      timezone: row.timezone || 'America/Sao_Paulo',
      attribution_window: row.attribution_window || '7d_click',
      investimento: parseNumber(row.investimento),
      impressoes: parseNumber(row.impressoes),
      alcance: parseNumber(row.alcance),
      cliques: parseNumber(row.cliques),
      cliques_link: parseNumber(row.cliques_link),
      visitas_perfil: parseNumber(row.visitas_perfil),
      conversoes: parseNumber(row.conversoes),
      receita_atribuida: parseNumber(row.receita_atribuida),
      frequencia: parseNumber(row.frequencia),
      observacoes: row.observacoes || null
    };

    if (!data.data_inicio) {
      errors.push('data_inicio inválida ou ausente');
    }
    if (!data.campaign_id) {
      errors.push('campaign_id ausente');
    }
    if (!data.adset_id) {
      errors.push('adset_id ausente');
    }
    if (!data.ad_id) {
      errors.push('ad_id ausente');
    }
    if (!data.creative_id) {
      errors.push('creative_id ausente');
    }

    const metricFields = ['investimento', 'impressoes', 'alcance', 'cliques', 'cliques_link', 'visitas_perfil', 'conversoes', 'receita_atribuida', 'frequencia'];
    metricFields.forEach(field => {
      if (data[field] === null && row[field] !== '' && row[field] !== undefined) {
        warnings.push(`${field} não pôde ser convertido para número`);
      }
    });

    return { data, errors, warnings };
  }
}

export function generateTemplate(type) {
  const headers = CSV_HEADERS[type] || [];
  return headers.join(',') + '\n';
}

export function rowsToCSV(rows, type) {
  const headers = CSV_HEADERS[type] || [];
  const lines = [headers.join(',')];

  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    lines.push(values.join(','));
  });

  return lines.join('\n');
}