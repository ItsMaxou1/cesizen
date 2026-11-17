# Journal des versions

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnage [SemVer](https://semver.org/lang/fr/).

## [Non publié]
### Ajouté
- Monorepo (API, back-office web, mobile) avec historique conservé.
- Deux pipelines CI/CD GitHub Actions : **Pipeline API** (gitleaks, audit, tests unitaires Jest, build, image GHCR, Trivy, déploiement) et **Pipeline Back Office** (audit, lint, build, tests end-to-end Selenium, image, déploiement) ; pipeline Mobile ; rollback, sauvegarde quotidienne, CodeQL, Dependabot.
- Tests end-to-end Selenium du back-office (6 scénarios) et script de seed du compte administrateur.
- Règles GitHub (rulesets) : push direct interdit sur main et develop, PR et CI obligatoires.
- Modèles de tickets (anomalie, évolution, sécurité) et de Pull Request.
- Sécurité API : Helmet, limitation de débit, CORS configurable, `/api/health`, gestion d'erreurs centralisée.
- Images Docker non-root avec healthchecks ; Nginx avec en-têtes de sécurité et proxy `/api`.
### Corrigé
- Migration manquante pour la colonne `type` des exercices : sur une base neuve, tout le module Exercices renvoyait une erreur 500.
- Suppression d'un utilisateur impossible s'il avait des commentaires, likes, favoris ou historique (suppression en cascade, droit à l'effacement RGPD) ; idem pour un exercice en favori ou dans un historique.
- Les erreurs serveur n'étaient pas journalisées.
- Le build de l'API incluait les tests et ne copiait pas le client Prisma (`npm start` échouait).
- URLs de l'API codées en dur dans le web et le mobile.

## [1.0.0] - 2026-04-04
- Version livrée au Bloc 2 (API, back-office, application mobile).
