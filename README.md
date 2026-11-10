# Alamb'hic

Jeu de soirée entre amis : chacun note ses verres, Alamb'hic estime les taux d'alcoolémie, trace les courbes de tout le groupe, fait évoluer un avatar et prévient les autres quand quelqu'un débloque un titre ou franchit un seuil. La modération rapporte des points, l'excès en fait perdre.

> Les taux sont des estimations (formule de Widmark, eau corporelle de Watson). Ce n'est jamais une autorisation de conduire.

## Contenu

| Dossier | Rôle |
| --- | --- |
| `server/index.js` | serveur Express, fichiers statiques, démarrage |
| `server/db.js` | connexion PostgreSQL et création des tables |
| `server/auth.js` | comptes e-mail + mot de passe, Google (optionnel), profil |
| `server/parties.js` | soirées par code, verres, calcul serveur des taux et titres, temps réel (WebSocket) |
| `public/engine.js` | moteur de calcul partagé navigateur / serveur |
| `public/avatar.js` | avatar qui évolue avec le taux |
| `public/app.js` | interface, mode démo avec curseur temporel |

## Déploiement Render

Blueprint `render.yaml` : un service web Node et une base PostgreSQL (offre gratuite pour les tests).

Variables :

- `DATABASE_URL` et `SESSION_SECRET` : remplies automatiquement par le Blueprint.
- `GOOGLE_CLIENT_ID` : facultatif, active le bouton « Continuer avec Google ».

## Lancer en local

```bash
npm install
DATABASE_URL=postgresql://user@localhost:5432/youdrink npm start
```

## Règles anti-triche déjà en place

- taux et titres calculés côté serveur ;
- verre antidaté de 3 h au plus, supprimable pendant 3 h seulement, et chaque suppression apparaît dans le fil de la soirée ;
- 6 verres d'alcool au plus en 10 minutes ;
- un joueur Sam ne peut noter que des boissons sans alcool.
