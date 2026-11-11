# Fonctions d'Airmony transposables à Alamb'hic — source de docs/01-pilotage/idees-airmony.pdf
# Document de décision : la colonne « Décision » se remplit quand on statue.
from common import A4, D, band, write

F = [
 # (n°, titre, ce qu'Airmony fait, ce que ça donnerait ici, effort, priorité proposée)
 ("Rapide", [
  (1, "Badges à paliers bronze, argent, or", "28 badges à paliers calculés à partir de compteurs (<code>lib/badges.js</code>).",
   "Trophées sur la durée en plus des titres de soirée : Chameau d'or (50 verres d'eau), Sam fidèle (5 soirées en Sam), soirées sans honte d'affilée, Habitué. Sert le suivi long terme pour réduire sa consommation.", "1 à 2 jours", "Haute"),
  (2, "Notifications push du navigateur", "Web Push, e-mail et cloche, avec catégories réglables par l'utilisateur (<code>lib/notify.js</code>).",
   "Alertes copains, titres des amis et rappels « avez-vous mangé ? » reçus appli fermée, sans attendre l'APK.", "1 jour", "Haute"),
  (3, "Garde-fou sur les messages", "Détection des insultes et coordonnées, même déguisées (<code>lib/guard.js</code>).",
   "Filtre pour un futur tchat ou des commentaires dans le fil de soirée.", "½ jour", "Plus tard (avec le tchat)"),
  (4, "Sécurité automatique", "Contrôle des dépendances chaque lundi sur GitHub, alerte UptimeRobot si le site tombe.",
   "Copie presque à l'identique : fichier GitHub Actions et sonde sur <code>/healthz</code>.", "1 heure", "Haute"),
  (5, "Mot de passe oublié par e-mail", "Envoi d'e-mails par Resend (<code>lib/mail.js</code>).",
   "Lien de réinitialisation par e-mail ; déjà prévu dans la check-list.", "½ jour", "Haute"),
 ]),
 ("Moyen", [
  (6, "Assistant d'aide", "Base de questions et réponses, enrichie par l'IA si une clé est configurée (<code>lib/helpkb.js</code>).",
   "« Comment est calculé mon taux ? », « Pourquoi mon pic baisse après un repas ? », « Que veut dire tel titre ? ».", "1 à 2 jours", "Moyenne"),
  (7, "Visite guidée", "Visite guidée et découverte sans compte.",
   "4 ou 5 bulles d'explication par-dessus le mode démo existant.", "½ jour", "Moyenne"),
  (8, "Appli Android (APK)", "Enveloppe Capacitor et fabrication automatique de l'APK sur GitHub Actions.",
   "Voie la plus courte pour l'étape 2 : APK, widget « mes potes », notifications natives.", "2 à 3 jours", "Moyenne (étape 2)"),
  (9, "Plusieurs langues", "FR, EN, ES, PT avec détection de la langue du navigateur.",
   "Utile avant l'ouverture publique, surtout pour les soirées internationales.", "2 à 3 jours", "Basse"),
 ]),
 ("Phase business", [
  (10, "Paiements Stripe", "Paiement par carte, empreinte bancaire, versements (<code>lib/pay.js</code>, <code>lib/stripe.js</code>).",
   "Abonnement Premium et Pass soirée du business plan.", "2 jours", "Avec le Premium"),
  (11, "Mode écran TV et télécommande", "Le téléphone pilote, la TV diffuse.",
   "« Soirée du bar » sur grand écran : courbes en direct, avatars, classement de la salle.", "2 à 3 jours", "Avec les bars"),
  (12, "Page publique partageable", "Page publique d'artiste et widget à intégrer.",
   "Récapitulatif de soirée à partager (courbes, titres, avatars), moteur du bouche-à-oreille.", "1 à 2 jours", "Moyenne"),
 ]),
]

CSS = A4 + """
table.f{width:100%;border-collapse:collapse;font-size:8.6pt;margin-bottom:5mm}
table.f th{background:var(--paper2);text-align:left;padding:2mm;font-weight:600}
table.f td{padding:2mm;border-bottom:1px solid var(--rule);vertical-align:top}
table.f td.n{font-family:'Bricolage',sans-serif;font-weight:800;font-size:12pt;width:7mm}
table.f td.dec{width:22mm;border-left:1px dashed var(--rule)}
table.f tr{break-inside:avoid}
.prio{font-weight:600}
"""

rows = ""
for grp, items in F:
    rows += f"<h2>{grp}</h2><table class='f'><tr><th></th><th style='width:34mm'>Fonction</th><th>Dans Airmony</th><th>Pour Alamb’hic</th><th style='width:17mm'>Effort</th><th style='width:20mm'>Priorité proposée</th><th>Décision</th></tr>"
    for n, t, a, y, e, p in items:
        rows += f"<tr><td class='n'>{n}</td><td><b>{t}</b></td><td>{a}</td><td>{y}</td><td>{e}</td><td class='prio'>{p}</td><td class='dec'></td></tr>"
    rows += "</table>"

body = f"""<div class="page">{band("Idées venues d'Airmony", "Pilotage du projet")}
<p class="lead">Douze fonctions déjà construites dans Airmony qu'on peut reprendre dans Alamb’hic. À trancher plus tard : la colonne « Décision » est laissée vide.</p>
<div class="note"><b>Recommandation</b> : commencer par 1 (badges long terme) et 2 (notifications push), qui apportent le plus au jeu, puis 5 (mot de passe oublié) et 4 (sécurité), presque gratuits. Les efforts sont des estimations, code d'Airmony réutilisé.</div>
{rows}
<div class="foot"><span>Alamb’hic · Idées venues d'Airmony</span><span>{D}</span></div></div>"""

write("airmony_idees.html", f"<style>{CSS}</style></head><body>{body}</body></html>", "Idées venues d'Airmony")
