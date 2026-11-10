# Guide complet Alamb’hic — source de docs/02-presentation/guide-complet.pdf
# Organisé par sujet : chaque nouveauté est intégrée à son chapitre, les passages dépassés sont corrigés ; annexe « Historique des versions ».
from common import A4, D, band, hist_table, write

CH = []
def ch(title, body): CH.append((title, body))
def shot(n, cap=""): return f'<figure><img src="img/{n}.png"><figcaption>{cap}</figcaption></figure>'

ch("Démarrer", f"""<div class="split"><div>
<h3>Créer un compte</h3><p>Ouvrez <b>alambhic.onrender.com</b>, choisissez « Créer un compte », saisissez votre e-mail et un mot de passe d'au moins 8 caractères. La connexion reste active 60 jours sur l'appareil. La connexion Google arrivera quand l'identifiant sera configuré.</p>
<h3>Compléter son profil</h3><p>Pseudo, sexe biologique, âge, taille et poids : ces mesures servent uniquement à estimer votre taux. Les autres joueurs voient votre pseudo, vos verres et vos taux, jamais vos mesures.</p>
<p>Alamb’hic est <b>réservé aux 18 ans et plus</b> : un âge inférieur est refusé.</p>
<h3>Choisir son plafond</h3><p>0,5 ; 0,6 ; 0,8 (conseillé) ou 1,0 g/L. Au-delà, les titres positifs s'arrêtent et chaque excès devient un titre de honte avec gage.</p>
<h3>Installer l'appli</h3><p>Dans le navigateur du téléphone : menu → « Ajouter à l'écran d'accueil ». Alamb’hic s'ouvre alors en plein écran avec son icône.</p>
<div class="note">Sur l'offre gratuite de Render, le serveur s'endort après 15 minutes sans visite : la première ouverture prend alors 30 à 50 secondes.</div>
</div>{shot("auth", "Écran d'accueil")}</div>""")

ch("Les soirées", """<h3>Créer une soirée</h3><p>Sur l'écran d'accueil, « Créer une soirée » génère un code de 4 lettres (sans I, L ni O pour éviter les confusions). Il s'affiche en haut de l'écran et dans la carte « Code de la soirée ».</p>
<h3>Inviter</h3><p>« Copier l'invitation » ouvre le partage du téléphone, ou copie le message « Rejoins ma soirée Alamb’hic avec le code … » à coller dans le groupe.</p>
<h3>Rejoindre</h3><p>Saisissez le code dans « Rejoindre avec un code ». Rejoindre une soirée vous fait quitter automatiquement la précédente : on ne joue qu'à une soirée à la fois.</p>
<h3>Quitter</h3><p>Profil → « Quitter la soirée ». Vos verres restent comptés dans votre suivi personnel.</p>
<h3>Temps réel</h3><p>Chaque verre ajouté, chaque titre et chaque seuil est diffusé immédiatement à tous les joueurs. Le serveur renvoie aussi l'état de la soirée chaque minute, pour que les taux et les titres de redescente avancent même quand personne ne boit.</p>""")

