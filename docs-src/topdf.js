// Conversion HTML → PDF : node topdf.js source.html sortie.pdf largeur hauteur ["Libellé du pied de page"]
// Avec un libellé : pied de page « Youdrink · libellé · date · page n/N » (documents A4).
const { chromium } = require('playwright');
(async () => {
  const [,, src, out, w, h, label] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(__dirname, src));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const d = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  const foot = label ? `<div style="width:100%;font:7.5pt Inter,sans-serif;color:#6d6052;padding:0 16mm;display:flex;justify-content:space-between">
    <span>Youdrink · ${label}</span><span>${d} · page <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>` : '';
  await p.pdf({ path: out, width: w, height: h, printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: !!label, headerTemplate: '<span></span>', footerTemplate: foot || '<span></span>' });
  await b.close();
})();
