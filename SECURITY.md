# Politique de sécurité CESIZen

## Signaler une vulnérabilité
Ne créez **jamais** de ticket public pour une faille exploitable.
Utilisez le signalement privé GitHub : onglet **Security → Report a vulnerability**.

Engagements de réponse :

| Étape | Délai |
|---|---|
| Accusé de réception | 48 h |
| Qualification (criticité CVSS) | 3 jours ouvrés |
| Correctif d'une faille critique | 7 jours |
| Correctif d'une faille élevée | 30 jours |

## Versions maintenues
Seule la dernière version mineure publiée (tag `vX.Y.Z`) reçoit des correctifs de sécurité.

## Mesures en place
- Analyse automatique à chaque push : gitleaks (secrets), `npm audit`, CodeQL (SAST), Trivy (images Docker), Dependabot.
- API : mots de passe hachés (bcrypt), JWT signé, en-têtes Helmet, limitation de débit, CORS restreint, erreurs sans détails internes.
- Infrastructure : conteneurs non-root, base de données sur un réseau Docker interne, secrets uniquement dans les environnements GitHub.

La procédure complète (gestion de crise, notification CNIL sous 72 h) est décrite dans le dossier du Bloc 3.