ch("Noter ses verres", f"""<div class="split"><div>
<table><tr><th>Boisson</th><th>Volume</th><th>Degré</th></tr>
<tr><td>Bière</td><td>25 cl</td><td>5 %</td></tr><tr><td>Pinte</td><td>50 cl</td><td>5 %</td></tr>
<tr><td>Vin</td><td>12 cl</td><td>12 %</td></tr><tr><td>Champagne</td><td>12 cl</td><td>12 %</td></tr>
<tr><td>Shot</td><td>4 cl</td><td>40 %</td></tr><tr><td>Cocktail</td><td>20 cl</td><td>10 %</td></tr>
<tr><td>Cidre</td><td>25 cl</td><td>5 %</td></tr><tr><td>Eau</td><td>25 cl</td><td>0 %</td></tr></table>
<p><b>Verre perso</b> : indiquez le volume en cl et le degré, puis « Ajouter ». Un degré de 0 compte comme une boisson sans alcool.</p>
<p><b>Bu plus tôt</b> : « il y a 15 min », « 30 min » ou « 1 h » avant de toucher la boisson. Un verre peut être noté jusqu'à 3 h après coup.</p>
<p><b>Sam</b> : « Je suis Sam ce soir » limite vos boissons à l'eau et aux boissons sans alcool, et vous donne le titre « Sam de la soirée ». Impossible si vous avez déjà bu de l'alcool dans la soirée.</p>
<p><b>Confirmation</b> : le bouton touché affiche un indicateur d'envoi, puis passe au vert avec une coche ; un bandeau « Verre enregistré » rappelle la boisson et l'heure. « Annuler », dans les 6 secondes, retire le verre sans laisser de trace. Un second appui pendant l'envoi est ignoré : plus de verre compté deux fois.</p>
<p><b>Supprimer un verre</b> : la croix à droite, pendant 3 h. Chaque suppression apparaît dans le fil de la soirée.</p>
</div>{shot("soiree-moi", "Écran Moi")}</div>""")

ch("Les repas", f"""<div class="shots">{shot("repas-avant", "Avant le premier verre")}{shot("repas-liste", "Mes repas en cours de soirée")}<figure></figure></div><p>Un repas ralentit le passage de l'alcool dans le sang et baisse le pic : Alamb’hic tient compte de vos repas pour chaque verre bu de 30 minutes avant le repas jusqu'à la fin de son effet.</p>
<table><tr><th>Type de repas</th><th>Exemples</th><th>Absorption</th><th>Effet pendant</th><th>Alcool qui passe</th></tr>
<tr><td>À jeun</td><td>—</td><td>30 min</td><td>—</td><td>100 %</td></tr>
<tr><td>Grignotage</td><td>apéritif, encas</td><td>45 min</td><td>1 h 30</td><td>95 %</td></tr>
<tr><td>Repas léger</td><td>salade, sandwich</td><td>60 min</td><td>2 h 30</td><td>90 %</td></tr>
<tr><td>Repas complet</td><td>plat, féculents</td><td>75 min</td><td>4 h</td><td>85 %</td></tr>
<tr><td>Repas copieux</td><td>repas de fête</td><td>90 min</td><td>5 h</td><td>80 %</td></tr></table>
<h3>Avant le premier verre</h3><p>En entrant dans une soirée, une carte « Qu'avez-vous mangé aujourd'hui ? » propose les repas déjà passés de la journée (petit-déjeuner 8 h, déjeuner 12 h 30, goûter 16 h 30, dîner 20 h) : corrigez l'heure et le type, ou choisissez « Rien ». « Valider mes repas » ou « Rien mangé » débloque les boissons alcoolisées ; l'eau reste toujours disponible.</p>
<h3>Ajouter un repas en cours de soirée</h3><p>Section « Mes repas » de l'écran Moi : heure, type, « Ajouter un repas ». La croix supprime un repas noté par erreur. Les repas des dernières 24 h sont pris en compte, dans toutes vos soirées.</p>
<h3>La question à l'heure des repas</h3><p>Entre 12 h et 15 h, 16 h et 18 h, puis 19 h et 22 h 30, si aucun repas n'est noté, Alamb’hic demande « Avez-vous déjeuné ? », « Avez-vous mangé quelque chose ? » ou « Avez-vous dîné ? ». Un bouton par type de repas l'enregistre à l'heure actuelle ; « Pas encore » repose la question 45 minutes plus tard, « Je ne mangerai pas » la fait taire jusqu'au repas suivant.</p>""")

