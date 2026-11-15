import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://127.0.0.1:8080/';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve to content-signal/docs/ui/antes regardless of cwd
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'ui', 'antes');
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 667 },
];

const TABS = [
  { id: 'tab-diagnostico', label: 'Diagnóstico', selector: '[data-tab="diagnostico"]' },
  { id: 'tab-editoriais', label: 'Linhas Editoriais', selector: '[data-tab="editoriais"]' },
  { id: 'tab-ads', label: 'Meta Ads', selector: '[data-tab="ads"]' },
];

async function waitForApp(page) {
  // Wait for the tabs to be visible and content to load
  await page.waitForFunction(() => {
    const tabs = document.querySelectorAll('[data-tab]');
    return tabs.length >= 3;
  }, { timeout: 10000 });

  // Wait a bit more for any async rendering
  await page.waitForTimeout(1000);
}

async function captureTab(page, tab, viewportName) {
  // Click the tab using JavaScript to avoid interception
  await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (el) el.click();
  }, tab.selector);
  await page.waitForTimeout(500); // Wait for tab transition

  const filename = `${viewportName}-${tab.id}.png`;
  await page.screenshot({
    path: path.join(OUTPUT_DIR, filename),
    fullPage: true
  });

  console.log(`Captured: ${filename}`);
  return filename;
}

async function captureStates(page, viewportName) {
  const states = [];

  // 1. Loading state - capture during initial load
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);
  const loadingFile = `${viewportName}-loading.png`;
  await page.screenshot({ path: path.join(OUTPUT_DIR, loadingFile), fullPage: true });
  states.push({ state: 'loading', file: loadingFile });

  await waitForApp(page);

  // 2. Empty state - would need to clear data, skip for now
  states.push({ state: 'empty', file: 'NOT_OBSERVED', reason: 'Requires clearing localStorage/data' });

  // 3. Error state - not easily triggerable without mocking
  states.push({ state: 'error', file: 'NOT_OBSERVED', reason: 'Requires mocking failed CSV parse' });

  // 4. Focus states - tab through elements
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const focusFile = `${viewportName}-focus-first.png`;
  await page.screenshot({ path: path.join(OUTPUT_DIR, focusFile), fullPage: true });
  states.push({ state: 'focus-first', file: focusFile });

  // Tab through a few more elements
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);
  }
  const focusFile2 = `${viewportName}-focus-multiple.png`;
  await page.screenshot({ path: path.join(OUTPUT_DIR, focusFile2), fullPage: true });
  states.push({ state: 'focus-multiple', file: focusFile2 });

  // 5. Selected state - click on a table row or card if exists
  try {
    const row = await page.$('tbody tr, .card, .post-row, [role="row"]');
    if (row) {
      await row.click();
      await page.waitForTimeout(200);
      const selectedFile = `${viewportName}-selected.png`;
      await page.screenshot({ path: path.join(OUTPUT_DIR, selectedFile), fullPage: true });
      states.push({ state: 'selected', file: selectedFile });
    } else {
      states.push({ state: 'selected', file: 'NOT_OBSERVED', reason: 'No clickable row found' });
    }
  } catch (e) {
    states.push({ state: 'selected', file: 'NOT_OBSERVED', reason: e.message });
  }

  return states;
}

