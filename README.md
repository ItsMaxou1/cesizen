# cesizen

A monorepo containing all cesizen applications.

## Structure

```
cesizen/
├── apps/
│   ├── api/        # Node.js + TypeScript + Express/NestJS backend
│   ├── web/        # React + TypeScript frontend
│   └── mobile/     # React Native + TypeScript mobile app
├── package.json    # Root package.json with npm workspaces
└── .gitignore
```

Each application lives in its own subdirectory under `apps/`. They are managed together as npm workspaces, allowing shared tooling and dependency management from the root.

## Getting started

Install all workspace dependencies from the root:

```bash
npm install
```

## How to import existing repos

Run the following commands to merge the existing repositories into this monorepo using `git merge --allow-unrelated-histories`:

```bash
# 1. Add remotes
git remote add api https://github.com/ItsMaxou1/cesizen-api.git
git remote add web https://github.com/ItsMaxou1/cesizen-web.git
git remote add mobile https://github.com/ItsMaxou1/cesizen-mobile.git

# 2. Fetch all remotes
git fetch api
git fetch web
git fetch mobile

# 3. Import cesizen-api into apps/api
git merge --allow-unrelated-histories api/main --no-commit
mkdir -p apps/api && git mv -k * apps/api/
git commit -m "chore: import cesizen-api into apps/api"

# 4. Import cesizen-web into apps/web
git merge --allow-unrelated-histories web/main --no-commit
mkdir -p apps/web && git mv -k * apps/web/
git commit -m "chore: import cesizen-web into apps/web"

# 5. Import cesizen-mobile into apps/mobile
git merge --allow-unrelated-histories mobile/main --no-commit
mkdir -p apps/mobile && git mv -k * apps/mobile/
git commit -m "chore: import cesizen-mobile into apps/mobile"
```
