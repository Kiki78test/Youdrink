# Check-list Youdrink — source de docs/01-pilotage/check-list.pdf (à régénérer à chaque mise à jour importante)
from common import A4, D, band, write

ICON = {"ok": "✔", "test": "◷", "todo": "○"}

def sec(title, items):
    return f"<h2>{title}</h2><ul class='cl'>" + "".join(
        f"<li><span class='b {c}'>{ICON[c]}</span><span>{x}</span></li>" for c, x in items) + "</ul>"

FAIT = [
    ("ok", "<b>Prototype</b> (09/11) : calcul du taux, titres et gages, courbes communes, notifications, avatar évolutif, mode démo avec curseur temporel."),
    ("ok", "<b>Cahier des charges</b> (09/11) : concept, calcul, trophées, alertes, fiabilité et anti-triche, localisation, suivi long terme, supports, monétisation, juridique, architecture, feuille de route."),
    ("ok", "<b>Dépôt GitHub</b> <code>Kiki78test/Youdrink</code> (10/11), accès de Claude autorisé."),
    ("ok", "<b>Render</b> (10/11) : Blueprint « youdrink », service web gratuit et base PostgreSQL gratuite, tous deux à Francfort. Adresse : <code>youdrink.onrender.com</code>."),
    ("ok", "<b>Comptes</b> : e-mail + mot de passe (8 caractères minimum, mots de passe chiffrés), connexion gardée 60 jours, limitation des essais de connexion."),
    ("ok", "<b>Profil</b> : pseudo, sexe, âge (18 ans minimum), taille, poids, plafond perso. Les mesures ne sont jamais montrées aux autres joueurs."),
    ("ok", "<b>Soirées par code</b> de 4 lettres : créer, rejoindre, partager l'invitation, quitter. Une seule soirée active à la fois."),
    ("ok", "<b>Calcul serveur</b> des taux, titres et points, diffusé en temps réel à tous les joueurs (WebSocket, rafraîchi chaque minute)."),
    ("ok", "<b>Avatar détaillé</b> qui évolue avec le taux, avec le verre en main pendant 25 min après chaque verre."),
    ("ok", "<b>Mode démo</b> accessible à tous (bouton « Démo » en haut) : soirée fictive de 19 h à 6 h, curseur et lecture accélérée."),
    ("ok", "<b>Suivi des 7 derniers jours</b> sur la page Profil, comparé aux repères de Santé publique France."),
    ("ok", "<b>Anti-triche, première série</b> : verre antidaté de 3 h au plus, suppression possible pendant 3 h et visible dans le fil, 6 verres d'alcool au plus en 10 min, Sam limité aux boissons sans alcool."),
    ("ok", "<b>Suppression du compte</b> avec effacement de toutes les données (RGPD)."),
    ("ok", "<b>Appli installable</b> sur le téléphone (icône, plein écran, fonctionne hors ligne pour l'interface)."),
    ("ok", "<b>Onglet Documentation</b> (10/11) réservé aux admins : présentation complète, guide complet, check-list, services externes."),
]
A_TESTER = [
    ("test", "<b>Variable Render <code>ADMIN_EMAILS</code></b> : y mettre votre adresse e-mail pour voir le bouton « Docs »."),
    ("test", "<b>Création de compte et profil</b> sur youdrink.onrender.com, depuis le téléphone puis l'ordinateur."),
    ("test", "<b>Soirée à deux téléphones</b> : créer une soirée, la rejoindre avec le code, noter des verres des deux côtés et vérifier que courbes, classement et notifications arrivent chez l'autre."),
    ("test", "<b>Installation</b> : menu du navigateur → « Ajouter à l'écran d'accueil »."),
    ("test", "<b>Mode démo</b> : curseur et lecture, déblocage des titres, évolution des avatars."),
    ("test", "<b>Réveil du serveur gratuit</b> : après 15 min sans visite, la première ouverture prend environ 30 à 50 s."),
    ("test", "<b>Vraie soirée entre amis</b> : validation de l'étape 1 avant de passer à l'APK."),
]
A_FAIRE = [
    ("todo", "<b>Nom de domaine</b> (youdrink.fr ou .app) sur Cloudflare, puis branchement sur Render."),
    ("todo", "<b>Connexion Google</b> : créer l'identifiant OAuth dans Google Cloud et le mettre dans <code>GOOGLE_CLIENT_ID</code>."),
    ("todo", "<b>Mot de passe oublié</b> par e-mail (Resend, comme Airmony)."),
    ("todo", "<b>Étape 2 — APK Android</b> : notifications push Firebase appli fermée, widget écran d'accueil."),
    ("todo", "<b>Étape 3 — Fiabilité</b> : saisie d'un éthylotest et recalibrage personnel, éthylotest Bluetooth, validation des verres par les amis, indice de fiabilité."),
    ("todo", "<b>Étape 4 — Montre et long terme</b> : Wear OS (ajout d'un verre, vibration aux seuils, gorgées détectées par l'inclinaison), tableau de bord mensuel, objectifs, trophées long terme."),
    ("todo", "<b>Étape 5 — Ouverture publique</b> : localisation approximative et défis entre soirées, publicités cohérentes (VTC, repas, sans alcool), version premium."),
    ("todo", "<b>Juridique</b> avant toute ouverture publique : loi Évin, règles des stores, RGPD (analyse d'impact, politique de confidentialité, mentions légales)."),
    ("todo", "<b>Passage aux offres payantes Render</b> (environ 7 $ + 6 $ par mois) avant d'ouvrir au-delà du cercle d'amis : la base gratuite expire au bout de 30 jours."),
]

CSS = A4 + """
.cl{list-style:none;padding:0}
.cl li{display:grid;grid-template-columns:7mm 1fr;gap:2mm;padding:1.8mm 0;border-bottom:1px solid var(--rule);break-inside:avoid}
.b{width:5mm;height:5mm;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:700;margin-top:.4mm}
.b.ok{background:var(--ok);color:#06210f}.b.test{background:var(--warn);color:#2a2000}.b.todo{background:transparent;border:1.4px solid var(--soft);color:var(--soft)}
.legend{display:flex;gap:6mm;font-size:9pt;color:var(--soft);margin-bottom:4mm}
.legend span{display:inline-flex;gap:2mm;align-items:center}
.count{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:0 0 6mm}
.count div{background:var(--paper2);border-radius:3mm;padding:3mm 4mm}
.count b{font-family:'Bricolage',sans-serif;font-size:20pt;display:block;line-height:1.1}
"""

body = f"""<div class="page">{band("Check-list", "Pilotage du projet")}
<p class="lead">Étape 1 de la feuille de route : le socle web est en ligne. Il reste à le tester en vraie soirée avant de passer à l'APK Android.</p>
<div class="count"><div><b>{len(FAIT)}</b>fait</div><div><b>{len(A_TESTER)}</b>à tester par vous</div><div><b>{len(A_FAIRE)}</b>à faire</div></div>
<div class="legend"><span><span class="b ok">✔</span>fait</span><span><span class="b test">◷</span>à tester</span><span><span class="b todo">○</span>à faire</span></div>
{sec("À tester par vous", A_TESTER)}
{sec("À faire", A_FAIRE)}
{sec("Fait", FAIT)}
<div class="foot"><span>Youdrink · Check-list</span><span>{D}</span></div></div>"""

write("checklist.html", f"<style>{CSS}</style></head><body>{body}</body></html>", "Check-list Youdrink")
