# Business plan Alamb'hic — source de docs/03-business/business-plan.pdf
# Document vivant : les nouvelles idées business s'ajoutent dans la section concernée et dans « Idées à creuser ».
from common import A4, D, band, write

S = []
def sec(title, body): S.append((title, body))

sec("En une phrase", """<p><b>Alamb'hic</b> est le jeu de soirée entre amis qui rend la modération drôle : chacun note ses verres, l'appli estime les taux, et le groupe se chambre tout en veillant les uns sur les autres. Le positionnement « on s'amuse, mais on se surveille » est notre avantage : il rend l'appli acceptable pour les stores, les partenaires et les parents des joueurs.</p>
<div class="note">Tous les chiffres de ce document sont des <b>hypothèses de travail</b> à valider par les tests, pas des prévisions.</div>""")

sec("Cibles", """<table><tr><th>Segment</th><th>Ce qu'ils cherchent</th><th>Ce qu'on leur apporte</th></tr>
<tr><td><b>Groupes d'amis 20-35 ans</b></td><td>S'amuser, se chambrer, rentrer sans problème</td><td>Le jeu, l'avatar, les titres, les alertes entre amis</td></tr>
<tr><td><b>Étudiants et BDE</b></td><td>Soirées animées, image responsable auprès des écoles</td><td>Mode soirée de groupe, défis, prévention intégrée</td></tr>
<tr><td><b>Bars et lieux festifs</b></td><td>Animation, fidélisation, image de lieu responsable</td><td>Mode « soirée du bar » avec QR code et classement de salle</td></tr>
<tr><td><b>Organisateurs d'événements</b></td><td>Festivals, mariages, EVJF/EVG, séminaires</td><td>Soirée sur mesure, prévention, retour en sécurité</td></tr>
<tr><td><b>Prévention et assureurs</b></td><td>Toucher les jeunes sans moraliser</td><td>Un canal ludique, des statistiques anonymes</td></tr></table>""")

sec("Sources de revenus", """<h3>1. Version Premium (abonnement)</h3>
<ul><li>Prix à tester : 2,99 €/mois ou 19,99 €/an.</li>
<li>Contenu : bilans mensuels et historique complet, objectifs et trophées long terme, avatars, accessoires et thèmes, défis entre amis, sans publicité.</li>
<li>La version gratuite reste complète pour jouer en soirée : le Premium vend le confort et la personnalisation, jamais la sécurité (les alertes restent gratuites).</li></ul>
<h3>2. Achats ponctuels</h3>
<ul><li>Packs d'avatars et d'accessoires, titres secrets.</li>
<li><b>Pass soirée</b> (anniversaire, EVJF, mariage) : thème de la soirée, titres personnalisés, récapitulatif souvenir à partager. Prix à tester : 4,99 € la soirée.</li></ul>
<h3>3. Publicité cohérente avec le concept</h3>
<ul><li>Annonceurs : VTC et taxis (« rentrer sans conduire »), livraison de repas (lien direct avec la question « avez-vous mangé ? »), boissons sans alcool, éthylotests.</li>
<li>Formats : trophée sponsorisé (« Retour en VTC »), offre au moment du retour à la maison, bannière discrète.</li>
<li>Jamais de marque d'alcool, jamais de publicité pendant une alerte.</li></ul>
<h3>4. Partenariats bars</h3>
<ul><li><b>Mode « soirée du bar »</b> : QR code sur les tables, classement de la salle, défis entre tables, écran géant avec les courbes.</li>
<li>Le bar offre un verre d'eau, un soft ou un en-cas aux titres de modération (Chameau, Atterrissage en douceur), jamais d'alcool.</li>
<li>Abonnement bar à tester : 29 à 49 €/mois, ou commission sur des offres sans alcool.</li></ul>
<h3>5. Événements</h3>
<ul><li>Festivals, soirées étudiantes, séminaires et afterworks d'entreprise : soirée sur mesure, tableau de bord de l'organisateur, alertes de prévention.</li>
<li>Vente à l'événement (forfait) ou en marque blanche.</li></ul>
<h3>6. Sponsors et prévention</h3>
<ul><li>Associations de prévention, mutuelles étudiantes, assureurs, sécurité routière : sponsoring de défis (« Mois sec en équipe »), de trophées ou de la version étudiante.</li>
<li>Statistiques agrégées et anonymes uniquement (jamais de données individuelles).</li></ul>
<h3>7. Matériel</h3>
<ul><li>Éthylotests Bluetooth compatibles (étape 3) : affiliation, puis éventuellement un modèle en marque blanche.</li></ul>""")

