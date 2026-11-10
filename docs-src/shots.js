// Captures d'écran de l'appli pour la documentation : node shots.js http://localhost:3311 email motdepasse
const { chromium } = require('playwright');
const [,, BASE='http://localhost:3311', EMAIL, PASS] = process.argv;
const out = n => require('path').join(__dirname, 'img', n + '.png');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const p = await c.newPage();
  // Polices servies en local (le réseau de fabrication n'atteint pas Google Fonts)
  const fs = require('fs'), F = require('path').join(__dirname, 'fonts');
  await c.route('https://fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body:
    `@font-face{font-family:'Bricolage Grotesque';font-weight:600;src:url(https://fonts.local/b600.woff2)}@font-face{font-family:'Bricolage Grotesque';font-weight:800;src:url(https://fonts.local/b800.woff2)}` }));
  await c.route('https://fonts.local/**', r => r.fulfill({ contentType: 'font/woff2',
    body: fs.readFileSync(require('path').join(F, r.request().url().includes('600') ? 'bricolage-grotesque-latin-600-normal.woff2' : 'bricolage-grotesque-latin-800-normal.woff2')) }));
  const shot = async (n, full) => { await p.waitForTimeout(450); await p.evaluate(() => document.querySelectorAll('#toasts .toast').forEach(t => t.remove())); await p.screenshot({ path: out(n), fullPage: !!full }); };
  const tab = async t => { await p.click(`nav [data-tab="${t}"]`); await p.evaluate(() => window.scrollTo(0, 0)); };
  await p.goto(BASE); await p.waitForTimeout(900); await shot('auth');
  // démo
  await p.click('#demoBtn');
  const at = async m => { await p.fill('#demoRange', String(m)); await p.dispatchEvent('#demoRange', 'input'); };
  await at(30); await shot('demo-moi-1930');
  await at(215); await shot('demo-moi-2235');
  await at(215); await tab('courbes'); await shot('demo-courbes');
  await at(300); await tab('classement'); await shot('demo-classement', true);
  await at(300); await tab('fil'); await p.waitForTimeout(200); await shot('demo-fil');
  // toasts visibles
  await tab('moi'); await at(60); await p.waitForTimeout(100); await at(95); await p.waitForTimeout(300); await p.screenshot({ path: out('demo-notifs') });
  await p.click('#demoQuit');
  // nouveau joueur : repas avant le premier verre
  await p.click('#mReg'); await p.fill('#email', 'demo' + Date.now() + '@exemple.invalid'); await p.fill('#pass', 'motdepasse-demo'); await p.check('#consent');
  await p.click('#authForm button[type=submit]'); await p.waitForTimeout(1200);
  await p.fill('#pseudo', 'Sacha'); await p.fill('#age', '29'); await p.fill('#height', '172'); await p.fill('#weight', '66');
  await p.click('#saveProf'); await p.waitForTimeout(900); await p.click('#create'); await p.waitForTimeout(1500);
  await shot('repas-avant');
  await p.click('#mealsOk'); await p.waitForTimeout(1500); await p.click('[data-p="2"]'); await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('#mAdd').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelectorAll('#toasts .toast').forEach(t => t.remove())); await p.screenshot({ path: out('repas-liste') });
  await p.click('#profBtn'); await p.waitForTimeout(500); await p.click('#delAcc'); await p.click('#delYes'); await p.waitForTimeout(1200);
  if (EMAIL) {
    await p.click('#mLogin'); await p.fill('#email', EMAIL); await p.fill('#pass', PASS); await p.click('#authForm button[type=submit]');
    await p.waitForTimeout(1500); await shot('soiree-moi', true);
    await p.click('#profBtn'); await p.waitForTimeout(800); await shot('profil', true);
    await p.click('#docsBtn'); await p.waitForTimeout(800); await shot('documentation');
  }
  await b.close();
})();