async function measureContrast(page) {
  const measurements = await page.evaluate(() => {
    const results = {};

    function getContrast(fg, bg) {
      function luminance(rgb) {
        const [r, g, b] = rgb.map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
      }

      const l1 = luminance(fg);
      const l2 = luminance(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function parseColor(color) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      return null;
    }

    const selectors = {
      'heading-primary': 'h1, h2, .title, .page-title',
      'text-primary': 'p, .text, .description, td, th',
      'text-secondary': '.secondary, .muted, .subtitle, .label',
      'chart-labels': 'canvas + * , .chart-label, .axis-label',
      'button-primary': 'button:not(.secondary):not(.ghost), .btn-primary',
      'button-secondary': 'button.secondary, .btn-secondary, .ghost',
      'link': 'a',
      'input-label': 'label',
      'tab-active': '[data-tab].active, [data-tab][aria-selected="true"]',
      'tab-inactive': '[data-tab]:not(.active):not([aria-selected="true"])',
    };

    for (const [key, selector] of Object.entries(selectors)) {
      const el = document.querySelector(selector);
      if (el) {
        const style = getComputedStyle(el);
        const fg = parseColor(style.color);
        let bg = parseColor(style.backgroundColor);

        // If background is transparent, walk up the tree
        let bgEl = el;
        let finalBg = bg;
        while ((!finalBg || finalBg[3] === 0) && bgEl.parentElement) {
          bgEl = bgEl.parentElement;
          const bgStyle = getComputedStyle(bgEl);
          finalBg = parseColor(bgStyle.backgroundColor);
        }

        // Default to white if no background found
        if (!finalBg) finalBg = [255, 255, 255];

        if (fg && finalBg) {
          results[key] = {
            contrast: getContrast(fg, finalBg),
            fg: `rgb(${fg.join(',')})`,
            bg: `rgb(${finalBg.join(',')})`,
            selector
          };
        }
      }
    }

    return results;
  });

  return measurements;
}

async function checkKeyboardNavigation(page) {
  const nav = await page.evaluate(() => {
    const focusable = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="menuitem"], [data-tab]'
    );

    const results = [];
    focusable.forEach((el, i) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      results.push({
        index: i,
        tag: el.tagName,
        type: el.type || '',
        role: el.getAttribute('role') || '',
        dataTab: el.getAttribute('data-tab') || '',
        text: el.textContent?.trim().slice(0, 50) || '',
        visible: rect.width > 0 && rect.height > 0,
        focusStyle: {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow
        }
      });
    });

    return results;
  });

  return nav;
}

async function inventoryTokens(page) {
  const tokens = await page.evaluate(() => {
    const result = {};

    // CSS Custom properties from :root
    const rootStyle = getComputedStyle(document.documentElement);
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      if (prop.startsWith('--')) {
        result[prop] = rootStyle.getPropertyValue(prop).trim();
      }
    }

    // Also check for common design tokens in all stylesheets
    const sheets = document.styleSheets;
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.type === CSSRule.STYLE_RULE) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                result[prop] = style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    }

    return result;
  });

  return tokens;
}

async function inventoryComponents(page) {
  const components = await page.evaluate(() => {
    const patterns = {};

    // Cards
    const cards = document.querySelectorAll('.card, .post-card, .metric-card, [class*="card"]');
    if (cards.length > 0) {
      patterns.cards = {
        count: cards.length,
        classes: [...new Set(Array.from(cards).map(c => c.className))],
        sample: cards[0].outerHTML.slice(0, 500)
      };
    }

    // Buttons
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');
    if (buttons.length > 0) {
      patterns.buttons = {
        count: buttons.length,
        classes: [...new Set(Array.from(buttons).map(b => b.className))],
        sample: buttons[0].outerHTML.slice(0, 500)
      };
    }

    // Tables
    const tables = document.querySelectorAll('table');
    if (tables.length > 0) {
      patterns.tables = {
        count: tables.length,
        classes: [...new Set(Array.from(tables).map(t => t.className))],
      };
    }

    // Inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    if (inputs.length > 0) {
      patterns.inputs = {
        count: inputs.length,
        types: [...new Set(Array.from(inputs).map(i => i.type || i.tagName.toLowerCase()))],
      };
    }

    // Modals/Dialogs
    const modals = document.querySelectorAll('[role="dialog"], .modal, .dialog, .overlay');
    if (modals.length > 0) {
      patterns.modals = {
        count: modals.length,
        classes: [...new Set(Array.from(modals).map(m => m.className))],
      };
    }

    // Tabs
    const tabs = document.querySelectorAll('[role="tablist"], .tabs, [data-tab]');
    if (tabs.length > 0) {
      patterns.tabs = {
        count: tabs.length,
        classes: [...new Set(Array.from(tabs).map(t => t.className))],
      };
    }

    // Charts (canvas)
    const charts = document.querySelectorAll('canvas');
    if (charts.length > 0) {
      patterns.charts = {
        count: charts.length,
        classes: [...new Set(Array.from(charts).map(c => c.className))],
      };
    }

    // KPI/Metric cards
    const kpis = document.querySelectorAll('.kpi, .metric, .stat, [class*="kpi"], [class*="metric"]');
    if (kpis.length > 0) {
      patterns.kpis = {
        count: kpis.length,
        classes: [...new Set(Array.from(kpis).map(k => k.className))],
      };
    }

    return patterns;
  });

  return components;
}

