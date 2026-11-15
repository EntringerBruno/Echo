import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..', '..');

const VARIANTS = [
  { name: 'direction-a-diagnostico', file: 'diagnostico-direction-a.html', label: 'Direção A - Diagnóstico' },
  { name: 'direction-b-diagnostico', file: 'diagnostico-direction-b.html', label: 'Direção B - Diagnóstico' },
  { name: 'direction-a-editoriais', file: 'editoriais-direction-a.html', label: 'Direção A - Linhas Editoriais' },
  { name: 'direction-a-ads', file: 'ads-direction-a.html', label: 'Direção A - Meta Ads' },
];

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 667 },
];

// Simple HTTP server for variant files
function createVariantServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let filePath = url.pathname;

    // Serve variant files from docs/ui/variants
    if (filePath.startsWith('/variants/')) {
      const variantFile = filePath.replace('/variants/', '');
      const fullPath = join(__dirname, 'docs', 'ui', 'variants', variantFile);
      try {
        const content = readFileSync(fullPath);
        const ext = extname(fullPath);
        const mimeTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(content);
        return;
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
    }

    // Serve assets from content-signal
    if (filePath.startsWith('/assets/')) {
      const fullPath = join(__dirname, filePath);
      try {
        const content = readFileSync(fullPath);
        const ext = extname(fullPath);
        const mimeTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(content);
        return;
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
    }

    res.writeHead(404);
    res.end('Not found');
  });

  return new Promise((resolve) => {
    server.listen(8081, '127.0.0.1', () => {
      console.log('Variant server running at http://127.0.0.1:8081');
      resolve(server);
    });
  });
}

async function waitForApp(page) {
  await page.waitForFunction(() => {
    const tabs = document.querySelectorAll('[data-tab]');
    return tabs.length >= 3;
  }, { timeout: 10000 });
  await page.waitForTimeout(500);
}

