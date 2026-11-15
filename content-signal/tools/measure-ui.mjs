import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:8080/';
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
  await page.waitForFunction(() => {
    const tabs = document.querySelectorAll('[data-tab]');
    return tabs.length >= 3;
  }, { timeout: 10000 });
  await page.waitForTimeout(1000);
}

async function switchTab(page, tabSelector) {
  await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (el) el.click();
  }, tabSelector);
  await page.waitForTimeout(500);
}

function luminance(rgb) {
  // Handle both arrays and objects with numeric keys (from Playwright serialization)
  const arr = Array.isArray(rgb) ? rgb : [rgb[0], rgb[1], rgb[2]];
  const [r, g, b] = arr.map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseColor(color) {
  // Handle rgb, rgba, and transparent
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  return null;
}

async function measureContrastAccurate(page) {
  return await page.evaluate(() => {
    function parseColorLocal(color) {
      if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      return null;
    }

    function luminanceLocal(rgb) {
      // Handle both arrays and objects with numeric keys
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

    // Walk up DOM to find first opaque background
    function getEffectiveBg(el) {
      let current = el;
      while (current) {
        const style = getComputedStyle(current);
        const bgColor = style.backgroundColor;
        const bg = parseColorLocal(bgColor);
        if (bg) return bg;
        current = current.parentElement;
      }
      return [255, 255, 255]; // default white
    }

    const results = {};

    // Specific elements to test - using more specific selectors
    const testCases = [
      { key: 'tab-inactive', selector: '[data-tab]:not(.active):not([aria-selected="true"])' },
      { key: 'tab-active', selector: '[data-tab].active, [data-tab][aria-selected="true"]' },
      { key: 'text-primary', selector: '.kpi-label' },
      { key: 'text-secondary', selector: '.kpi-sub' },
      { key: 'heading-primary', selector: '.section-title' },
      { key: 'button-primary', selector: '.btn-primary' },
      { key: 'button-secondary', selector: '.btn-secondary' },
      { key: 'button-ghost', selector: '.btn-ghost' },
      { key: 'badge', selector: '.badge' },
      { key: 'tab-btn-text', selector: '.tab-btn' },
      { key: 'funnel-label', selector: '.funnel-label' },
      { key: 'funnel-rate', selector: '.funnel-rate' },
      { key: 'table-header', selector: 'th' },
      { key: 'table-cell', selector: 'td' },
      { key: 'chart-canvas-label', selector: 'canvas + *' },
      { key: 'input-text', selector: 'input[type="text"]' },
      { key: 'select-text', selector: 'select' },
    ];

    for (const tc of testCases) {
      const elements = document.querySelectorAll(tc.selector);
      if (elements.length > 0) {
        // Test first visible element
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const style = getComputedStyle(el);
            const fg = parseColorLocal(style.color);
            const bg = getEffectiveBg(el);

            if (fg && bg) {
              results[tc.key] = {
                contrast: contrastLocal(fg, bg),
                fg: `rgb(${fg.join(',')})`,
                bg: `rgb(${bg.join(',')})`,
                selector: tc.selector,
                elementTag: el.tagName,
                elementClass: el.className,
                sampleCount: elements.length
              };
            }
            break;
          }
        }
      }
    }

    // Also test tab inactive specifically - get the actual computed colors
    const tabInactive = document.querySelector('[data-tab]:not(.active)');
    if (tabInactive) {
      const style = getComputedStyle(tabInactive);
      results['tab-inactive-debug'] = {
        color: style.color,
        backgroundColor: style.backgroundColor,
        parentBg: getComputedStyle(tabInactive.parentElement).backgroundColor,
        grandParentBg: getComputedStyle(tabInactive.parentElement?.parentElement).backgroundColor,
      };
    }

    return results;
  });
}