ch("Le taux estimé", """<p>Alamb’hic estime votre taux minute par minute avec la <b>formule de Widmark</b> et l'<b>eau corporelle de Watson</b> :</p>
<ul><li><b>Alcool d'un verre</b> : volume × degré × 0,789 g/ml (10 g = un verre standard).</li>
<li><b>Eau corporelle</b> : selon le sexe, l'âge, la taille et le poids.</li>
<li><b>Absorption</b> progressive sur 30 min à jeun, jusqu'à 90 min après un repas copieux, avec une part d'alcool réduite (voir « Les repas »).</li>
<li><b>Élimination</b> : 0,15 g/L par heure.</li></ul>
<table><tr><th>État affiché</th><th>Taux estimé</th></tr>
<tr><td>Sobre</td><td>moins de 0,2 g/L</td></tr><tr><td>Pompette</td><td>0,2 à 0,5 g/L</td></tr>
<tr><td>Interdit de conduire</td><td>à partir de 0,5 g/L</td></tr><tr><td>Au-dessus du plafond</td><td>à partir de votre plafond</td></tr>
<tr><td>Alerte</td><td>à partir de 1,5 g/L</td></tr></table>
<p>L'écran Moi montre aussi le pic de la soirée, le nombre de verres standard et l'heure estimée du retour à 0.</p>
<p><b>La jauge en alambic</b> : le taux s'affiche dans un tuyau en serpentin qui se remplit de potion, avec les repères 0,5, plafond et 1,2 g/L. La potion avance doucement à chaque changement et prend la couleur de l'état ; des bulles remontent quand le taux monte et redescendent quand il baisse. À chaque verre d'alcool, une goutte vole du bouton touché jusqu'à l'entrée du tuyau.</p>
<div class="note warn"><b>Une estimation, jamais une autorisation de conduire.</b> L'écart avec un éthylotest peut dépasser 0,2 g/L. Après avoir bu, on ne prend pas le volant.</div>""")

ch("Courbes, potes et fil", f"""<div class="shots">{shot("demo-courbes", "Courbes de la soirée")}{shot("demo-classement", "Classement")}{shot("demo-fil", "Fil de la soirée")}</div>
<p><b>Courbes</b> : une couleur par joueur, seuils 0,5 / 0,8 / 1,2 en pointillés, trait plein jusqu'à maintenant et pointillés pour la redescente prévue.</p>
<p><b>Potes (en direct)</b> : une carte par joueur avec son avatar, son taux, sa <b>tendance façon bourse</b> sur les 15 dernières minutes (▲ ça monte, ▼ ça redescend, en g/L par heure), une mini-courbe des 2 dernières heures avec la redescente prévue, et son dernier titre. Le bouton « Points » affiche le classement des titres : trié par points, avec le pic et les titres de chacun.</p>
<p><b>Fil</b> : tous les titres, alertes et suppressions de verres, du plus récent au plus ancien. La pastille rouge sur l'onglet compte les nouveautés non lues.</p>""")

ch("Titres, points et gages", """<table><tr><th>Titre</th><th>Condition</th><th>Points</th></tr>
<tr><td>Premières bulles</td><td>0,2 g/L</td><td>+10</td></tr>
<tr><td>Joues roses</td><td>0,4 g/L</td><td>+10</td></tr>
<tr><td>Clés confisquées</td><td>0,5 g/L (information)</td><td>0</td></tr>
<tr><td>Philosophe de comptoir</td><td>0,8 g/L, dernier titre à gagner en montant</td><td>+10</td></tr>
<tr><td>Hors plafond</td><td>dépasser son plafond perso (s'il est sous 1,2)</td><td>−15 + gage</td></tr>
<tr><td>Le Naufragé</td><td>1,2 g/L</td><td>−15 + gage</td></tr>
<tr><td>La Fusée</td><td>+0,5 g/L en une heure</td><td>−15 + gage</td></tr>
<tr><td>Alerte copains</td><td>1,5 g/L : les amis sont appelés à aider</td><td>0</td></tr>
<tr><td>Alerte rouge</td><td>2 g/L : rester avec la personne, 15 en cas de signes graves</td><td>0</td></tr>
<tr><td>Atterrissage en douceur</td><td>redescendre sous 0,2 après avoir dépassé 0,4</td><td>+10</td></tr>
<tr><td>Retour sur Terre</td><td>revenir à 0 après avoir dépassé 0,2</td><td>+10</td></tr>
<tr><td>Le Chameau / L'Oasis</td><td>3 / 6 verres d'eau</td><td>+10 chacun</td></tr>
<tr><td>Sam de la soirée</td><td>jouer Sam</td><td>+10</td></tr></table>
<p><b>Gages</b> : tirés parmi huit, toujours sans alcool (deux grands verres d'eau, un compliment à chaque joueur, imiter un animal, parler avec un accent, servir de l'eau à la tablée, raconter sa pire honte, chanter un refrain, mimer un film).</p>""")

