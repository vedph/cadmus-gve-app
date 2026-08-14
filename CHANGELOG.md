# History

## 7.1.10

- 2026-08-13: updated packages.

## 7.1.9

- 2026-08-02: fixed branding color.

## 7.1.8

- 2026-07-29: 🆕 updated packages for search box in feature picker.
- 2026-07-28: 🆕 reactive menu.

## 7.1.6

- 2026-07-10:
  - updated packages.
  - removed `@cisstech/nge` (no longer used).

## 7.1.5

- 2026-07-03: updated packages.

## 7.1.4

- 2026-07-02: updated packages.

## 7.1.3

- 2026-06-26: updated packages.

## 7.1.2

- 2026-06-25: updated Angular and fixed Docker images.

## 7.1.1

- 2026-03-13:
  - ⚠️ migrated to new [Monaco wrapper](https://vedph.github.io/cadmus-doc/history/20260613-monaco.html).
  - fixed missing counts part type definition.

## 7.1.0

- 2026-06-05: ⚠️ upgraded to Angular 22.

## 7.0.13

- 2026-06-05: updated packages.

## 7.0.12

- 2026-05-29:
  - added `color` to preset variables of hints designer for hints like `filled-box`.
  - 🆕 added consumer logic for new setting `gveFeatureProperties` which can be used to preset properties for each selected feature. For instance, you might have settings like these in backend profile `settings` object:

```json
"gveFeatureProperties": {
  "log": {
    "setPolicy": "single",
    "isGlobal": true
  },
  "version": {
    "setPolicy": "single",
    "isGlobal": true,
    "isShortLived": true
  }
}
```

## 7.0.11

- 2026-05-28: added hints editor to admin menu.

## 7.0.9

- 2026-05-28: updated packages (added value prefix to feature editor).

## 7.0.8

- 2026-05-26: updated packages.

## 7.0.7

- 2026-05-21: updated Angular and packages.

## 7.0.5

- 2026-05-14: updated Angular and packages.

## 7.0.4

- 2026-05-07: updated packages (fix to snapshot editor add operation).

## 7.0.3

- 2026-05-07: updated packages (added batch source editor for operations).

## 7.0.2

- 2026-05-07: updated Angular and packages (with shell fixes for features batch editing).

## 7.0.1

- 2026-05-06: updated Angular and packages (GVE shell improvements).

## 7.0.0

- 2026-04-26: added NDP text passages part for carrier's titles, mottos, etc.
- 2026-04-25:
  - ⚠️ updated packages (after refactoring API models and renderer).
  - updated Angular.

## 6.1.7

- 2026-04-16:
  - added thesauri `snapshot-source-ids` and `snapshot-source-types` to snapshot part.
  - updated Angular and packages.

## 6.1.6

- 2026-04-02:
  - ⚠️ gone zoneless.
  - updated Angular and packages (with fixes and improvements in renderer and GVE libraries).
- 2026-03-30: updated Angular and packages.
- 2026-03-27: added branding.

## 6.1.5

- 2026-03-26: updated Angular and packages.

## 6.1.4

- 2026-03-25:
  - 🆕 updated packages and added facets editor.
  - updated admin menu and routes.

## 6.1.3

- 2026-03-18:
  - 🆕 migrated shell app to M3 themes and added dark theme support to components.
  - removed `cadmus-ui-pg`.

## 6.1.2

- 2026-03-12: updated Angular and packages.

## 6.1.1

- 2026-03-04: updated packages.

## 6.1.0

- 2026-03-03:
  - updated Angular and packages.
  - ⚠️ migrated to `OnPush`.

## 6.0.3

- 2026-02-25: updated Angular and packages (with minor improvements for login).

## 6.0.2

- 2026-02-19: updated Angular and packages.
- 2026-02-19: updated Angular and packages.
- 2026-02-16: updated packages.

## 6.0.1

- 2026-02-16:
  - updated Angular and packages.
  - 🆕 added import functions for facets and settings.
- 2026-02-05:
  - updated Angular and packages.
  - added `lookupProviderOptions` wherever lookup components are used, getting data from settings and changing the corresponding part thesauri to be role-dependent.

## 6.0.0

- 2026-01-29: updated Angular and packages.
- 2026-01-27: fix to hint editor page serialization.
- 2026-01-23:
  - ⚠️ refactored after models refactoring.
  - updated Angular and packages.
  - adjusted **settings** as follows:
    - backend settings:
      - `gveRenditionSettings`: writable settings for GVE rendition component.
      - `gveHintDesignerVariables`: an initial list of variable values for the hint designer.
    - frontend settings:
      - environment: `multiValuedFeatureIds` contains the list of feature IDs which have multiple values from a closed list. Usually the only such feature is `r_hints` and this is the default value. Additionally, Zotero account should be overridden here when hosting the app.

## 5.0.3

- 2026-01-19:
  - updated Angular and packages.
  - added `asserted-id-features` thesaurus to GVE hands part.

## 5.0.2

- 2026-01-08: updated Angular and packages.
- 2026-01-01: updated packages.
- 2025-12-29: updated packages.
- 2025-12-24:
  - updated Angular.
  - adding hints editor.
- 2025-12-14: updated Angular.

## 5.0.1

- 2025-12-10: updated Angular and packages.

## 5.0.0

- 2025-11-26: updated Angular and packages.
- 2025-11-24:
  - ⚠️ upgraded to Angular 21.
  - migrated to `pnpm`.
- 2025-11-06: updated Angular and packages.

## 4.0.2

- 2025-10-31:
  - updated packages.
  - Docker image.
- 2025-10-30: updated Angular and packages.

## 4.0.1

- 2025-10-24:
  - updated Angular and packages.
  - Docker image.
- 2025-10-15:
  - updated packages.
  - updated homepage.
- 2025-10-13: updated packages.
- 2025-10-08:
  - updated Angular and packages.
  - added `gve-hand-eids` thesaurus to GVE hands.
- 2025-10-02: added thesauri for features in snapshot part editor:
  - 📚 `snapshot-feat-names`: feature names (e.g. id=clr, value=color)
  - 📚 `snapshot-feat-values`: feature values (e.g. id=clr:r, value=red)
  - 📚 `snapshot-efeat-names`: element feature names (as above)
  - 📚 `snapshot-efeat-values`: element feature values (as above)
  - 📚 `snapshot-dfeat-names`: diplomatic feature names (as above)
  - 📚 `snapshot-dfeat-values`: diplomatic feature values (as above)
- 2025-10-01: updated Angular and packages.

## 4.0.0

- 2025-09-18:
  - updated packages.
  - adjusted routes for updated packages.
  - Docker image.
- 2025-09-17: ⚠️ refactored for full reactivity.

## 3.0.1

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

## 3.0.0

- 2025-05-24: updated Angular and packages.
- 2025-03-04:
  - ⚠️ updated Cadmus to migration V2.
  - updated Angular and packages.
- 2025-01-28:
  - ⚠️ signal-based dependencies.
  - updated Angular and packages.

## 2.0.1

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

## 2.0.0

- 2024-12-06:
  - ⚠️ upgraded core dependencies.
  - updated styles.

## 1.0.0

- 2024-11-23: ⚠️ upgraded to Angular 19.

## 0.0.2

- 2024-11-19:
  - updated Angular and packages.
  - Docker adjustments.

## 0.0.1

- 2024-10-18: updated Angular and packages.
- 2024-07-08: updated packages.
