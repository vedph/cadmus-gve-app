# Signal forms migration log

Migration of the libraries under `projects/myrmidon` from reactive to signal forms, after updating `@myrmidon/cadmus-*` to 20 and `@myrmidon/gve-core` to 8. Only measured facts are recorded as such; anything else is marked _believed_, with how to check it.

## Scope

Found by searching the library sources for `FormBuilder`, `FormControl`, `FormGroup`, `ReactiveFormsModule`, `FormsModule`, `NgxToolsValidators`: the only reactive forms code is `GveSnapshotPartComponent` (`cadmus-part-gve-snapshot`). `cadmus-part-gve-pg` has no forms; it only wraps that editor and depends on it.

Build order (from `scripts/build-libs.mjs`): `cadmus-part-gve-snapshot` → `cadmus-part-gve-pg`.

## cadmus-part-gve-snapshot

### Changes

- Draft and form as in "Migrating a part editor" (`cadmus-shell-v3/CHANGELOG.md`): `_draft` is a `linkedSignal` over the bound part, `form = this.createForm(_draft, required(snapshot))`; `buildForm`, `updateForm`, `updateThesauri` and constructor parameters removed; thesaurus entries are `computed()` over `data`.
- The template has no `<form>` and binds `[snapshot]="form.snapshot().value() ?? undefined"`.
- The snapshot is copied (`copyFormValue`) into the draft and out of it (`getValue`). The draft keeps the snapshot editor's own emitted object; on the echo of a save, the `linkedSignal` keeps its previous value when the incoming snapshot equals the draft's (`sameFormValue`).
- Rendition settings and feature properties loading were left as they were: they are not form code, and have their own role precedence logic (covered by specs), which `initSettings` would not reproduce.

### Verified

- **The form tags the snapshot's array items.** Measured with a throwaway spec: creating the form, reading state, `value.set`, `markAsDirty`, `invalid()` and `reset()` add no Symbol; `markAsTouched()` does. In the component, operations got tagged with no `markAsTouched` call: the cause is `FormFieldManager.createFieldManagementEffect` (`@angular/forms` 22.2.0, `_validation_errors-chunk.mjs`), whose effect walks `structure.children()` over the whole tree and so materializes (and tags) every array item once effects flush. Hence the copies in and out.
- **gve-core 8 `SnapshotEditorComponent`** has `snapshot` as a `model()`; on save it sets it to a fresh `structuredClone`, and an effect on `snapshot()` resets its form and calls `runToLast()` (read in `fesm2022/myrmidon-gve-core.mjs`). So handing it back a different object after its save would re-run the snapshot.
- **The new specs fail without each safeguard** (each reverted in turn, then restored):
  - no echo check → "should give the snapshot editor back the snapshot it saved" fails;
  - no copy in `getValue` → "should save a snapshot carrying no form tags" and "should emit the saved part…" fail;
  - no copy in `toDraft` → "should not tag the input part" fails.
- **`dirtyChange(true)` is no longer emitted before an immediate save** (the former spec expecting it failed). The v20 base emits `dirtyChange` from an effect, and `save()` resets the form synchronously, so the effect sees only the final clean state. The pg wrapper only forwards it to `onDirtyChange`, whose final value (false) is unchanged.
- `ng test`: 81/81 passed. `ng build` clean, and `cadmus-part-gve-pg` rebuilt after it (`node scripts/build-libs.mjs`).

### Browser check (headless Chrome over CDP, `ng serve` on 4200 after deleting `.angular/cache`)

Item `9cc31a9e-…` (Item #00001), snapshot part `c2cbfc02-…`, with real data containing `null`s:

- the served chunk contains the new code (`previous.value.snapshot` found in `chunk-WQAI752U.js`);
- 0 `<form>` elements in the editor and in the page;
- nested-widget flow: duplicating an operation inside the snapshot editor, then saving from it, issued exactly one `POST /api/parts` and one `POST /api/text/operations/run`; closing then navigated back to the item with no pending changes prompt; reopening showed the saved operation. The data was then restored (operation deleted and saved);
- opening the part and closing it without changes: no prompt;
- no console errors.

## cadmus-part-gve-pg

- No source changes. `ng test`: 19/19 passed; `ng build` clean.

## Reported, not fixed (outside the migration)

- `pnpm run …` fails with `ERR_PNPM_VERIFY_DEPS_BEFORE_RUN`: pnpm 12 no longer reads the `pnpm.overrides` field of `package.json` (`rollup` → `@rollup/wasm-node`); it must move to `pnpm-workspace.yaml`. Scripts were run with `node scripts/build-libs.mjs` and `npx ng …` instead.
- `GveSnapshotPartComponent` leaves debug `console.log` calls in library code (`Loading rendition settings for key`, `Loaded rendition settings for key`), and gve-core 8's `SnapshotEditorComponent` logs `multiValuedFeatureIds` on every change.
- _Believed_: `[noSave]="userLevel < 2 || …"` reads `userLevel`, a plain field of the base class updated from `currentUser$`; under `OnPush`/zoneless a later user change would not re-render. It is set in `ngOnInit` before the first render, so it works for the normal flow. Check: log in as a visitor, open the editor, log in as an editor in another tab, and see whether saving gets enabled.