ch("Notifications", f"""<div class="split"><div>
<p>Chaque titre et chaque seuil apparaît en haut de l'écran sur tous les téléphones de la soirée, <b>une notification à la fois</b> : les suivantes attendent leur tour (le compteur « +2 » l'indique). Chaque notification a une icône et une couleur par type (doré pour un titre, rouge pour une honte, orange pour une alerte), et une barre qui montre le temps restant ; un toucher la ferme. Les alertes vibrent deux fois et restent 12 secondes.</p>
<p>Quand un titre est débloqué, l'icône de la notification fait « hic ! » avec quelques étincelles dorées. Sur l'écran Potes, la flèche de tendance clignote quand elle change de sens. Les animations sont coupées si « réduire les animations » est activé sur le téléphone.</p>
<p>Les confirmations de vos propres actions (verre, repas, invitation copiée, erreur) s'affichent à part, dans un bandeau en bas de l'écran, pour ne jamais se mélanger aux notifications des amis.</p>
<ul><li><b>Titres</b> : message moqueur.</li><li><b>Honte</b> : gage et passage à l'eau.</li>
<li><b>1,5 g/L</b> : « apportez-lui de l'eau et gardez un œil sur lui ».</li><li><b>2 g/L</b> : rester avec la personne ; si elle vomit, ne répond plus ou respire mal, appeler le 15.</li></ul>
<p>Aujourd'hui, les notifications arrivent quand l'appli est ouverte. Les notifications appli fermée viendront avec l'APK (étape 2).</p>
</div>{shot("demo-notifs", "Notifications pendant la démo")}</div>""")

AVS = '<div class="avs">' + "".join(f'<div><div class="av" data-b="{b}"></div><span>{t}</span></div>' for b, t in
       [(0, "0 g/L"), (0.3, "0,3"), (0.6, "0,6"), (0.9, "0,9"), (1.2, "1,2"), (1.7, "1,7")]) + '</div>'
ch("L'avatar", AVS + """<p>Chaque joueur a un avatar à sa couleur, sur l'écran Moi et dans le classement. Il évolue en continu :</p>
<ul><li>rougeurs et nez rouge qui augmentent, paupières qui tombent, blanc des yeux qui rougit, tête qui penche ;</li>
<li>sourire qui s'élargit jusqu'au plafond, puis grimace ;</li>
<li>0,5 g/L : col ouvert et clés de voiture barrées ; 0,6 g/L : bulles de hoquet ; 0,8 g/L : lunettes de travers ;</li>
<li>au-dessus du plafond : teint verdâtre, yeux qui louchent, cheveux en bataille, chemise froissée ; 1 g/L : goutte de sueur ;</li>
<li>1,5 g/L : allongé sur un oreiller avec un verre d'eau.</li></ul>
<p><b>Avatar vivant</b> : il respire doucement quand on est sobre, puis se balance de plus en plus à mesure que le taux monte. À chaque changement d'état (sobre, pompette, interdit de conduire, au-dessus du plafond, alerte), il sursaute et une bulle annonce son nouvel état, sur l'écran Moi, l'écran Potes et la liste d'amis.</p>
<p>Pendant 25 minutes après chaque verre, l'avatar tient le bon modèle (bière avec mousse, vin rouge, flûte, shot, cocktail ou eau). Quand le taux redescend, il tient un verre d'eau.</p>""")

