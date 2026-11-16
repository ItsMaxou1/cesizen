# Règles de développement CESIZen

## Branches (GitFlow simplifié)
| Branche | Rôle | Déploiement |
|---|---|---|
| `main` | Code en production, uniquement via PR depuis `develop` ou `hotfix/*` | Tag `vX.Y.Z` → PRODUCTION |
| `develop` | Intégration | RECETTE automatique |
| `feature/<ticket>-<nom>` | Une évolution | CI seulement |
| `fix/<ticket>-<nom>` | Une correction | CI seulement |
| `hotfix/<nom>` | Correction urgente depuis `main` | CI, puis tag de patch |

`main` et `develop` sont protégées : PR obligatoire, CI verte, relecture.

## Messages de commit (Conventional Commits)
`type(portée): description` avec `type` parmi `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `security`.
Exemple : `fix(api): refuser un mot de passe vide à l'inscription (#42)`.

## Versionnage (SemVer)
`MAJEUR.MINEUR.CORRECTIF` : `v1.2.3`. Correctif = 3e chiffre, évolution compatible = 2e, rupture = 1er.
Chaque version est décrite dans `CHANGELOG.md`.

## Bonnes pratiques obligatoires
- Aucun secret dans le code : variables d'environnement (`.env` jamais commité, `.env.example` à jour).
- Toute route qui modifie des données exige l'authentification ; les routes d'administration exigent le rôle `ADMIN`.
- Valider et typer les entrées côté API ; requêtes via Prisma uniquement (pas de SQL concaténé).
- Une PR = un ticket, avec tests ; la CI doit être verte avant fusion.
- Pas de données personnelles dans les logs.

## Lancer le projet en local
```bash
cd apps/api && cp .env.example .env && npm ci && npx prisma migrate dev && npm run dev
cd apps/web && npm ci && npm run dev
cd apps/mobile && npm ci && npx expo start
```
Ou toute la stack avec Docker : `docker compose --env-file infra/local.env -f infra/docker-compose.yml up -d`.
