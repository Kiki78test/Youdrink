// Génère public/logo.png (logo horizontal, fond transparent) et les icônes d'installation.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'render.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await (await p.$('#logo')).screenshot({ path: path.join(__dirname, '..', 'public', 'logo.png'), omitBackground: true });
  for (const n of [512, 192]) {
    await p.setViewportSize({ width: 1200, height: 1200 });
    await p.evaluate(n => { const e = document.getElementById('ic'); e.style.transform = `scale(${n / 512})`; e.style.transformOrigin = '0 0'; }, n);
    const e = await p.$('#ic'); const bb = await e.boundingBox();
    await p.screenshot({ path: path.join(__dirname, '..', 'public', 'icons', `icon-${n}.png`), clip: { x: bb.x, y: bb.y, width: n, height: n } });
  }
  await b.close();
})();
