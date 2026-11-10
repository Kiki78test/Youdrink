# Présentation complète Alamb’hic — source de docs/02-presentation/presentation-complete.pdf
# Organisée par sujet (les nouveautés vont dans leur chapitre), avec une courte annexe « Historique des versions ».
from common import FONTS, TOKENS, D, HISTORIQUE, write

CSS = FONTS + TOKENS + """
@page{size:254mm 142.875mm;margin:0}
body{background:var(--bg);color:var(--fg)}
.s{width:254mm;height:142.875mm;padding:12mm 15mm;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column}
.s:last-child{page-break-after:auto}
.k{font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:3mm}
h1{font-size:30pt;line-height:1.02}
h2{font-size:21pt;line-height:1.08;max-width:150mm}
p,li{font-size:11pt;line-height:1.45;color:#e6ddd2}
.muted{color:var(--muted)}
ul{padding-left:5mm;margin:3mm 0}
li{margin-bottom:1.6mm}
.cols{display:grid;grid-template-columns:1fr auto;gap:12mm;flex:1;min-height:0;align-items:center}
.phone{width:50mm;height:108mm;object-fit:cover;object-position:top;border-radius:5mm;border:1.2px solid var(--line);box-shadow:0 6mm 14mm rgba(0,0,0,.5);display:block}
.phones{display:flex;gap:6mm;align-items:center}
.num{position:absolute;right:15mm;bottom:8mm;font-size:8pt;color:var(--muted)}
.cards{display:grid;gap:4mm;margin-top:5mm}
.card{background:var(--surface);border:1px solid var(--line);border-radius:3.5mm;padding:4mm 5mm}
.card b{display:block;font-family:'Bricolage',sans-serif;font-size:12.5pt;margin-bottom:1mm;color:var(--fg)}
.card span{font-size:9.6pt;color:var(--muted);line-height:1.4;display:block}
table{border-collapse:collapse;width:100%;font-size:9.6pt;margin-top:3mm}
th{text-align:left;color:var(--muted);font-weight:600;font-size:7.6pt;letter-spacing:.08em;text-transform:uppercase;padding:1.6mm 2mm;border-bottom:1px solid var(--muted)}
td{padding:1.7mm 2mm;border-bottom:1px solid var(--line);color:#e6ddd2;vertical-align:top}
.pill{display:inline-block;font-size:8pt;font-weight:600;padding:.6mm 2.4mm;border-radius:9mm;border:1px solid currentColor}
.t{color:var(--accent)}.h{color:var(--bad)}.c{color:var(--care)}.o{color:var(--ok)}.w{color:var(--warn)}
.cover{justify-content:center;background:radial-gradient(120mm 90mm at 85% 20%,rgba(47,140,255,.22),transparent 70%),var(--bg)}
.cover img.logo{height:30mm;align-self:flex-start;margin-bottom:9mm}
.cover h1{font-size:34pt}
.cover p{font-size:13pt;max-width:150mm;color:var(--muted);margin-top:4mm}
.avs{display:grid;grid-template-columns:repeat(6,1fr);gap:3mm;margin-top:5mm;text-align:center}
.avs div{background:var(--surface);border:1px solid var(--line);border-radius:3.5mm;padding:3mm 1mm 3mm}
.avs b{display:block;font-family:'Bricolage',sans-serif;font-size:13pt;font-variant-numeric:tabular-nums}
.avs span{font-size:8.4pt;color:var(--muted)}
.av svg{width:100%;height:auto;max-height:34mm}
.road{display:grid;grid-template-columns:repeat(5,1fr);gap:3mm;margin-top:6mm}
.road div{border:1px solid var(--line);border-radius:3.5mm;padding:4mm;background:var(--surface);position:relative}
.road div.now{border-color:var(--accent);background:rgba(47,140,255,.12)}
.road b{font-family:'Bricolage',sans-serif;font-size:12pt;display:block;margin:1mm 0 2mm}
.road span{font-size:9pt;color:var(--muted);line-height:1.35;display:block}
.road i{font-style:normal;font-size:7.6pt;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:600}
.formula{font-family:'DejaVu Sans Mono',monospace;font-size:11pt;background:var(--surface);border:1px solid var(--line);border-radius:3mm;padding:4mm 5mm;margin:4mm 0;color:var(--fg)}
.arch{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:5mm}
"""

