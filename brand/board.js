const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1.5, viewport: { width: 1400, height: 760 } });
 await p.goto('file://' + path.join(__dirname, 'board.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
 await p.screenshot({ path: path.join(__dirname, 'propositions-logo.png'), fullPage: true }); await b.close(); })();