ch("Le mode démo", """<p>Le bouton « Démo » en haut de l'écran lance une soirée fictive, même sans compte : Léa (raisonnable, c'est vous), Max (qui dérape), Tom (modéré) et Inès (Sam).</p>
<ul><li><b>Curseur</b> : avancez ou reculez de 19 h à 6 h ; les titres déjà passés ne sont pas renotifiés.</li>
<li><b>Lecture</b> : la soirée défile en accéléré, 5 minutes toutes les demi-secondes.</li>
<li>On peut ajouter ou supprimer des verres pour Léa : rien n'est enregistré.</li>
<li><b>Quitter</b> revient à votre vraie soirée.</li></ul>""")

ch("Suivi des 7 derniers jours", f"""<div class="split"><div>
<p>La page Profil compte vos verres standard des 7 derniers jours, toutes soirées confondues, et les compare aux repères de Santé publique France : 10 verres par semaine au plus, 2 par jour, et des jours sans alcool.</p>
<p>Les barres passent en rouge au-delà de 2 verres standard dans la journée ; le nombre de jours sans alcool est indiqué.</p>
<p>À venir (étape 4) : bilan mensuel, objectifs perso, trophées long terme, défis entre amis.</p>
</div>{shot("profil", "Profil et suivi")}</div>""")

ch("Fiabilité et anti-triche", """<p>Le classement récompense la modération : la triche consisterait surtout à sous-déclarer. Règles en place :</p>
<ul><li>taux, titres et points calculés par le serveur, identiques pour tous ;</li>
<li>un verre ne peut pas être antidaté de plus de 3 h ;</li>
<li>un verre ne peut être supprimé que pendant 3 h, et la suppression apparaît dans le fil ;</li>
<li>6 verres d'alcool au plus en 10 minutes ;</li>
<li>Sam ne peut noter que des boissons sans alcool, et ne peut pas devenir Sam après avoir bu.</li></ul>
<p>À venir (étape 3) : éthylotest Bluetooth et recalibrage personnel, validation des verres par les amis, photo du verre, indice de fiabilité ; puis gorgées détectées par la montre (étape 4).</p>""")

ch("Les amis", f"""<div class="split"><div>
<p>Le bouton <b>Amis</b>, en haut de l'écran, ouvre la liste de vos amis, en soirée ou non.</p>
<h3>Ajouter un ami</h3><p>Chaque joueur a un <b>code ami</b> de 6 caractères. « Partager mon lien » envoie un lien d'invitation : la personne qui l'ouvre se connecte, son écran Amis s'ouvre avec votre code déjà saisi, et il lui suffit de toucher « Ajouter ». On peut aussi taper le code à la main. L'autre doit accepter la demande (« Demandes reçues ») ; si les deux s'ajoutent, l'amitié est immédiate.</p>
<h3>Vos amis en direct</h3><p>Pour chaque ami en soirée : son avatar, son taux, sa tendance façon bourse, une mini-courbe des 2 dernières heures et son dernier titre. Les autres apparaissent dans « Les autres ». La liste se met à jour toutes les 30 secondes. La soirée de vos amis (son code, les autres joueurs) n'est jamais montrée.</p>
<h3>Confidentialité</h3><p>« Mes amis voient mon taux en direct pendant mes soirées » est activé par défaut et se coupe d'un geste ; seuls les amis acceptés en profitent. « Retirer » (deux touches pour confirmer) supprime un ami.</p>
</div>{shot("amis", "Mes amis")}</div>""")

