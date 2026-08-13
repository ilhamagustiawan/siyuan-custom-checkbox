# Alternate Checkbox Plugin

## Foundation

* [x] Scaffold plugin.
* [x] Define typed marker registry.
* [x] Implement marker API wrapper.
* [x] Add parser/registry tests.

Phase 1 foundation is implemented and verified with Vitest. Full-project typecheck remains deferred with the sample `src/index.ts` replacement planned for Phase 2.

## Rendering

### Task 5 — Detect and project native task items

* [ ] Add centralized selectors for `.protyle-wysiwyg` task list items and both task-action DOM shapes.
* [ ] Read `data-task` and classify it with `parseTaskMarker`/`MARKER_REGISTRY`; do not maintain a second marker list.
* [ ] Keep ``, `x`, `X`, unknown, malformed, missing-action, and non-task nodes as native/no-op cases.
* [ ] Add fixtures for every marker and both direct-child/paragraph-wrapped task actions.

### Task 6 — Render Minimal-style icons and colors

* [x] Use `icon.md` plus `src/index.scss` as the canonical mapping; do not add another icon library.
* [x] Preserve native SiYuan SVGs for ``, `x`, and `X`.
* [x] Verify `/`, `-`, `>`, `<`, `?`, `!`, `*`, `"`/`“`, `l`, `b`, `i`, `S`, `I`, `p`, `c`, `f`, `k`, `w`, `u`, and `d` use the documented icon geometry and theme token.
* [x] Keep the 18px pseudo-element, `currentColor`, background/mask declarations, direct + paragraph-wrapped selectors, and light/dark fallbacks.
* [x] Compile through `src/index.scss`; do not hand-edit generated `index.css`.
* [x] Preserve the Minimal MIT license header and attribution.

### Task 7 — Attach Protyle lifecycle and scoped observer

* [ ] Replace sample lifecycle wiring with handlers for `loaded-protyle-static`, `loaded-protyle-dynamic`, `switch-protyle`, and `destroy-protyle`.
* [ ] Process existing `.protyle-wysiwyg` roots during startup/layout ready.
* [ ] Use one `MutationObserver` per root with `childList`/`subtree`, `data-task`, and `data-subtype` filtering; avoid document-wide polling.
* [ ] Batch affected task items with a `Set` and `requestAnimationFrame`.
* [ ] Cover editor open, edit, paste, and dynamic insertion in tests/manual verification.

### Task 8 — Make rendering idempotent and unload-safe

* [ ] Remove sample tabs, docks, dialogs, commands, and demo listeners from `src/index.ts`.
* [ ] Make `start`/`attach`/`detach`/`stop` ownership explicit and safe when called repeatedly.
* [ ] Disconnect observers, cancel RAF, clear queues, and unregister every event handler on unload.
* [ ] Keep rendering declarative; never inject duplicate checkbox elements or rewrite block markup.
* [ ] Keep Phase 3 interaction/persistence out of this phase.

## Phase 2 checkpoint

* [ ] `pnpm test` passes with renderer/observer tests.
* [ ] `pnpm exec tsc --noEmit` passes.
* [ ] `pnpm format:check` passes.
* [x] `pnpm exec sass --no-source-map src/index.scss /tmp/siyuan-custom-checkbox-phase2.css` passes.
* [ ] Production build/package succeeds.
* [ ] All custom markers match the documented icon/color mapping.
* [ ] Native todo/completed and unknown markers remain unchanged.
* [ ] Disable/unload restores native presentation and leaves no console errors.

## Interaction

* [ ] Add click cycle.
* [ ] Add status picker.
* [ ] Add optimistic persistence and rollback.
* [ ] Add keyboard behavior.

## Configuration

* [ ] Add settings.
* [ ] Add localization/accessibility.
* [ ] Add batch updates.

## Validation

* [ ] Desktop smoke test.
* [ ] Mobile smoke test.
* [ ] Reload/sync/export/import tests.
* [ ] Disable/uninstall test.
* [ ] Package install test.