async function main() {
  console.log('Starting Signal diagnosis capture...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allResults = {
    timestamp: new Date().toISOString(),
    viewports: {},
    contrast: {},
    keyboard: {},
    tokens: {},
    components: {}
  };

  for (const viewport of VIEWPORTS) {
    console.log(`\n--- Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await waitForApp(page);

    const viewportResults = {
      tabs: {},
      states: {}
    };

    // Capture each tab
    for (const tab of TABS) {
      console.log(`  Capturing tab: ${tab.label}`);
      const filename = await captureTab(page, tab, viewport.name);
      viewportResults.tabs[tab.id] = filename;
    }

    // Capture states (on first tab)
    console.log(`  Capturing states...`);
    viewportResults.states = await captureStates(page, viewport.name);

    // Measure contrast (on first tab)
    console.log(`  Measuring contrast...`);
    allResults.contrast[viewport.name] = await measureContrast(page);

    // Check keyboard navigation
    console.log(`  Checking keyboard navigation...`);
    allResults.keyboard[viewport.name] = await checkKeyboardNavigation(page);

    // Inventory tokens (only once, on desktop)
    if (viewport.name === 'desktop-1440') {
      console.log(`  Inventorying tokens...`);
      allResults.tokens = await inventoryTokens(page);

      console.log(`  Inventorying components...`);
      allResults.components = await inventoryComponents(page);
    }

    allResults.viewports[viewport.name] = viewportResults;
  }

  await browser.close();

  // Save results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'capture-report.json'),
    JSON.stringify(allResults, null, 2)
  );

  console.log('\n=== Capture Complete ===');
  console.log(`Report saved to: ${path.join(OUTPUT_DIR, 'capture-report.json')}`);
  console.log(`Screenshots in: ${OUTPUT_DIR}`);

  // Print summary
  console.log('\n--- Contrast Summary (desktop-1440) ---');
  for (const [key, val] of Object.entries(allResults.contrast['desktop-1440'] || {})) {
    const pass = val.contrast >= 4.5 ? '✅' : val.contrast >= 3 ? '⚠️' : '❌';
    console.log(`  ${key}: ${val.contrast.toFixed(2)}:1 ${pass} (fg: ${val.fg}, bg: ${val.bg})`);
  }

  console.log('\n--- Keyboard Focusable Elements (desktop-1440) ---');
  const kb = allResults.keyboard['desktop-1440'] || [];
  kb.slice(0, 25).forEach(item => {
    const focus = item.focusStyle.outline !== 'none' || item.focusStyle.boxShadow !== 'none' ? '✅' : '❌';
    const tag = item.dataTab ? `${item.tag}[data-tab="${item.dataTab}"]` : item.tag;
    console.log(`  ${item.index}: ${tag} "${item.text}" focus:${focus}`);
  });

  console.log('\n--- Tokens Found ---');
  console.log(`  ${Object.keys(allResults.tokens).length} CSS custom properties`);
  for (const [key, val] of Object.entries(allResults.tokens)) {
    console.log(`    ${key}: ${val}`);
  }

  console.log('\n--- Components Found ---');
  for (const [key, val] of Object.entries(allResults.components)) {
    console.log(`  ${key}: ${val.count} instances`);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});