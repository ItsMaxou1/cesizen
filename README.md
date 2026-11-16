# CESIZen : l'application de votre santé mentale

Monorepo du projet CESIZen (Bloc 3 CDA, Maxime Gervilla).

| Dossier | Contenu |
|---|---|
| `apps/api` | API REST Node.js / Express / TypeScript / Prisma / MySQL |
| `apps/web` | Back-office d'administration React / Vite |
| `apps/mobile` | Application mobile Expo / React Native |
| `infra` | Docker Compose de déploiement (recette, production) |
| `.github` | Pipelines GitHub Actions (API, Back Office, Mobile), rulesets, modèles de tickets, Dependabot |

```mermaid
flowchart LR
  dev[Développeur] -- "push / PR" --> gh[GitHub]
  gh -- "Pipeline API" --> ut[Tests unitaires Jest]
  gh -- "Pipeline Back Office" --> e2e[Tests E2E Selenium]
  ut & e2e -- develop --> rec[Recette]
  ut & e2e -- "tag vX.Y.Z + validation" --> prod[Production]
```

Voir `CONTRIBUTING.md` (règles), `SECURITY.md` (sécurité) et `CHANGELOG.md` (versions).
