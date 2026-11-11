# Titres et expressions — source de docs/02-presentation/titres-et-expressions.pdf
# Les titres actuels doivent rester alignés sur events() dans public/engine.js.
from common import A4, D, band, write

ACTUELS = [
 ("Sam de la soirée", "Trophée", "+10", "Le joueur choisit le rôle de Sam (reste à zéro)"),
 ("Premières bulles", "Trophée", "+10", "0,2 g/L"),
 ("Joues roses", "Trophée", "+10", "0,4 g/L"),
 ("Clés confisquées", "Info", "0", "0,5 g/L : plus de volant ce soir"),
 ("Philosophe de comptoir", "Trophée", "+10", "0,8 g/L, dernier titre à gagner en montant"),
 ("Hors plafond", "Honte", "−15", "Dépasse son plafond perso (s'il est sous 1,2 g/L)"),
 ("La Fusée", "Honte", "−15", "+0,5 g/L en une heure"),
 ("Le Naufragé", "Honte", "−15", "1,2 g/L : passage à l'eau"),
 ("Alerte copains", "Veille", "0", "1,5 g/L : les amis apportent de l'eau et surveillent"),
 ("Alerte rouge", "Veille", "0", "2 g/L : rester avec lui, appeler le 15 si besoin"),
 ("Atterrissage en douceur", "Trophée", "+10", "Redescend sous 0,2 g/L après un pic d'au moins 0,4"),
 ("Retour sur Terre", "Trophée", "+10", "Revenu à zéro"),
 ("Le Chameau", "Trophée", "+10", "3 verres d'eau"),
 ("L'Oasis", "Trophée", "+10", "6 verres d'eau"),
]
STADES = ["0 · En forme", "1 · Premier verre (0,05)", "2 · Détendu (0,2)", "3 · Pompette (0,35)", "4 · Éméché (0,5)",
          "5 · Fou rire (0,65)", "6 · Hilare (0,8)", "7 · Ça tourne (1,0)", "8 · Les étoiles (1,2)", "9 · KO (1,5)"]

PROPOSES = [
 ("Le facteur remonte sur le vélo", "Honte", "Un verre d'alcool le lendemain d'une soirée", "Mémoriser la soirée de la veille"),
 ("Tuer le ver", "Honte", "Un verre d'alcool avant midi", ""),
 ("Mal aux cheveux", "Info", "Message du matin après une soirée au-dessus de 1 g/L", "Notification push"),
 ("Mettre de l'eau dans son vin", "Trophée", "Un verre d'eau entre deux verres d'alcool, toute la soirée", ""),
 ("Le trou normand", "Info", "Un shot pendant un repas", ""),
 ("Le pousse-café", "Info", "Un digestif après le repas", ""),
 ("Bonne descente", "Honte", "À la place ou en plus de « La Fusée »", ""),
 ("Rond comme une queue de pelle", "Info", "Nom possible du stade 8 de l'avatar", ""),
 ("C'est ma tournée", "Trophée", "Plusieurs verres ajoutés pour le groupe", "Saisie groupée à créer"),
 ("Pilier de bar", "Badge", "Badge long terme (nombre de soirées)", "Avec les badges à paliers"),
 ("Boire comme un oiseau", "Trophée", "Soirée finie sous 0,3 g/L", ""),
 ("Juste une larme", "Trophée", "Un seul verre d'alcool de la soirée", ""),
 ("Le verre de l'amitié", "Trophée", "Tous les joueurs trinquent dans les 5 min", "Bouton « Tchin » à créer"),
 ("Le coup de l'étrier", "Info", "Dernier verre de la soirée, avec rappel : on ne conduit pas", "Formulation à valider (loi Évin)"),
]

LEXIQUE = [
 ("Le lendemain", "remettre le facteur sur le vélo · reprendre du poil de la bête · soigner le mal par le mal · tuer le ver · le petit blanc du matin · avoir la gueule de bois · avoir mal aux cheveux · avoir la bouche pâteuse · avoir la casquette · être dans le coaltar"),
 ("Boire", "boire un coup · prendre un verre · boire un canon · boire un godet · s'en jeter un derrière la cravate · s'en envoyer un · siffler un verre · lever le coude · se rincer le gosier · s'humecter le gosier · picoler · biberonner · écluser · tiser (Nord) · chopiner · faire cul sec · boire comme un trou · boire comme une éponge · avoir une bonne descente · avoir le gosier en pente · boire jusqu'à plus soif · noyer son chagrin"),
 ("Être ivre, du plus léger au plus fort", "pompette · éméché · gai · gris · avoir un coup dans le nez · avoir du vent dans les voiles · paf · chargé · beurré comme un petit Lu · avoir son compte · rond comme une queue de pelle · rond comme une bille · rond comme une barrique · plein comme une huître · plein comme une outre · bourré · pété · cuit · torché · schlass · rétamé · murgé · fait · raide · voir double · tenir les murs · marcher en zigzag · rouler sous la table · finir sous la table"),
 ("La soirée elle-même", "prendre une cuite · une biture · une murge · une caisse · une mine · faire la tournée des grands-ducs"),
 ("Rituels et moments", "payer sa tournée · « c'est ma tournée » · l'apéro · le verre de l'amitié · le trou normand · le pousse-café · le coup de l'étrier · faire chabrot (Sud-Ouest : vin dans le fond de la soupe)"),
 ("Trinquer", "Santé ! · Tchin ! · À la vôtre ! · À la tienne, Étienne ! · À nos amours ! · Cul sec !"),
 ("Modération", "mettre de l'eau dans son vin · être à l'eau · être au régime sec · boire comme un oiseau · juste une larme · juste un fond · tenir l'alcool"),
 ("Personnages", "un pilier de bar · un poivrot · un soiffard · un sac à vin · une éponge"),
 ("Hors de France", "Belgique : avoir une pétée · Québec : prendre une brosse, être paqueté, être chaud · Suisse : être pété"),
]