ch("Compte et données", """<ul><li><b>Se déconnecter</b> : Profil → « Me déconnecter ».</li>
<li><b>Supprimer son compte</b> : Profil → « Supprimer mon compte et toutes mes données », puis confirmer. Profil, verres et titres sont effacés définitivement.</li>
<li><b>Données gardées</b> : e-mail, mot de passe chiffré, profil, verres, repas, titres. Hébergement Render à Francfort (Union européenne).</li>
<li><b>Consentement</b> : à la création du compte, une case à cocher confirme l'âge (18 ans et plus) et l'accord pour le traitement des consommations, qui sont des données de santé. Avec Google, la même mention s'affiche sous le bouton.</li>
<li><b>Pages publiques</b> : <code>/confidentialite</code> (données, sous-traitants, durée, droits, CNIL) et <code>/conditions</code> (un jeu et pas une mesure, 18 ans, modération, responsabilité), liées depuis l'écran de connexion. L'adresse de contact vient de la variable Render <code>CONTACT_EMAIL</code>.</li></ul>""")

ch("Administration", """<ul><li><b>Comptes admin</b> : variable Render <code>ADMIN_EMAILS</code> (adresses séparées par des virgules). Un admin voit le bouton « Documentation » dans sa page Profil.</li>
<li><b>Documentation</b> : PDF du dossier <code>docs/</code> listés dans <code>docs/index.json</code> (titre, description, date, catégorie), accessibles aux seuls admins. Sources dans <code>docs-src/</code>, régénérées par <code>docs-src/build.sh</code>.</li>
<li><b>Déploiement</b> : chaque envoi sur la branche <code>main</code> de <code>Kiki78test/Youdrink</code> redéploie le service Render.</li>
<li><b>Variables</b> : <code>DATABASE_URL</code> et <code>SESSION_SECRET</code> (automatiques), <code>GOOGLE_CLIENT_ID</code> (facultatif), <code>ADMIN_EMAILS</code>.</li></ul>""")

toc = "<ol class='toc'>" + "".join(f"<li><span class='n'>{i+1}</span>{t}</li>" for i, (t, _) in enumerate(CH)) + "<li><span class='n'>A</span>Historique des versions</li></ol>"
body = f"""<div>{band("Guide complet", "Présentation et guides")}
<p class="lead">Mode d'emploi de toutes les fonctions de Alamb’hic, rangé par sujet.</p>{toc}</div>""" + "".join(
    f'<div style="{"page-break-before:always" if i == 0 else "margin-top:9mm"}"><h2><span class="n">{i+1}</span>{t}</h2>{b}</div>' for i, (t, b) in enumerate(CH)) + \
    f'<div style="page-break-before:always"><h2><span class="n">A</span>Historique des versions</h2>{hist_table()}</div>'

CSS = A4 + """.avs{display:grid;grid-template-columns:repeat(6,1fr);gap:2.5mm;margin:2mm 0 4mm;text-align:center}
.avs>div{background:var(--bg);border-radius:3mm;padding:2mm 1mm}.avs span{color:var(--muted);font-size:8.4pt}.av svg{width:100%;height:auto}"""
SCRIPT = """<script>const MIN=60000;const NOW=()=>1e12;</script><script src="../public/avatar.js"></script>
<script>document.querySelectorAll('.av').forEach((el,i)=>{const b=+el.dataset.b;
el.innerHTML=avatar({cap:0.8,color:['#f7941d','#5ab0ff','#5bc88a','#e879f9','#f2c94c','#ff7a6e'][i],sim:{cur:b,prev:b+(b>=0.8&&b<1.5?0.05:-0.05),peak:1.8},
drinks:b>0&&b<1.5?[{t:1e12-5*MIN,l:['Bière','Vin','Cocktail','Shot'][i%4],abv:5}]:[]},120)});</script>"""
write("guide.html", f"<style>{CSS}</style></head><body>{body}{SCRIPT}</body></html>", "Guide complet Alamb’hic")
