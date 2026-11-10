const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1.4, viewport: { width: 1500, height: 720 } });
 await p.goto('file://' + path.join(__dirname, 'board2.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
 await p.screenshot({ path: path.join(__dirname, 'propositions-potion.png'), fullPage: true }); await b.close(); })();