function luminance(rgb) {
  const arr = Array.isArray(rgb) ? rgb : [rgb[0], rgb[1], rgb[2]];
  const mapped = arr.map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * mapped[0] + 0.7152 * mapped[1] + 0.0722 * mapped[2];
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseColor(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  return null;
}

async function measureAll(page) {
  return await page.evaluate(() => {
    function parseColorLocal(color) {
      if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      return null;
    }

    function luminanceLocal(rgb) {
      const arr = Array.isArray(rgb) ? rgb : [rgb[0], rgb[1], rgb[2]];
      const mapped = arr.map(v => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * mapped[0] + 0.7152 * mapped[1] + 0.0722 * mapped[2];
    }

    function contrastLocal(fg, bg) {
      const l1 = luminanceLocal(fg);
      const l2 = luminanceLocal(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function getEffectiveBg(el) {
      let current = el;
      while (current) {
        const style = getComputedStyle(current);
        const bgColor = style.backgroundColor;
        const bg = parseColorLocal(bgColor);
        if (bg) return bg;
        current = current.parentElement;
      }
      return [255, 255, 255];
    }

    const results = {
      contrast: {},
      geometry: {},
      touchTargets: {},
      fontSizes: {},
      focusOrder: [],
    };

    // ===== CONTRAST TESTS =====
    const contrastTests = [
      { key: 'tab-inactive', selector: '[data-tab]:not(.active):not([aria-selected="true"])' },
      { key: 'tab-active', selector: '[data-tab].active, [data-tab][aria-selected="true"]' },
      { key: 'heading-primary', selector: '.section-title' },
      { key: 'heading-page', selector: '.panel-header h1' },
      { key: 'kpi-label', selector: '.kpi-label' },
      { key: 'kpi-value', selector: '.kpi-value:not(.unavailable)' },
      { key: 'kpi-sub', selector: '.kpi-sub:not(.positive):not(.negative)' },
      { key: 'button-primary', selector: '.btn-primary' },
      { key: 'button-secondary', selector: '.btn-secondary:not(:disabled)' },
      { key: 'badge', selector: '.badge' },
      { key: 'funnel-label', selector: '.funnel-label' },
      { key: 'funnel-rate', selector: '.funnel-rate:not(.positive):not(.negative)' },
      { key: 'table-header', selector: 'th' },
      { key: 'table-cell', selector: 'td:not(.numeric)' },
      { key: 'select-text', selector: 'select' },
      { key: 'diagnosis-title', selector: '.diagnosis-title' },
      { key: 'diagnosis-body', selector: '.diagnosis-body' },
    ];

    for (const tc of contrastTests) {
      const elements = document.querySelectorAll(tc.selector);
      if (elements.length > 0) {
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const style = getComputedStyle(el);
            const fg = parseColorLocal(style.color);
            const bg = getEffectiveBg(el);

            if (fg && bg) {
              results.contrast[tc.key] = {
                contrast: contrastLocal(fg, bg),
                fg: `rgb(${fg.join(',')})`,
                bg: `rgb(${bg.join(',')})`,
                selector: tc.selector,
                elementTag: el.tagName,
                elementClass: el.className,
                sampleCount: elements.length,
                passesAA: contrastLocal(fg, bg) >= 4.5,
                passesAAA: contrastLocal(fg, bg) >= 7,
              };
            }
            break;
          }
        }
      }
    }

    // ===== GEOMETRY / OVERFLOW =====
    const allElements = document.querySelectorAll('*');
    let overflowCount = 0;
    let maxOverflowRatio = 0;
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const style = getComputedStyle(el);
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        if (scrollWidth > clientWidth + 1) {
          overflowCount++;
          const ratio = scrollWidth / clientWidth;
          if (ratio > maxOverflowRatio) maxOverflowRatio = ratio;
        }
      }
    });
    results.geometry = {
      overflowElements: overflowCount,
      maxOverflowRatio: maxOverflowRatio.toFixed(2),
    };

    // ===== TOUCH TARGETS (mobile) =====
    const interactiveSelectors = [
      'button:not(:disabled)',
      'a[href]',
      'select',
      'input:not([type="hidden"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="tab"]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const interactiveElements = document.querySelectorAll(interactiveSelectors.join(','));
    let smallTouchTargets = 0;
    const smallTargets = [];
    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const minDim = Math.min(rect.width, rect.height);
        if (minDim < 44) {
          smallTouchTargets++;
          smallTargets.push({
            tag: el.tagName,
            class: el.className,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            minDim: Math.round(minDim),
            selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
          });
        }
      }
    });
    results.touchTargets = {
      totalInteractive: interactiveElements.length,
      below44px: smallTouchTargets,
      details: smallTargets.slice(0, 20),
    };

    // ===== FONT SIZES =====
    const allTextElements = document.querySelectorAll('body *:not(script):not(style):not(noscript)');
    let below12px = 0;
    const smallFonts = [];
    allTextElements.forEach(el => {
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 0 && fontSize < 12) {
        below12px++;
        if (smallFonts.length < 20) {
          smallFonts.push({
            tag: el.tagName,
            class: el.className,
            fontSize: Math.round(fontSize * 10) / 10,
            fontFamily: style.fontFamily,
            textPreview: el.textContent?.slice(0, 50) || '',
          });
        }
      }
    });
    results.fontSizes = {
      totalTextElements: allTextElements.length,
      below12px: below12px,
      details: smallFonts,
    };

    // ===== FOCUS ORDER =====
    const focusableSelectors = [
      'button:not(:disabled)',
      'a[href]',
      'select',
      'input:not([type="hidden"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="tab"]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const focusable = document.querySelectorAll(focusableSelectors.join(','));
    focusable.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        results.focusOrder.push({
          index: index + 1,
          tag: el.tagName,
          class: el.className,
          id: el.id,
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.slice(0, 40) || '',
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        });
      }
    });

    // ===== DOCUMENT FONTS =====
    results.documentFonts = {};
    try {
      if (document.fonts) {
        for (const font of document.fonts) {
          results.documentFonts[font.family] = font.status;
        }
      }
    } catch (e) {
      results.documentFonts.error = e.message;
    }

    // ===== COMPUTED FONTS ON KEY ELEMENTS =====
    results.computedFonts = {};
    const fontChecks = [
      { key: 'body', selector: 'body' },
      { key: 'panel-title', selector: '.panel-header h1' },
      { key: 'section-title', selector: '.section-title' },
      { key: 'kpi-label', selector: '.kpi-label' },
      { key: 'kpi-value', selector: '.kpi-value' },
      { key: 'tab-btn', selector: '.tab-btn' },
      { key: 'funnel-label', selector: '.funnel-label' },
      { key: 'funnel-rate', selector: '.funnel-rate' },
      { key: 'table-th', selector: 'th' },
      { key: 'badge', selector: '.badge' },
      { key: 'btn-primary', selector: '.btn-primary' },
      { key: 'btn-secondary', selector: '.btn-secondary' },
    ];
    for (const fc of fontChecks) {
      const el = document.querySelector(fc.selector);
      if (el) {
        const style = getComputedStyle(el);
        results.computedFonts[fc.key] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
        };
      }
    }

    return results;
  });
}