def img(n, cls="phone"): return f'<img class="{cls}" src="img/{n}.png">'
N = [0]
def slide(inner, cls=""):
    N[0] += 1
    return f'<section class="s {cls}">{inner}<span class="num">Alamb’hic · {N[0]}</span></section>'

S = []
S.append(slide(f"""<img class="logo" src="../public/logo.png"><div class="k">Présentation complète · {D}</div>
<h1>On trinque, on se chambre,<br>on se surveille.</h1>
<p>Le jeu de soirée entre amis où l'on rit du taux des autres, et où le groupe veille à ce que personne ne dépasse les bornes.</p>""", "cover"))

S.append(slide("""<div class="k">Le concept</div><h2>La modération rapporte, l'excès coûte</h2>
<div class="cards" style="grid-template-columns:repeat(3,1fr)">
<div class="card"><b>Chacun note ses verres</b><span>Bière, vin, shot, cocktail ou eau, en un geste. Alamb’hic estime le taux de chacun minute par minute.</span></div>
<div class="card"><b>On se chambre</b><span>Titres à débloquer, avatars qui changent de tête, classement et notifications moqueuses chez tous les amis.</span></div>
<div class="card"><b>Le groupe veille</b><span>Au-delà du plafond, le titre devient une honte avec gage sans alcool. À 1,5 g/L, les amis sont alertés.</span></div>
</div>
<p class="muted" style="margin-top:6mm">Réservé aux 18 ans et plus. Pensé pour les soirées à domicile, sans prendre la route. Le taux est une estimation, jamais une autorisation de conduire.</p>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">Démarrer</div><h2>Un compte, un profil, un code de soirée</h2>
<ul><li><b>Compte</b> par e-mail et mot de passe, Google ensuite.</li>
<li><b>Profil</b> : sexe, âge, taille, poids et plafond perso. Ces mesures servent au calcul et ne sont jamais montrées aux autres.</li>
<li><b>Soirée</b> : l'un crée un code de 4 lettres, les autres le saisissent. Le bouton « Copier l'invitation » l'envoie au groupe.</li>
<li><b>Appli installable</b> depuis le navigateur, avec l'icône Alamb’hic.</li></ul></div>
<div class="phones">{img("auth")}{img("soiree-moi")}</div></div>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">L'écran Moi</div><h2>Son taux, son avatar, ses verres</h2>
<ul><li>Taux estimé en grand, état coloré : sobre, pompette, interdit de conduire, au-dessus du plafond, alerte.</li>
<li>Jauge avec les seuils 0,5, plafond et 1,2 g/L ; pic de la soirée et heure estimée du retour à 0.</li>
<li>Huit boissons prêtes, un verre perso (volume et degré), « bu il y a 15 min à 1 h ».</li>
<li>Repas du jour demandés avant le premier verre, ajout d'un repas à tout moment, question « avez-vous dîné ? » à l'heure des repas.</li>
<li>Mes titres et l'historique de mes verres.</li></ul></div>
<div class="phones">{img("demo-moi-1930")}{img("demo-moi-2235")}</div></div>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">Courbes communes</div><h2>Toute la soirée sur un seul graphique</h2>
<ul><li>Une couleur par joueur, les seuils en pointillés.</li>
<li>Trait plein jusqu'à maintenant, pointillés pour la redescente prévue si plus personne ne boit.</li>
<li>Calculé par le serveur pour tout le monde : chaque téléphone voit la même chose.</li></ul></div>
<div class="phones">{img("demo-courbes")}</div></div>"""))