sec("Hypothèses de chiffre d'affaires", """<p>Scénarios annuels pour situer les ordres de grandeur ; ils servent à décider quoi tester d'abord.</p>
<table><tr><th>Hypothèse</th><th>Démarrage</th><th>Croissance</th><th>Ambition</th></tr>
<tr><td>Joueurs actifs par mois</td><td>1 000</td><td>10 000</td><td>50 000</td></tr>
<tr><td>Premium (3 % à ~24 €/an)</td><td>720 €</td><td>7 200 €</td><td>36 000 €</td></tr>
<tr><td>Achats ponctuels (2 % × 5 €, 2 fois/an)</td><td>200 €</td><td>2 000 €</td><td>10 000 €</td></tr>
<tr><td>Publicité (~0,50 € par joueur actif et par an)</td><td>500 €</td><td>5 000 €</td><td>25 000 €</td></tr>
<tr><td>Bars partenaires (~40 €/mois)</td><td>5 bars : 2 400 €</td><td>30 bars : 14 400 €</td><td>150 bars : 72 000 €</td></tr>
<tr><td><b>Total indicatif</b></td><td><b>≈ 3 800 €</b></td><td><b>≈ 28 600 €</b></td><td><b>≈ 143 000 €</b></td></tr></table>
<p><b>Coûts à prévoir</b> : hébergement Render payant (~13 $/mois au départ, davantage avec la croissance), domaine, comptes développeur (Google 25 $ une fois, Apple 99 $/an), dépôt de marque INPI (~190 € pour une classe, ~40 € par classe en plus), conseil juridique avant l'ouverture publique, création de la société.</p>""")

sec("Mise sur le marché", """<ol><li><b>Cercle d'amis</b> : tests en vraies soirées, corrections, premiers retours.</li>
<li><b>Lancement local</b> : 2 ou 3 bars pilotes près de chez vous et un BDE ; on mesure l'usage réel.</li>
<li><b>Bouche-à-oreille</b> : liens d'invitation, récapitulatif de soirée à partager, défis entre groupes d'amis.</li>
<li><b>Réseaux sociaux</b> : TikTok et Instagram avec les avatars, les titres et les courbes de soirée (contenu drôle, jamais d'incitation à boire).</li>
<li><b>Stores</b> : APK puis Play Store, App Store ensuite, avec une fiche centrée sur la modération et le jeu.</li></ol>""")

sec("Contraintes et risques", """<table><tr><th>Sujet</th><th>Risque</th><th>Réponse</th></tr>
<tr><td>Loi Évin</td><td>Publicité pour l'alcool très encadrée</td><td>Pas d'annonceur alcool ; les bars communiquent sur l'ambiance et la modération</td></tr>
<tr><td>Stores Apple et Google</td><td>Refus des applis qui encouragent à boire</td><td>Positionnement modération, 18 ans et plus, alertes, aucune récompense de l'excès</td></tr>
<tr><td>RGPD</td><td>Consommations = données de santé</td><td>Consentement explicite, aucune revente, statistiques anonymes seulement, analyse d'impact</td></tr>
<tr><td>Responsabilité</td><td>Taux estimé pris pour une mesure</td><td>Avertissements permanents, conditions d'utilisation, éthylotest pour confirmer</td></tr>
<tr><td>Marque</td><td>Nom contesté</td><td>Vérifier et déposer Alamb'hic (classes 9, 41, 42)</td></tr>
<tr><td>Concurrence</td><td>Applis de jeux d'alcool et de suivi de consommation</td><td>La combinaison jeu + modération + amis en direct est notre différence</td></tr></table>""")

sec("Indicateurs à suivre", """<ul><li>Soirées créées par semaine et joueurs par soirée.</li>
<li>Rétention : part des joueurs qui reviennent pour une deuxième soirée.</li>
<li>Invitations envoyées et acceptées (amis, liens).</li>
<li>Taux de conversion Premium et revenu par joueur actif.</li>
<li>Indicateurs de modération : part des soirées sans titre de honte, verres d'eau notés, utilisation du rôle de Sam.</li></ul>""")

sec("Idées à creuser", """<ul>
<li>Récapitulatif de soirée en image (courbes, titres, avatars) à partager sur les réseaux.</li>
<li>Saisons et défis thématiques (Dry January, mois sec en équipe) sponsorisés par la prévention.</li>
<li>Mode « soirée du bar » sur écran géant, avec classement des tables.</li>
<li>Version entreprise pour les afterworks et les séminaires.</li>
<li>Boutique d'avatars : tenues, accessoires, thèmes saisonniers.</li>
<li>Partenariat VTC : course réduite proposée automatiquement au-delà de 0,5 g/L.</li>
<li>Widget « mes potes » et montre connectée comme arguments du Premium.</li>
</ul>""")

toc = "<ol class='toc'>" + "".join(f"<li><span class='n'>{i+1}</span>{t}</li>" for i, (t, _) in enumerate(S)) + "</ol>"
body = f"""<div>{band("Business plan", "Business")}
<p class="lead">Comment Alamb'hic peut gagner de l'argent sans trahir son esprit : s'amuser, mais se surveiller.</p>{toc}</div>""" + "".join(
    f'<div style="margin-top:8mm"><h2><span class="n">{i+1}</span>{t}</h2>{b}</div>' for i, (t, b) in enumerate(S))
write("business.html", f"<style>{A4}</style></head><body>{body}</body></html>", "Business plan Alamb'hic")