async function checkFontsAccurate(page) {
  return await page.evaluate(() => {
    const results = {
      documentFonts: {},
      canvasFontUsage: [],
      chartsJsFontStrings: [],
      computedFonts: {}
    };

    // Check document.fonts
    try {
      if (document.fonts && document.fonts.ready) {
        // Can't await in page.evaluate, just check status directly
        for (const font of document.fonts) {
          results.documentFonts[font.family] = font.status;
        }
      }
    } catch (e) {
      results.documentFonts.error = e.message;
    }

    // Check computed font-family on various elements
    const elementsToCheck = [
      { key: 'body', selector: 'body' },
      { key: 'section-title', selector: '.section-title' },
      { key: 'kpi-label', selector: '.kpi-label' },
      { key: 'kpi-value', selector: '.kpi-value' },
      { key: 'tab-btn', selector: '.tab-btn' },
      { key: 'chart-label', selector: 'canvas + *' },
      { key: 'funnel-label', selector: '.funnel-label' },
      { key: 'table-th', selector: 'th' },
      { key: 'badge', selector: '.badge' },
    ];

    for (const ec of elementsToCheck) {
      const el = document.querySelector(ec.selector);
      if (el) {
        const style = getComputedStyle(el);
        results.computedFonts[ec.key] = {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        };
      }
    }

    // Search for IBM Plex Sans in inline scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(s => {
      if (s.textContent && s.textContent.includes('IBM Plex Sans')) {
        results.chartsJsFontStrings.push({
          src: s.src || 'inline',
          snippet: s.textContent.slice(0, 200)
        });
      }
    });

    return results;
  });
}

async function main() {
  console.log('Starting accurate contrast & font measurements...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allResults = {
    timestamp: new Date().toISOString(),
    viewports: {}
  };

  for (const viewport of VIEWPORTS) {
    console.log(`\n--- Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await waitForApp(page);

    const viewportResults = {
      tabs: {},
      contrast: {},
      fonts: {}
    };

    // Measure on first tab (Diagnóstico)
    viewportResults.contrast['tab-diagnostico'] = await measureContrastAccurate(page);
    viewportResults.fonts['tab-diagnostico'] = await checkFontsAccurate(page);

    // Measure on each tab
    for (const tab of TABS) {
      await switchTab(page, tab.selector);
      viewportResults.contrast[tab.id] = await measureContrastAccurate(page);
      viewportResults.fonts[tab.id] = await checkFontsAccurate(page);
    }

    allResults.viewports[viewport.name] = viewportResults;
  }

  await browser.close();

  // Save results
  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), 'docs', 'ui', 'antes');
  fs.writeFileSync(
    path.join(outputDir, 'measurements-03-contrast.json'),
    JSON.stringify(allResults, null, 2)
  );

  console.log('\n=== Measurements Complete ===');
  console.log(`Report saved to: ${path.join(outputDir, 'measurements-03-contrast.json')}`);

  // Print contrast summary
  console.log('\n--- Contrast Summary (desktop-1440, Diagnóstico tab) ---');
  const diagContrast = allResults.viewports['desktop-1440'].contrast['tab-diagnostico'] || {};
  for (const [key, val] of Object.entries(diagContrast)) {
    if (val.contrast !== undefined && val.contrast !== null) {
      const pass = val.contrast >= 4.5 ? '✅' : val.contrast >= 3 ? '⚠️' : '❌';
      console.log(`  ${key}: ${val.contrast.toFixed(2)}:1 ${pass} (fg: ${val.fg}, bg: ${val.bg})`);
    }
  }

  // Print font status
  console.log('\n--- Font Status (desktop-1440) ---');
  const fontStatus = allResults.viewports['desktop-1440'].fonts['tab-diagnostico']?.documentFonts || {};
  for (const [family, status] of Object.entries(fontStatus)) {
    console.log(`  ${family}: ${status}`);
  }

  // Print computed fonts
  console.log('\n--- Computed Fonts (desktop-1440) ---');
  const compFonts = allResults.viewports['desktop-1440'].fonts['tab-diagnostico']?.computedFonts || {};
  for (const [key, val] of Object.entries(compFonts)) {
    console.log(`  ${key}: ${val.fontFamily} / ${val.fontSize} / ${val.fontWeight}`);
  }

  // Print IBM Plex Sans findings
  console.log('\n--- IBM Plex Sans in Scripts ---');
  const ibmFonts = allResults.viewports['desktop-1440'].fonts['tab-diagnostico']?.chartsJsFontStrings || [];
  ibmFonts.forEach(f => {
    console.log(`  Source: ${f.src}`);
    console.log(`  Snippet: ${f.snippet}`);
  });
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});