S.append(slide("""<div class="k">Titres et points</div><h2>Un titre gagné +10, un titre de honte −15</h2>
<table><tr><th>Famille</th><th>Titres</th><th>Effet</th></tr>
<tr><td><span class="pill t">Montée</span></td><td>Premières bulles (0,2) · Joues roses (0,4) · Philosophe de comptoir (0,8), dernier titre à gagner en montant</td><td>+10</td></tr>
<tr><td><span class="pill h">Honte</span></td><td>Hors plafond · Le Naufragé (1,2) · La Fusée (+0,5 g/L en une heure)</td><td>−15 et gage sans alcool</td></tr>
<tr><td><span class="pill o">Modération</span></td><td>Atterrissage en douceur (sous 0,2 après 0,4) · Retour sur Terre (retour à 0)</td><td>+10</td></tr>
<tr><td><span class="pill c">Hydratation</span></td><td>Le Chameau (3 verres d'eau) · L'Oasis (6 verres d'eau)</td><td>+10</td></tr>
<tr><td><span class="pill o">Solidarité</span></td><td>Sam de la soirée (zéro alcool)</td><td>+10</td></tr>
<tr><td><span class="pill w">Info</span></td><td>Clés confisquées (0,5 g/L)</td><td>aucun point</td></tr></table>
<p class="muted" style="margin-top:4mm">Gages tirés au sort parmi huit, toujours sans alcool : verres d'eau, compliments, imitation, chanson, mime…</p>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">Classement, fil et notifications</div><h2>Tout le monde est prévenu, tout de suite</h2>
<ul><li>Chaque titre et chaque seuil s'affiche en notification sur tous les téléphones de la soirée, avec vibration.</li>
<li>Le ton change avec le niveau : moqueur, puis gage, puis <span class="c">« apportez-lui de l'eau »</span> à 1,5 g/L et rappel du 15 à 2 g/L.</li>
<li>Le fil garde tout l'historique, suppressions de verres comprises.</li>
<li>Classement par points : rester raisonnable rapporte plus que grimper.</li></ul></div>
<div class="phones">{img("demo-notifs")}{img("demo-classement")}</div></div>"""))

AV = [(0, "En forme"), (0.3, "Pompette"), (0.6, "Éméché"), (0.9, "Lunettes de travers"), (1.2, "Au-dessus du plafond"), (1.7, "Allongé")]
S.append(slide("""<div class="k">L'avatar</div><h2>Il évolue en continu avec le taux</h2>
<div class="avs">""" + "".join(f'<div><div class="av" data-b="{b}"></div><b>{str(b).replace(".", ",")}</b><span>{t}</span></div>' for b, t in AV) + """</div>
<p class="muted" style="margin-top:5mm">Rougeurs, nez, paupières, sourire puis grimace, tête qui penche, clés barrées à 0,5, hoquet, lunettes, teint vert et cheveux en bataille au-delà du plafond, allongé à 1,5 g/L. Pendant 25 minutes après chaque verre, il tient le bon modèle de verre ; en redescente, un verre d'eau.</p>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">Mode démo</div><h2>Une soirée fictive, en accéléré</h2>
<ul><li>Bouton « Démo » toujours visible en haut, même sans compte.</li>
<li>Quatre joueurs de 19 h à 6 h : Léa raisonnable, Max qui dérape, Tom modéré, Inès qui joue Sam.</li>
<li>Curseur pour avancer ou reculer dans le temps, bouton Lecture : titres débloqués, avatars, courbes et alertes se déroulent.</li>
<li>Rien n'est enregistré : on peut ajouter des verres à Léa pour essayer.</li></ul></div>
<div class="phones">{img("demo-fil")}</div></div>"""))

S.append(slide("""<div class="k">Le calcul</div><h2>Formule de Widmark, eau corporelle de Watson</h2>
<div class="formula">taux (g/L) = alcool absorbé (g) × 0,8 ÷ eau corporelle (L) − 0,15 g/L par heure</div>
<div class="cards" style="grid-template-columns:repeat(3,1fr)">
<div class="card"><b>Alcool d'un verre</b><span>volume × degré × 0,789 g/ml. Un verre standard contient 10 g d'alcool pur.</span></div>
<div class="card"><b>Repas</b><span>À jeun : absorption en 30 min. Grignotage, repas léger, complet ou copieux : 45 à 90 min, et 5 à 20 % d'alcool en moins dans le sang.</span></div>
<div class="card"><b>Eau corporelle</b><span>Selon le sexe, l'âge, la taille et le poids (formules de Watson).</span></div></div>
<p class="muted" style="margin-top:5mm">L'écart avec un éthylotest peut dépasser 0,2 g/L. L'étape 3 ajoutera la saisie d'une mesure réelle et un recalibrage personnel.</p>"""))

S.append(slide("""<div class="k">Fiabilité et anti-triche</div><h2>Tout repose sur l'écart entre verres déclarés et réels</h2>
<div class="cards" style="grid-template-columns:1fr 1fr">
<div class="card"><b>Déjà en place</b><span>Calcul côté serveur · verre antidaté de 3 h au plus · suppression possible 3 h et visible dans le fil · 6 verres d'alcool au plus en 10 min · Sam limité aux boissons sans alcool.</span></div>
<div class="card"><b>À venir</b><span>Éthylotest Bluetooth qui fait foi et recalibre · validation des verres par les amis · gorgées détectées par l'inclinaison de la montre · photo du verre · indice de fiabilité par joueur, seul le classement des soirées fiables compte en public.</span></div></div>"""))

