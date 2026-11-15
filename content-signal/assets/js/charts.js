/**
 * Charts Renderer — Content Signal
 * Gráficos simples usando Canvas API (sem dependências externas)
 */

const CHART_COLORS = {
  primary: '#2563eb',
  primaryLight: 'rgba(37, 99, 235, 0.15)',
  success: '#16a34a',
  successLight: 'rgba(22, 163, 74, 0.15)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.15)',
  alert: '#dc2626',
  alertLight: 'rgba(220, 38, 38, 0.15)',
  gray: '#737373',
  grayLight: 'rgba(115, 115, 115, 0.15)',
  grid: 'rgba(0, 0, 0, 0.08)',
  text: '#525252',
  textLight: '#a3a3a3'
};

@media (prefers-color-scheme: dark) {
  :root {
    --chart-primary: #3b82f6;
    --chart-primary-light: rgba(59, 130, 246, 0.2);
    --chart-success: #22c55e;
    --chart-success-light: rgba(34, 197, 94, 0.2);
    --chart-warning: #f59e0b;
    --chart-warning-light: rgba(245, 158, 11, 0.2);
    --chart-alert: #ef4444;
    --chart-alert-light: rgba(239, 68, 68, 0.2);
    --chart-gray: #a3a3a3;
    --chart-gray-light: rgba(163, 163, 163, 0.2);
    --chart-grid: rgba(255, 255, 255, 0.1);
    --chart-text: #d4d4d4;
    --chart-text-light: #737373;
  }
}

function getColors() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDark) {
    return {
      primary: '#3b82f6',
      primaryLight: 'rgba(59, 130, 246, 0.2)',
      success: '#22c55e',
      successLight: 'rgba(34, 197, 94, 0.2)',
      warning: '#f59e0b',
      warningLight: 'rgba(245, 158, 11, 0.2)',
      alert: '#ef4444',
      alertLight: 'rgba(239, 68, 68, 0.2)',
      gray: '#a3a3a3',
      grayLight: 'rgba(163, 163, 163, 0.2)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#d4d4d4',
      textLight: '#737373'
    };
  }
  return CHART_COLORS;
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  return { ctx, width: rect.width, height: rect.height };
}

function drawText(ctx, text, x, y, options = {}) {
  const { font = '12px IBM Plex Sans', color = getColors().text, align = 'left', baseline = 'top' } = options;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}

function drawRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawRoundRect(ctx, x, y, w, h, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

export function renderBarChart(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const colors = getColors();

  const { labels, values, maxValue, formatValue, barColor = colors.primary, showValues = true } = options;
  const padding = { top: 30, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / (labels.length * 1.5);
  const barGap = barWidth / 2;
  const maxVal = maxValue || Math.max(...values.filter(v => v !== null), 1);

  // Grid lines
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding.top + (chartHeight / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const val = maxVal * (1 - i / gridSteps);
    drawText(ctx, formatValue ? formatValue(val) : formatNumber(val), padding.left - 10, y - 6, {
      color: colors.textLight, align: 'right', font: '11px IBM Plex Sans'
    });
  }

  // Bars
  labels.forEach((label, i) => {
    const value = values[i];
    if (value === null || value === undefined) return;
    const barHeight = (value / maxVal) * chartHeight;
    const x = padding.left + i * (barWidth + barGap) + barGap;
    const y = padding.top + chartHeight - barHeight;

    drawRoundRect(ctx, x, y, barWidth, barHeight, 4, barColor);

    if (showValues) {
      drawText(ctx, formatValue ? formatValue(value) : formatNumber(value), x + barWidth / 2, y - 16, {
        color: colors.text, align: 'center', font: '11px IBM Plex Sans', baseline: 'bottom'
      });
    }

    // Label
    drawText(ctx, label, x + barWidth / 2, padding.top + chartHeight + 8, {
      color: colors.text, align: 'center', font: '11px IBM Plex Sans'
    });
  });

  // Y axis
  ctx.strokeStyle = colors.grid;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();
}

export function renderGroupedBarChart(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const colors = getColors();

  const { groups, series, formatValue } = options;
  // groups: [{label, values: []}], series: [{key, label, color}]
  const padding = { top: 30, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = groups.flatMap(g => g.values);
  const maxVal = Math.max(...allValues.filter(v => v !== null), 1);

  const groupWidth = chartWidth / groups.length;
  const barWidth = (groupWidth * 0.8) / series.length;

  // Grid
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding.top + (chartHeight / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const val = maxVal * (1 - i / gridSteps);
    drawText(ctx, formatValue ? formatValue(val) : formatNumber(val), padding.left - 10, y - 6, {
      color: colors.textLight, align: 'right', font: '11px IBM Plex Sans'
    });
  }

  // Bars
  groups.forEach((group, gi) => {
    const groupX = padding.left + gi * groupWidth + groupWidth * 0.1;
    series.forEach((s, si) => {
      const value = group.values[si];
      if (value === null || value === undefined) return;
      const barHeight = (value / maxVal) * chartHeight;
      const x = groupX + si * barWidth;
      const y = padding.top + chartHeight - barHeight;

      drawRoundRect(ctx, x, y, barWidth * 0.9, barHeight, 3, s.color);

      // Label
      if (gi === 0) {
        drawText(ctx, s.label, x + barWidth * 0.45, padding.top + chartHeight + 22 + si * 14, {
          color: s.color, align: 'center', font: '10px IBM Plex Sans'
        });
      }
    });

    // Group label
    drawText(ctx, group.label, groupX + groupWidth * 0.4, padding.top + chartHeight + 8, {
      color: colors.text, align: 'center', font: '11px IBM Plex Sans'
    });
  });

  // Y axis
  ctx.strokeStyle = colors.grid;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();
}

export function renderScatterChart(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const colors = getColors();

  const { points, xKey, yKey, xLabel, yLabel, xFormat, yFormat, quadrants } = options;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const validPoints = points.filter(p => p[xKey] !== null && p[yKey] !== null);
  if (!validPoints.length) return;

  const xValues = validPoints.map(p => p[xKey]);
  const yValues = validPoints.map(p => p[yKey]);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  // Grid
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const x = padding.left + (chartWidth / gridSteps) * i;
    const y = padding.top + (chartHeight / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Quadrant lines (median)
  if (quadrants) {
    const xMedian = (xMin + xMax) / 2;
    const yMedian = (yMin + yMax) / 2;
    const qx = padding.left + ((xMedian - xMin) / xRange) * chartWidth;
    const qy = padding.top + chartHeight - ((yMedian - yMin) / yRange) * chartHeight;
    ctx.strokeStyle = colors.textLight;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(qx, padding.top);
    ctx.lineTo(qx, padding.top + chartHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, qy);
    ctx.lineTo(padding.left + chartWidth, qy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Points
  validPoints.forEach(p => {
    const x = padding.left + ((p[xKey] - xMin) / xRange) * chartWidth;
    const y = padding.top + chartHeight - ((p[yKey] - yMin) / yRange) * chartHeight;
    ctx.fillStyle = p.color || colors.primary;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    // Label on hover would need event listeners - skip for simplicity
  });

  // Axes
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.stroke();

  // X axis labels
  for (let i = 0; i <= gridSteps; i++) {
    const x = padding.left + (chartWidth / gridSteps) * i;
    const val = xMin + (xRange / gridSteps) * i;
    drawText(ctx, xFormat ? xFormat(val) : formatNumber(val), x, padding.top + chartHeight + 8, {
      color: colors.text, align: 'center', font: '11px IBM Plex Sans'
    });
  }
  drawText(ctx, xLabel, padding.left + chartWidth / 2, height - 10, {
    color: colors.text, align: 'center', font: '12px IBM Plex Sans'
  });

  // Y axis labels
  for (let i = 0; i <= gridSteps; i++) {
    const y = padding.top + (chartHeight / gridSteps) * i;
    const val = yMax - (yRange / gridSteps) * i;
    drawText(ctx, yFormat ? yFormat(val) : formatNumber(val), padding.left - 10, y - 6, {
      color: colors.textLight, align: 'right', font: '11px IBM Plex Sans'
    });
  }
  // Y label (vertical)
  ctx.save();
  ctx.translate(15, padding.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  drawText(ctx, yLabel, 0, 0, { color: colors.text, align: 'center', font: '12px IBM Plex Sans' });
  ctx.restore();
}

export function renderRetentionChart(canvasId, data) {
  // Placeholder for retention chart - shows "dados não disponíveis"
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  const colors = getColors();

  drawText(ctx, 'Retenção de Reels', width / 2, 20, { color: colors.text, align: 'center', font: '14px IBM Plex Sans' });
  drawText(ctx, 'Dados de retenção não disponíveis no CSV', width / 2, height / 2, { color: colors.textLight, align: 'center', font: '13px IBM Plex Sans' });
  drawText(ctx, 'Exporte do Meta Business Suite > Insights > Reels > Retenção', width / 2, height / 2 + 24, { color: colors.textLight, align: 'center', font: '11px IBM Plex Sans' });
}

export function clearChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Helper para formatNumber (duplicado para não depender de metrics.js)
function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Number(num.toFixed(0)).toLocaleString('pt-BR');
}

// Resize handler
window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(canvas => {
    // Re-render would need stored data - simplified for now
  });
});