CSS = A4 + """
table.t{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:5mm}
table.t th{background:var(--paper2);text-align:left;padding:1.8mm 2mm;font-weight:600}
table.t td{padding:1.8mm 2mm;border-bottom:1px solid var(--rule);vertical-align:top}
table.t tr{break-inside:avoid}
td.dec{width:20mm;border-left:1px dashed var(--rule)}
.k{display:inline-block;padding:.3mm 2mm;border-radius:3mm;font-size:8pt;font-weight:600}
.k.Trophée{background:#ffe9a8;color:#5a4300}.k.Honte{background:#ffd3d0;color:#7a1a14}.k.Info{background:#d6e8ff;color:#123e78}
.k.Veille{background:#ffe1c2;color:#7a3f00}.k.Badge{background:#e3dcff;color:#3a2a80}
.lx{margin:0 0 3.5mm}.lx b{display:block;margin-bottom:.8mm}.lx p{margin:0;font-size:9pt;line-height:1.55}
.st{display:flex;flex-wrap:wrap;gap:1.5mm 2mm;font-size:8.6pt}.st span{background:var(--paper2);padding:.6mm 2.2mm;border-radius:3mm}
"""
k = lambda x: f"<span class='k {x}'>{x}</span>"
act = "".join(f"<tr><td><b>{t}</b></td><td>{k(c)}</td><td>{p}</td><td>{q}</td></tr>" for t, c, p, q in ACTUELS)
pro = "".join(f"<tr><td><b>{t}</b></td><td>{k(c)}</td><td>{q}</td><td>{r}</td><td class='dec'></td></tr>" for t, c, q, r in PROPOSES)
lex = "".join(f"<div class='lx'><b>{t}</b><p>{x}</p></div>" for t, x in LEXIQUE)
st = "".join(f"<span>{s}</span>" for s in STADES)

body = f"""<div class="page">{band("Titres et expressions", "Le jeu")}
<p class="lead">Les titres qui existent dans l'appli, les expressions françaises qui pourraient en devenir de nouveaux, et le lexique complet pour piocher des noms, des notifications et des bulles d'avatar.</p>
<h2>1. Titres actuels</h2>
<table class="t"><tr><th>Titre</th><th>Type</th><th>Points</th><th>Quand il se débloque</th></tr>{act}</table>
<p style="font-size:9pt">Trophée = +10 points, honte = −15 points, info et veille = 0. Un titre ne se gagne qu'une fois par soirée.</p>
<h3>Stades de l'avatar (seuils en g/L, identiques pour tous)</h3><div class="st">{st}</div>
<h2>2. Expressions proposées comme nouveaux titres</h2>
<p style="font-size:9pt">À trancher : la colonne « Décision » est laissée vide.</p>
<table class="t"><tr><th>Titre proposé</th><th>Type</th><th>Quand il se débloquerait</th><th>À prévoir</th><th>Décision</th></tr>{pro}</table>
<h2>3. Lexique des expressions</h2>
<p style="font-size:9pt">Liste des expressions courantes, à compléter au fil des idées ; il en existe beaucoup d'autres selon les régions.</p>
{lex}
<h2>4. À éviter</h2>
<ul style="font-size:9pt"><li><b>« Saoul comme un Polonais »</b> : vise une nationalité.</li>
<li><b>« Un dernier pour la route »</b> : évoque la conduite (loi Évin, règles des stores).</li>
<li>Tout titre qui récompense l'excès : les hauts taux restent des hontes ou des alertes, jamais des trophées.</li></ul>
<div class="foot"><span>Alamb’hic · Titres et expressions</span><span>{D}</span></div></div>"""

write("titres.html", f"<style>{CSS}</style></head><body>{body}</body></html>", "Titres et expressions")
