import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..', '..');

const TABS = [
  { name: 'diagnostico', label: 'Diagnóstico', panelId: 'panel-diagnostico', tabId: 'tab-diagnostico' },
  { name: 'editoriais', label: 'Linhas Editoriais', panelId: 'panel-editoriais', tabId: 'tab-editoriais' },
  { name: 'ads', label: 'Meta Ads', panelId: 'panel-ads', tabId: 'tab-ads' },
];

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 667 },
];

const THEMES = ['light', 'dark'];

// Simple HTTP server for the app
function createAppServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let filePath = url.pathname;

    // Serve from content-signal root
    const fullPath = join(__dirname, filePath === '/' ? 'index.html' : filePath);
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
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(content);
      return;
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  });

  return new Promise((resolve) => {
    server.listen(8084, '127.0.0.1', () => {
      console.log('App server running at http://127.0.0.1:8084');
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

async function activateTab(page, tabId) {
  await page.click(`#${tabId}`, { force: true });
  await page.waitForTimeout(300);
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

async function measureAll(page, tabName) {
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
      { key: 'heading-page', selector: '.panel-header h1' },
      { key: 'section-title', selector: '.section-title' },
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
      { key: 'label-text', selector: 'label:not(.sr-only)' },
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
  console.log('Starting Lote 2 measurements...');

  const server = await createAppServer();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allResults = {
    timestamp: new Date().toISOString(),
    tabs: {},
  };

  for (const theme of THEMES) {
    console.log(`\n=== Theme: ${theme} ===`);

    // Set color scheme
    await page.emulateMedia({ colorScheme: theme });

    for (const tab of TABS) {
      console.log(`\n  Tab: ${tab.label}`);
      const tabKey = `${tab.name}-${theme}`;

      const tabResults = {
        label: tab.label,
        theme,
        viewports: {},
      };

      for (const viewport of VIEWPORTS) {
        console.log(`    Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://127.0.0.1:8084/', { waitUntil: 'networkidle' });
        await waitForApp(page);

        // Activate the specific tab
        await activateTab(page, tab.tabId);
        await page.waitForTimeout(300);

        const measurements = await measureAll(page, tab.name);

        tabResults.viewports[viewport.name] = measurements;

        // Take screenshot
        const { writeFileSync, mkdirSync } = await import('fs');
        const { join } = await import('path');
        const outputDir = join(__dirname, 'docs', 'ui', 'depois', 'lote-2');
        mkdirSync(outputDir, { recursive: true });

        await page.screenshot({
          path: join(outputDir, `${tab.name}-${theme}-${viewport.name}.png`),
          fullPage: true,
        });
      }

      allResults.tabs[tabKey] = tabResults;
    }
  }

  await browser.close();
  server.close();

  // Save results
  const { writeFileSync, mkdirSync } = await import('fs');
  const { join } = await import('path');
  const outputDir = join(__dirname, 'docs', 'ui', 'depois', 'lote-2');
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(
    join(outputDir, 'lote2-measurements.json'),
    JSON.stringify(allResults, null, 2)
  );

  console.log('\n=== Measurements Complete ===');
  console.log(`Report saved to: ${join(outputDir, 'lote2-measurements.json')}`);

  // Print summary comparison with Lote 1
  console.log('\n=== SUMMARY: Lote 2 Results ===');
  for (const theme of THEMES) {
    console.log(`\n--- ${theme.toUpperCase()} ---`);
    for (const tab of TABS) {
      const tabKey = `${tab.name}-${theme}`;
      const v = allResults.tabs[tabKey].viewports['desktop-1440'];
      console.log(`\n  ${tab.label}:`);
      console.log(`    Contrast failures: ${Object.values(v.contrast).filter(c => !c.passesAA).length}/${Object.keys(v.contrast).length}`);
      console.log(`    Touch targets <44px (mobile): ${v.touchTargets.below44px}/${v.touchTargets.totalInteractive}`);
      console.log(`    Fonts <12px (desktop): ${v.fontSizes.below12px}`);
      console.log(`    Overflow elements: ${v.geometry.overflowElements}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});