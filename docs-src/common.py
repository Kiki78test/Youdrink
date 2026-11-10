# Youdrink — éléments communs aux sources de la documentation (styles, date du jour, historique des versions)
import datetime as _dt, zoneinfo as _zi, os

_n = _dt.datetime.now(_zi.ZoneInfo("Europe/Paris"))
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
D = f"{_n.day} {MOIS[_n.month-1]} {_n.year}"      # date affichée dans les documents
ISO = _n.strftime("%Y-%m-%d")                      # date reportée dans docs/index.json
HERE = os.path.dirname(os.path.abspath(__file__))

# Historique des versions : une ligne par lot important (la plus récente en haut)
HISTORIQUE = [
    ("10/11/2026", "0.2", "Onglet Documentation réservé aux admins (présentation, guide, check-list, services externes) ; en-tête compacté."),
    ("10/11/2026", "0.1", "Socle web en ligne sur Render : comptes, soirées par code en temps réel, calcul serveur des taux et des titres, avatar, mode démo, suivi 7 jours, appli installable, premières règles anti-triche."),
    ("09/11/2026", "proto", "Prototype jouable : calcul Widmark, titres et gages, courbes communes, notifications, avatar évolutif, mode démo avec curseur temporel ; cahier des charges."),
]

FONTS = """
@font-face{font-family:'Bricolage';font-weight:600;src:url(fonts/bricolage-grotesque-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:'Bricolage';font-weight:800;src:url(fonts/bricolage-grotesque-latin-800-normal.woff2) format('woff2')}
"""

TOKENS = """
:root{--bg:#0c0a08;--surface:#18140f;--surface2:#221c15;--line:#2f271e;--fg:#f7f1ea;--muted:#a8998a;
--accent:#f7941d;--ink:#1a1006;--ok:#5bc88a;--warn:#f2c94c;--bad:#ff5a4e;--care:#5ab0ff;
--paper:#fbf7f2;--paper2:#f1e9de;--text:#1d1711;--soft:#6d6052;--rule:#e2d6c6;--deep:#b8650a}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,'DejaVu Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3{font-family:'Bricolage','Inter Display',Inter,sans-serif;font-weight:800;letter-spacing:-.01em;margin:0;text-wrap:balance}
b{font-weight:600}
code{font-family:'DejaVu Sans Mono',monospace;font-size:.88em;background:rgba(247,148,29,.12);padding:1px 5px;border-radius:4px}
"""

# Feuille de style A4 claire (guide, check-list, services) : fond papier chaud, bandeau noir de marque
A4 = FONTS + TOKENS + """
@page{size:210mm 297mm;margin:14mm 16mm 17mm}
body{background:var(--paper);color:var(--text);font-size:10.2pt;line-height:1.5}
.page{page-break-after:always}
.page:last-child{page-break-after:auto}
.band{background:var(--bg);color:var(--fg);border-radius:4mm;margin:0 0 8mm;padding:8mm 9mm 7mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm}
.band img{height:12mm;display:block}
.band .meta{text-align:right;color:var(--muted);font-size:9pt;line-height:1.4}
.band h1{color:var(--fg);font-size:22pt;margin-top:4mm}
.lead{font-size:12pt;color:var(--soft);max-width:160mm;margin:0 0 8mm}
h2{font-size:16pt;margin:8mm 0 3mm;color:var(--text);display:flex;align-items:baseline;gap:3mm}
h2 .n{font-family:'Bricolage',sans-serif;color:var(--deep);font-size:12pt}
h3{font-size:11.5pt;margin:5mm 0 1.5mm}
p{margin:0 0 2.5mm}
ul{margin:0 0 3mm;padding-left:5mm}
li{margin:0 0 1.2mm}
table{width:100%;border-collapse:collapse;margin:2mm 0 4mm;font-size:9.4pt}
th{text-align:left;font-weight:600;color:var(--soft);text-transform:uppercase;letter-spacing:.06em;font-size:7.8pt;border-bottom:1.4px solid var(--text);padding:1.6mm 2mm}
td{border-bottom:1px solid var(--rule);padding:1.8mm 2mm;vertical-align:top}
.note{border-left:3px solid var(--accent);background:var(--paper2);padding:3mm 4mm;margin:3mm 0 4mm;font-size:9.6pt}
.warn{border-left-color:var(--bad)}
.shots{display:flex;gap:5mm;margin:3mm 0 4mm;align-items:flex-start}
.shots figure{margin:0;flex:1}
.shots img{width:100%;border-radius:3.5mm;border:1px solid #000;display:block}
.shots figcaption{font-size:8.4pt;color:var(--soft);margin-top:1.5mm}
.split{display:grid;grid-template-columns:1fr 52mm;gap:7mm;align-items:start}
.split img{width:100%;border-radius:3.5mm;border:1px solid #000}
.foot{display:none}
h2,h3{break-after:avoid}
tr,li,.note,figure{break-inside:avoid}
.toc{columns:2;column-gap:10mm;margin:0;padding-left:0;list-style:none}
.toc li{display:flex;gap:3mm;break-inside:avoid;padding:1.4mm 0;border-bottom:1px solid var(--rule)}
.toc .n{font-family:'Bricolage',sans-serif;color:var(--deep);width:7mm}
.hist td:first-child{white-space:nowrap;font-variant-numeric:tabular-nums}
"""

def band(title, sub=""):
    return f"""<div class="band"><div><img src="../public/logo.png" alt="Youdrink"><h1>{title}</h1></div>
<div class="meta">{sub}<br>Mis à jour le {D}</div></div>"""

def hist_table():
    return "<table class='hist'><tr><th>Date</th><th>Version</th><th>Contenu</th></tr>" + "".join(
        f"<tr><td>{d}</td><td>{v}</td><td>{t}</td></tr>" for d, v, t in HISTORIQUE) + "</table>"

def write(name, html, title):
    path = os.path.join(HERE, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>{title}</title>{html}")
    print("écrit", path)
