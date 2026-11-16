# Journal des versions

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnage [SemVer](https://semver.org/lang/fr/).

## [Non publié]
### Ajouté
- Monorepo (API, back-office web, mobile) avec historique conservé.
- CI/CD GitHub Actions : gitleaks, npm audit, tests, lint, build, images GHCR, scan Trivy, déploiement recette/production par runner auto-hébergé, rollback, sauvegarde quotidienne, CodeQL, Dependabot.
- Modèles de tickets (anomalie, évolution, sécurité) et de Pull Request.
- Sécurité API : Helmet, limitation de débit, CORS configurable, `/api/health`, gestion d'erreurs centralisée.
- Images Docker non-root avec healthchecks ; Nginx avec en-têtes de sécurité et proxy `/api`.
### Corrigé
- Le build de l'API incluait les tests et ne copiait pas le client Prisma (`npm start` échouait).
- URLs de l'API codées en dur dans le web et le mobile.

## [1.0.0] - 2026-04-04
- Version livrée au Bloc 2 (API, back-office, application mobile).
