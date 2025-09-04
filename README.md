# Cadmus GVE App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.5.

- [models](https://github.com/vedph/gve-core)
- [API](https://github.com/vedph/cadmus-gve-api)

## Docker

🐋 Quick Docker image build:

1. `npm run build-lib`;
2. update version in `env.js` and `ng build --configuration=production`;
3. `docker build . -t vedph2020/cadmus-gve-app:3.0.1 -t vedph2020/cadmus-gve-app:latest` (replace with the current version).

## History

### 3.0.1

- 2025-09-04:
  - added Zotero infrastructure.
  - 👉 note that when cloning this repo you should provide your own `env.local.js` under `public` where you override Zotero settings to use your library, user ID and API key. The `env.js` file is just a template for Zotero parameters. Template for this file (replace `...` with your data):
  - generated Docker image.

```js
// development overrides for env.js
// DO NOT COMMIT THIS FILE TO THE REPOSITORY

// Zotero
window.__env.zoteroApiKey = "...";
window.__env.zoteroUserId = "...";
window.__env.zoteroLibraryId = "...";
```

- 2025-09-03: added hands part.
- 2025-09-01: updated packages.
- 2025-08-31:
  - updated packages.
  - replaced remaining legacy guards with functional counterparts.
- 2025-08-30:
  - updated Angular and packages.
  - use module-less routes in PG library.
- 2025-08-02:
  - updated Angular and packages.
  - updated peer dependencies in library.
- 2025-07-12: updated Angular and packages.
- 2025-07-03:
  - updated ⚠️ Angular (v20) and packages.
  - added stats page.

### 3.0.0

- 2025-05-24: updated Angular and packages.
- 2025-03-04:
  - ⚠️ updated Cadmus to migration V2.
  - updated Angular and packages.
- 2025-01-28:
  - ⚠️ signal-based dependencies.
  - updated Angular and packages.

### 2.0.1

- 2025-01-15:
  - homepage.
  - updated packages.
- 2025-01-12:
  - updated Angular and packages.
  - homepage.
- 2025-01-07:
  - ⚠️ standalone components.
  - Angular and packages updates.
- 2024-12-24: updated to [bricks V3](https://github.com/vedph/cadmus-bricks-shell-v3).
- 2024-12-23: updated Angular.

### 2.0.0

- 2024-12-06:
  - ⚠️ upgraded core dependencies.
  - updated styles.

### 1.0.0

- 2024-11-23: ⚠️ upgraded to Angular 19.

### 0.0.2

- 2024-11-19:
  - updated Angular and packages.
  - Docker adjustments.

### 0.0.1

- 2024-10-18: updated Angular and packages.
- 2024-07-08: updated packages.