async function main() {
  console.log('Starting variant measurements...');

  const server = await createVariantServer();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allResults = {
    timestamp: new Date().toISOString(),
    variants: {},
  };

  for (const variant of VARIANTS) {
    console.log(`\n=== Measuring ${variant.label} ===`);
    const baseUrl = `http://127.0.0.1:8081/variants/${variant.file}`;

    const variantResults = {
      label: variant.label,
      viewports: {},
    };

    for (const viewport of VIEWPORTS) {
      console.log(`  Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await waitForApp(page);

      const measurements = await measureAll(page);

      variantResults.viewports[viewport.name] = measurements;
    }

    allResults.variants[variant.name] = variantResults;
  }

  await browser.close();
  server.close();

  // Save results
  const { writeFileSync, mkdirSync } = await import('fs');
  const { join } = await import('path');
  const outputDir = join(__dirname, 'docs', 'ui', 'variants');
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(
    join(outputDir, 'variant-measurements.json'),
    JSON.stringify(allResults, null, 2)
  );

  console.log('\n=== Measurements Complete ===');
  console.log(`Report saved to: ${join(outputDir, 'variant-measurements.json')}`);

  // Print comparison summary - Direction A vs B on Diagnostico
  console.log('\n=== CONTRAST COMPARISON: Direction A vs B (Diagnostico, desktop-1440) ===');
  const keyMetrics = [
    'tab-inactive',
    'tab-active',
    'heading-primary',
    'heading-page',
    'kpi-label',
    'kpi-value',
    'button-primary',
    'button-secondary',
    'badge',
    'funnel-label',
    'funnel-rate',
    'table-header',
    'table-cell',
    'select-text',
  ];

  console.log('\n| Metric | Direction A (Diag) | Direction B (Diag) |');
  console.log('|--------|---------------------|---------------------|');
  for (const metric of keyMetrics) {
    const a = allResults.variants['direction-a-diagnostico'].viewports['desktop-1440'].contrast[metric];
    const b = allResults.variants['direction-b-diagnostico'].viewports['desktop-1440'].contrast[metric];
    const aStr = a ? `${a.contrast.toFixed(2)}:1 ${a.passesAA ? '✅' : '❌'}` : 'N/A';
    const bStr = b ? `${b.contrast.toFixed(2)}:1 ${b.passesAA ? '✅' : '❌'}` : 'N/A';
    console.log(`| ${metric} | ${aStr} | ${bStr} |`);
  }

  // Print contrast for Direction A across all three tabs
  console.log('\n=== CONTRAST: Direction A Across All Tabs (desktop-1440) ===');
  const tabs = [
    { name: 'direction-a-diagnostico', label: 'Diagnóstico' },
    { name: 'direction-a-editoriais', label: 'Linhas Editoriais' },
    { name: 'direction-a-ads', label: 'Meta Ads' },
  ];

  console.log('\n| Metric | Diagnóstico | Linhas Editoriais | Meta Ads |');
  console.log('|--------|-------------|-------------------|----------|');
  for (const metric of keyMetrics) {
    const vals = tabs.map(t => {
      const v = allResults.variants[t.name].viewports['desktop-1440'].contrast[metric];
      return v ? `${v.contrast.toFixed(2)}:1 ${v.passesAA ? '✅' : '❌'}` : 'N/A';
    });
    console.log(`| ${metric} | ${vals[0]} | ${vals[1]} | ${vals[2]} |`);
  }

  console.log('\n=== TOUCH TARGETS (mobile-375) ===');
  for (const variant of VARIANTS) {
    const v = allResults.variants[variant.name].viewports['mobile-375'];
    console.log(`\n${variant.label}:`);
    console.log(`  Total interactive: ${v.touchTargets.totalInteractive}`);
    console.log(`  Below 44px: ${v.touchTargets.below44px}`);
    if (v.touchTargets.details.length > 0) {
      v.touchTargets.details.forEach(t => {
        console.log(`    ${t.tag}.${t.class || ''}: ${t.width}×${t.height} (min: ${t.minDim}px)`);
      });
    }
  }

  console.log('\n=== FONT SIZES < 12px (desktop-1440) ===');
  for (const variant of VARIANTS) {
    const v = allResults.variants[variant.name].viewports['desktop-1440'];
    console.log(`\n${variant.label}: ${v.fontSizes.below12px} elements below 12px`);
    if (v.fontSizes.details.length > 0) {
      v.fontSizes.details.slice(0, 10).forEach(f => {
        console.log(`  ${f.fontSize}px - ${f.tag}.${f.class || ''} (${f.textPreview})`);
      });
    }
  }

  console.log('\n=== OVERFLOW (all viewports) ===');
  for (const variant of VARIANTS) {
    console.log(`\n${variant.label}:`);
    for (const vp of VIEWPORTS) {
      const v = allResults.variants[variant.name].viewports[vp.name];
      console.log(`  ${vp.name}: ${v.geometry.overflowElements} elements overflow (max ratio: ${v.geometry.maxOverflowRatio})`);
    }
  }

  console.log('\n=== DOCUMENT FONTS (desktop-1440) ===');
  for (const variant of VARIANTS) {
    const v = allResults.variants[variant.name].viewports['desktop-1440'];
    console.log(`\n${variant.label}:`);
    for (const [family, status] of Object.entries(v.documentFonts)) {
      console.log(`  ${family}: ${status}`);
    }
  }

  console.log('\n=== COMPUTED FONTS (desktop-1440) ===');
  for (const variant of VARIANTS) {
    const v = allResults.variants[variant.name].viewports['desktop-1440'];
    console.log(`\n${variant.label}:`);
    for (const [key, val] of Object.entries(v.computedFonts)) {
      console.log(`  ${key}: ${val.fontFamily} / ${val.fontSize} / ${val.fontWeight}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});