S.append(slide(f"""<div class="cols"><div><div class="k">Suivi long terme</div><h2>Pour réduire, pas seulement pour rire</h2>
<ul><li>Page Profil : verres standard des 7 derniers jours, comparés aux repères de Santé publique France (10 par semaine au plus, 2 par jour, des jours sans alcool).</li>
<li>Jours sans alcool comptés, barres en rouge au-delà de 2 verres.</li>
<li>À venir : bilan mensuel, objectifs perso, trophées long terme, défis entre amis (mois sec en équipe).</li></ul></div>
<div class="phones">{img("profil")}</div></div>"""))

S.append(slide("""<div class="k">Architecture et supports</div><h2>Un seul serveur pour le site, l'APK et la montre</h2>
<div class="arch">
<div class="card"><b>Aujourd'hui</b><span>Site web installable sur alambhic.onrender.com · serveur Node et temps réel · base PostgreSQL · Render à Francfort · code sur GitHub.</span></div>
<div class="card"><b>APK Android</b><span>Même appli emballée, notifications push Firebase appli fermée, widget écran d'accueil (jauge, retour à 0, + bière / + vin / + eau).</span></div>
<div class="card"><b>Montre Wear OS</b><span>Ajouter un verre au poignet, taux en complication, vibration aux seuils et quand un ami est en alerte, gorgées détectées.</span></div></div>"""))

ROAD = [("1", "Socle web", "Comptes, soirées, calcul serveur, titres, avatar, démo, suivi 7 jours", True),
        ("2", "APK Android", "Push Firebase, widget écran d'accueil", False),
        ("3", "Fiabilité", "Éthylotest, recalibrage, validation par les amis", False),
        ("4", "Montre, long terme", "Wear OS et gorgées, tableau de bord, objectifs", False),
        ("5", "Ouverture publique", "Localisation approximative, défis, publicités, premium", False)]
S.append(slide("""<div class="k">Feuille de route</div><h2>Cinq étapes, le site d'abord</h2><div class="road">""" + "".join(
    f'<div class="{"now" if n else ""}"><i>{"En cours · " if n else ""}Étape {k}</i><b>{t}</b><span>{d}</span></div>' for k, t, d, n in ROAD) +
    """</div><p class="muted" style="margin-top:6mm">Validations entre les étapes : un test en vraie soirée, un test sur vos téléphones, puis une relecture juridique (RGPD, loi Évin, stores) avant toute ouverture au public.</p>"""))

S.append(slide("""<div class="k">Modèle économique et conformité</div><h2>Des annonceurs qui collent au concept</h2>
<div class="cards" style="grid-template-columns:repeat(3,1fr)">
<div class="card"><b>Publicité</b><span>VTC et taxis, livraison de repas, boissons sans alcool, éthylotests. Jamais de marque d'alcool, jamais pendant une alerte.</span></div>
<div class="card"><b>Premium</b><span>Sans publicité, historique long terme complet, thèmes d'avatar.</span></div>
<div class="card"><b>À valider</b><span>Loi Évin, règles d'Apple et Google sur l'alcool, RGPD : les consommations sont des données de santé.</span></div></div>"""))

S.append(slide("""<div class="k">Annexe</div><h2>Historique des versions</h2><table><tr><th>Date</th><th>Version</th><th>Contenu</th></tr>""" + "".join(
    f"<tr><td>{d}</td><td>{v}</td><td>{t}</td></tr>" for d, v, t in HISTORIQUE) + "</table>"))

SCRIPT = """<script>const MIN=60000;const NOW=()=>1e12;</script><script src="../public/avatar.js"></script>
<script>document.querySelectorAll('.av').forEach((el,i)=>{const b=+el.dataset.b;
el.innerHTML=avatar({cap:0.8,color:['#f7941d','#5ab0ff','#5bc88a','#e879f9','#f2c94c','#ff7a6e'][i],sim:{cur:b,prev:b+(b>=0.8&&b<1.5?0.05:-0.05),peak:1.8},
drinks:b>0&&b<1.5?[{t:1e12-5*MIN,l:['Bière','Vin','Cocktail','Shot'][i%4],abv:5}]:[]},150)});</script>"""

write("presentation.html", f"<style>{CSS}</style></head><body>{''.join(S)}{SCRIPT}</body></html>", "Présentation Alamb’hic")
