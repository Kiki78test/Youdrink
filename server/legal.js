"use strict";
/* Pages publiques : politique de confidentialité et conditions d'utilisation.
   L'adresse de contact vient de la variable CONTACT_EMAIL (Render). */
const CONTACT = () => process.env.CONTACT_EMAIL || "";
const MAJ = "10 novembre 2026";

function page(title, body) {
  const c = CONTACT();
  const contact = c ? `<a href="mailto:${c}">${c}</a>` : "l'adresse de contact qui sera publiée ici prochainement";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title} · Alamb'hic</title><meta name="theme-color" content="#0c0a08"><link rel="icon" href="/icons/icon-192.png">
<style>
:root{--bg:#0c0a08;--surface:#18140f;--line:#2f271e;--fg:#f7f1ea;--muted:#a8998a;--accent:#f7941d;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.w{max-width:720px;margin:0 auto;padding:24px max(18px,env(safe-area-inset-left,0px)) 64px}
header{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:14px}
header img{height:34px}a{color:var(--accent)}h1{font-size:30px;line-height:1.15;margin:28px 0 6px}
h2{font-size:19px;margin:30px 0 8px}p,li{color:#e6ddd2}.m{color:var(--muted);font-size:14px}
table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0}td,th{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left;vertical-align:top}th{color:var(--muted);font-weight:600}
.tw{overflow-x:auto}
</style></head><body><div class="w"><header><a href="/"><img src="/logo.png" alt="Alamb'hic"></a><a href="/">Retour à l'appli</a></header>
<h1>${title}</h1><p class="m">Dernière mise à jour : ${MAJ}</p>${body.replace(/\{CONTACT\}/g, contact)}
<p class="m" style="margin-top:40px"><a href="/confidentialite">Confidentialité</a> · <a href="/conditions">Conditions d'utilisation</a></p></div></body></html>`;
}

const PRIVACY = `
<p>Alamb'hic est un jeu de soirée entre amis qui estime le taux d'alcoolémie de chaque joueur à partir des verres et des repas qu'il déclare. Cette page explique quelles données nous gardons, pourquoi, et comment les faire supprimer. Alamb'hic est aujourd'hui en phase de test, réservé à un cercle d'amis.</p>
<h2>Responsable du traitement</h2><p>L'éditeur de Alamb'hic, joignable à {CONTACT}.</p>
<h2>Données collectées</h2><div class="tw"><table>
<tr><th>Données</th><th>Pourquoi</th></tr>
<tr><td>E-mail, mot de passe chiffré, ou identifiant Google, e-mail et prénom si vous utilisez « Continuer avec Google »</td><td>Créer et sécuriser votre compte</td></tr>
<tr><td>Pseudo, sexe biologique, âge, taille, poids, plafond perso</td><td>Estimer votre taux (formule de Widmark). Seul le pseudo est montré aux autres joueurs.</td></tr>
<tr><td>Verres (heure, boisson, volume, degré), repas (heure, type), soirées rejointes, titres obtenus</td><td>Calculer et partager les taux, courbes, titres et alertes avec les joueurs de la même soirée ; suivi personnel sur 7 jours</td></tr>
</table></div>
<p>Les consommations d'alcool sont des <b>données de santé</b>. Nous ne les traitons qu'avec votre <b>consentement explicite</b>, donné à la création du compte, et vous pouvez le retirer à tout moment en supprimant votre compte.</p>
<h2>Qui voit quoi</h2><ul><li>Les joueurs d'une même soirée voient votre pseudo, vos verres, vos taux estimés, vos titres et les suppressions de verres.</li><li>Ils ne voient jamais votre e-mail, votre âge, votre taille, votre poids ni vos repas.</li><li>Aucune donnée n'est vendue ni utilisée pour de la publicité.</li></ul>
<h2>Sous-traitants</h2><div class="tw"><table><tr><th>Service</th><th>Rôle</th><th>Lieu</th></tr>
<tr><td>Render</td><td>Hébergement du site et de la base de données</td><td>Francfort (Union européenne)</td></tr>
<tr><td>Google</td><td>Connexion « Continuer avec Google » (si vous la choisissez) ; polices de caractères de l'interface</td><td>Union européenne et États-Unis (clauses contractuelles types)</td></tr>
<tr><td>GitHub</td><td>Code source de l'appli (aucune donnée de joueur)</td><td>—</td></tr></table></div>
<h2>Durée de conservation</h2><p>Vos données sont gardées tant que votre compte existe. La suppression du compte (Profil → « Supprimer mon compte et toutes mes données ») efface immédiatement et définitivement profil, verres, repas et titres.</p>
<h2>Cookies et stockage</h2><p>Un seul cookie, indispensable : celui qui garde votre session ouverte (60 jours). Le navigateur garde aussi quelques préférences locales (notifications déjà vues, questions « avez-vous mangé ? » écartées). Aucun cookie publicitaire ni de mesure d'audience.</p>
<h2>Vos droits</h2><p>Vous pouvez accéder à vos données, les rectifier (page Profil), les supprimer (suppression du compte), demander leur portabilité ou vous opposer à leur traitement en écrivant à {CONTACT}. Vous pouvez aussi saisir la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).</p>
<h2>Âge minimum</h2><p>Alamb'hic est réservé aux personnes de 18 ans et plus.</p>`;

const TERMS = `
<p>En créant un compte Alamb'hic, vous acceptez les conditions suivantes.</p>
<h2>Un jeu, pas une mesure</h2><p>Les taux affichés sont des <b>estimations</b> calculées à partir de vos déclarations et d'une formule générale. L'écart avec un éthylotest peut dépasser 0,2 g/L. Alamb'hic ne remplace ni un éthylotest ni un avis médical, et <b>n'est jamais une autorisation de conduire</b> : après avoir bu, on ne prend pas le volant.</p>
<h2>Réservé aux adultes</h2><p>Il faut avoir 18 ans ou plus pour utiliser Alamb'hic.</p>
<h2>Modération</h2><p>Le jeu récompense la modération et l'entraide. Les gages proposés sont toujours sans alcool. N'utilisez pas Alamb'hic pour pousser quelqu'un à boire. En cas de malaise, de perte de connaissance ou de difficulté à respirer, appelez le 15 ou le 112.</p>
<h2>Votre compte</h2><p>Vous êtes responsable de l'exactitude de ce que vous déclarez et de la confidentialité de votre mot de passe. Nous pouvons suspendre un compte utilisé pour tricher de façon répétée, harceler d'autres joueurs ou détourner le service.</p>
<h2>Service en test</h2><p>Alamb'hic est en phase de test : il peut être interrompu, modifié ou remis à zéro sans préavis. Il est fourni tel quel, sans garantie de disponibilité.</p>
<h2>Responsabilité</h2><p>Chaque joueur reste seul responsable de sa consommation et de ses décisions. L'éditeur ne peut être tenu responsable des conséquences d'une consommation d'alcool ni d'une décision prise à partir d'une estimation affichée.</p>
<h2>Données personnelles</h2><p>Voir la <a href="/confidentialite">politique de confidentialité</a>.</p>
<h2>Droit applicable</h2><p>Ces conditions relèvent du droit français. Contact : {CONTACT}.</p>`;

function routes(app) {
  app.get("/confidentialite", (req, res) => res.type("html").send(page("Politique de confidentialité", PRIVACY)));
  app.get("/conditions", (req, res) => res.type("html").send(page("Conditions d'utilisation", TERMS)));
}
module.exports = { routes };
