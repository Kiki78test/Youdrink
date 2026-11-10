# Sources de la documentation (bouton « Docs » → docs/*.pdf, réservé aux admins)

| PDF | Source | Contenu |
|---|---|---|
| 01-pilotage/check-list.pdf | checklist.py | fait, à tester, à faire (à régénérer à chaque mise à jour importante) |
| 01-pilotage/services-externes.pdf | services.py | services utilisés et prévus, coûts, données confiées (à tenir à jour à chaque changement de service) |
| 02-presentation/presentation-complete.pdf | presentation.py (+ img/, ../public/avatar.js) | présentation 16:9 par sujet, annexe historique des versions |
| 02-presentation/guide-complet.pdf | guide.py (+ img/, ../public/avatar.js) | mode d'emploi par sujet, annexe historique des versions |

- `common.py` : styles, date du jour (heure de Paris) et **historique des versions** (une ligne par lot important).
- `build.sh` : régénère les quatre PDF puis met à jour leur date dans `docs/index.json` (`stamp.py`).
- `shots.js` : captures d'écran de l'appli dans `img/` (`node shots.js http://localhost:3000 email motdepasse`, avec un serveur local et un compte admin).
- `topdf.js` : conversion HTML → PDF (Playwright), pied de page daté et numéroté pour les A4.
- Chaque nouveau PDF est ajouté à `docs/` et déclaré dans `docs/index.json` (fichier, titre, description, date, catégorie).
