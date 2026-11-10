# Services externes Youdrink — source de docs/01-pilotage/services-externes.pdf (à tenir à jour à chaque changement de service)
from common import A4, D, band, write

ACTIFS = [
    ("GitHub", "Dépôt privé <code>Kiki78test/Youdrink</code> : code source et documentation.", "Gratuit", "Code uniquement", "Accès de l'appli Claude autorisé sur le dépôt."),
    ("Render — service web", "Héberge le serveur Node (site, API, temps réel, pages légales). Redéploie à chaque envoi sur <code>main</code>.", "Gratuit (s'endort après 15 min sans visite)", "Transit des données des joueurs", "Région Francfort. Blueprint <code>render.yaml</code>. Variables : <code>SESSION_SECRET</code> (générée), <code>DATABASE_URL</code> (reliée), <code>GOOGLE_CLIENT_ID</code>, <code>ADMIN_EMAILS</code>, <code>CONTACT_EMAIL</code>."),
    ("Render — PostgreSQL", "Base de données : comptes, profils, soirées, verres, titres.", "Gratuit, expire au bout de 30 jours", "Toutes les données des joueurs, dont les consommations (données sensibles)", "Région Francfort, même région que le service (obligatoire pour la connexion interne)."),
    ("Google Identity", "Bouton « Continuer avec Google ».", "Gratuit", "E-mail, prénom, identifiant Google", "Projet Google Cloud « YouDrink », client OAuth « Application Web », origine autorisée <code>https://youdrink.onrender.com</code> (ajouter le futur domaine). Variable <code>GOOGLE_CLIENT_ID</code>."),
    ("Google Fonts", "Polices Bricolage Grotesque et Inter de l'interface.", "Gratuit", "Adresse IP du visiteur (chargement des polices)", "À héberger nous-mêmes avant l'ouverture publique pour ne plus rien envoyer à Google."),
]
PREVUS = [
    ("Cloudflare", "Nom de domaine, DNS, protection.", "Domaine ~10 à 15 €/an", "Trafic du site (proxy)", "Comme airmonylive.com."),
    ("Resend", "E-mails (mot de passe oublié, confirmation).", "Gratuit jusqu'à 3 000 e-mails/mois", "Adresse e-mail", "Comme Airmony."),
    ("Firebase Cloud Messaging", "Notifications push sur Android, appli fermée.", "Gratuit", "Jeton de l'appareil, texte des notifications", "Étape 2 (APK)."),
    ("Google Play Console", "Publication de l'APK.", "25 $ une fois", "Fiche de l'appli", "Compte déjà utilisé pour vos autres applis."),
    ("Render payant", "Service toujours éveillé et base durable.", "~7 $ + 6 $ par mois", "—", "Avant d'ouvrir au-delà du cercle d'amis."),
]

def table(rows):
    return "<table><tr><th>Service</th><th>Rôle</th><th>Coût</th><th>Données confiées</th><th>Réglages</th></tr>" + "".join(
        f"<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>" for a, b, c, d, e in rows) + "</table>"

body = f"""<div class="page">{band("Services externes", "Pilotage du projet")}
<p class="lead">Youdrink tourne aujourd'hui sur des services gratuits : GitHub, le service web et la base Render, et la connexion Google. Coût actuel : 0 €.</p>
<h2>En service</h2>{table(ACTIFS)}
<h2>Prévus</h2>{table(PREVUS)}
<div class="note warn"><b>Données sensibles.</b> Les consommations d'alcool sont des données de santé au sens du RGPD. Tous les sous-traitants qui les reçoivent devront être listés dans la politique de confidentialité avant l'ouverture publique.</div>
<div class="foot"><span>Youdrink · Services externes</span><span>{D}</span></div></div>"""

write("services.html", f"<style>{A4}</style></head><body>{body}</body></html>", "Services externes Youdrink")
