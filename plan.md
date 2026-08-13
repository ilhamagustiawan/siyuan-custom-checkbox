# Implementation Plan: Alternate Checkboxes for SiYuan

## Overview

Build a SiYuan plugin that adds configurable checkbox statuses and icons while preserving native task-list blocks. Persist status as native one-character task markers through SiYuan's block API. Borrow custom-callout's native-DOM enhancement, CSS theme, lifecycle, and observer patterns.

## Goals

* Support the requested markers: ``, `/`, `x`, `-`, `>`, `<`, `?`, `!`, `*`, `\"`, `l`, `b`, `i`, `S`, `I`, `p`, `c`, `f`, `k`, `w`, `u`, `d`.
* Render distinct icons/colors for every supported marker.
* Change status by click, keyboard, and status menu.
* Preserve normal SiYuan behavior when plugin disabled or marker unknown.
* Avoid direct `.sy` file writes and custom block formats.

## Architecture Decisions

1. **Native task blocks remain source of truth.** Read `data-task` from native `NodeListItem` elements. Persist with `/api/block/updateTaskListItemMarker` and batch endpoint.
2. **DOM enhancement, not block replacement.** Style `.protyle-action--task`; do not replace list items or rewrite document HTML.
3. **Explicit marker registry.** Each status defines marker, label, icon, color, next status, and optional accessibility text. Unknown markers fall back to native UI.
4. **Scoped lifecycle.** Observe Protyle editors and relevant attributes only. Disconnect observers and remove listeners/styles on unload.
5. **Theme variables.** Generate CSS using SiYuan theme variables plus configurable status colors. Keep contrast and dark-mode support.
6. **Separate visual and persistence layers.** CSS/DOM updates are immediate; API writes are authoritative and failures restore the previous state.

## Task List

### Phase 1: Foundation and compatibility

* [x] Task 1: Create plugin scaffold and manifest (metadata adapted; sample lifecycle remains until Phase 2 replacement).
* [x] Task 2: Define typed marker registry and status-cycle rules.
* [x] Task 3: Add API wrapper for single and batch marker updates.
* [x] Task 4: Build fixture-based parser tests for supported, native, and unknown markers.

### Checkpoint: Foundation

* [ ] TypeScript compiles (new Phase 1 modules pass; existing sample `src/index.ts` typing errors are deferred to the Phase 2 replacement).
* [x] Marker registry covers all requested statuses.
* [x] API payloads match current SiYuan endpoint contract.
* [x] Unknown markers remain representable.

**Phase 1 verification:** `pnpm test` (Vitest: 12 tests passed), isolated Phase 1 typecheck, and ESLint/dprint checks for the new modules pass.

### Phase 2: Rendering and lifecycle

**Scope:** Replace the sample plugin lifecycle with a read-only rendering layer. This phase detects native task blocks and makes the existing `data-task` values render with the Minimal-style CSS; it does not intercept clicks, write markers, add menus, or add settings. Interaction and persistence remain Phase 3 work.

**Rendering decision:** Use the icon mapping in `icon.md` and the already-adapted SVG/mask geometry in `src/index.scss` as the canonical visual specification. Keep SiYuan's native checkbox SVG for ``, `x`, and `X`; render only alternate markers with plugin CSS. The registry's `icon` IDs and hex colors remain semantic metadata for later menu/configuration work; Phase 2 CSS must use the theme tokens documented in `icon.md`.

#### Task 5: Add pure task-item discovery and marker projection

**Description:** Create a small rendering module (for example `src/task-renderer.ts`) that discovers native task list items, reads their `data-task` attribute, and calls `parseTaskMarker`/`MARKER_REGISTRY`. Keep the projection side-effect free or limited to plugin-owned metadata; do not replace the list item, inject a second checkbox, or attach one listener per task.

**Implementation details:**

* Centralize selectors: `.protyle-wysiwyg`, `[data-type="NodeListItem"][data-subtype="t"][data-task]`, and the two supported action locations (`> .protyle-action--task` and `> p > .protyle-action--task`).
* Return a typed view containing the item, action element (when present), raw marker, parsed marker kind, and optional `MarkerDefinition`. Missing actions, non-task list items, ``, `x`, `X`, and unknown/malformed markers must be safe no-ops for visual customization.
* Treat ASCII `"` as the persisted canonical quote marker. Keep the existing curly-quote selector (`“`) as a visual compatibility alias only; it is not a valid one-byte API marker.
* Do not normalize or rewrite `data-task`; the native DOM attribute remains the source of truth and unknown values must remain untouched.

**Acceptance criteria:**

* [ ] Every supported marker is classified through the registry without duplicating marker tables.
* [ ] Native todo/completed and unknown markers retain their native DOM presentation.
* [ ] Both direct-child and paragraph-wrapped task action structures are recognized.
* [ ] No rendering pass adds duplicate children, listeners, or block markup.

**Verification:** Add unit fixtures for all supported markers, `X`, unknown values, missing attributes, and both action DOM shapes. Run `pnpm test`.

**Dependencies:** Tasks 1-4.

**Files likely touched:**

* `src/task-renderer.ts`
* `tests/task-renderer.test.ts`

**Estimated scope:** Medium (3-4 files).

#### Task 6: Finalize generated Minimal-style icon and color CSS

**Description:** Make `src/index.scss` the only source of marker-specific presentation and compile it through the existing Sass/Webpack pipeline. Do not introduce another icon library or manually draw replacement SVGs in TypeScript.

**Canonical mapping to implement and verify:**

| Marker(s)    | Icon/geometry from `icon.md` and `src/index.scss`                                | Theme color           |
| ------------ | -------------------------------------------------------------------------------- | --------------------- |
| ``, `x`, `X` | SiYuan native unchecked/completed SVG                                            | Native theme          |
| `/`          | Split checkbox: primary left half, transparent right half, border and 3px radius | `--b3-theme-primary`  |
| `-`          | Horizontal-line mask                                                             | `--b3-font-secondary` |
| `>`          | Forwarded paper-plane mask, rotated 90 degrees                                   | `--b3-font-secondary` |
| `<`          | Calendar/schedule mask                                                           | `--b3-font-secondary` |
| `?`          | Warning-colored filled tile with white question glyph                            | `--b3-theme-warning`  |
| `!`          | Alert-triangle mask                                                              | `--b3-theme-warning`  |
| `*`          | Star mask                                                                        | `--b3-theme-warning`  |
| `"`, `“`     | Primary-colored filled tile with white quote glyph                               | `--b3-theme-primary`  |
| `l`          | Location-pin mask                                                                | `--b3-theme-error`    |
| `b`          | Bookmark mask                                                                    | `--b3-theme-warning`  |
| `i`          | Primary-colored filled tile with white information glyph                         | `--b3-theme-primary`  |
| `S`          | Success-colored filled tile with white dollar glyph                              | `--b3-theme-success`  |
| `I`          | Lightbulb mask                                                                   | `--b3-theme-warning`  |
| `p`          | Thumbs-up mask                                                                   | `--b3-theme-success`  |
| `c`          | Thumbs-down mask                                                                 | `--b3-theme-warning`  |
| `f`          | Flame mask                                                                       | `--b3-theme-error`    |
| `k`          | Key mask                                                                         | `--b3-theme-warning`  |
| `w`          | Trophy/win mask                                                                  | `--b3-theme-primary`  |
| `u`          | Upward-trend mask                                                                | `--b3-theme-success`  |
| `d`          | Downward-trend mask                                                              | `--b3-theme-error`    |

**CSS contract:**

* Scope every rule below `.protyle-wysiwyg` and the native `NodeListItem`/`protyle-action--task` selectors. Support both direct and paragraph-wrapped action elements.
* For alternate markers only, hide the native child `svg` and draw an 18px × 18px `::before` using `currentColor`, `background-size: contain`, and both standard and `-webkit-mask-*` properties.
* Use theme variables with fallbacks (`--b3-theme-*`, `--b3-font-*`, `--b3-border-color`); do not copy the registry hex colors into CSS. Preserve readable contrast in light and dark themes.
* Leave native ``, `x`, and `X` selectors unmodified. The existing `$custom-markers` list intentionally excludes them; keep that behavior.
* Preserve the Minimal MIT license header and source attribution. Do not hand-edit generated `index.css`; regenerate it from Sass only when the build pipeline succeeds.

**Acceptance criteria:**

* [x] Each row in the mapping above renders the specified geometry and theme color.
* [x] No custom rule changes the native todo/completed checkbox or unknown markers.
* [x] CSS compiles without Sass errors and includes both WebKit and standard mask declarations.

**Verification:** Run `pnpm exec sass --no-source-map src/index.scss /tmp/siyuan-custom-checkbox-phase2.css`, inspect representative light/dark variable output, and include the CSS compile/build result in the checkpoint.

**Dependencies:** Task 5 for selector/projection fixtures; the inline Minimal-derived rules in `src/index.scss` are the visual reference.

**Files likely touched:**

* `src/index.scss`
* `tests/checklist-icons.test.ts` (if source-level CSS assertions are needed)

**Estimated scope:** Medium (2-4 files).

#### Task 7: Attach Protyle lifecycle handling and a scoped observer

**Description:** Replace the sample `src/index.ts` behavior with a minimal plugin that attaches the renderer to existing and future Protyle WYSIWYG roots. Use SiYuan's typed event bus rather than polling the whole document.

**Implementation details:**

* Subscribe with stable handler references to `loaded-protyle-static`, `loaded-protyle-dynamic`, `switch-protyle`, and `destroy-protyle`; resolve the root from `event.detail.protyle.element` and attach it if it contains `.protyle-wysiwyg`.
* Scan existing `.protyle-wysiwyg` roots from `onLayoutReady` so editors opened before plugin startup are covered.
* Create at most one `MutationObserver` per root. Observe `childList`/`subtree` plus `data-task` and `data-subtype` changes; include `class` only if a real SiYuan DOM case requires it. Never observe plugin-owned bookkeeping attributes.
* Queue affected items in a `Set` and flush once per `requestAnimationFrame`; process added nodes and the closest task item for attribute changes. This handles opening, editing, paste, and dynamic rendering without a document-wide hot loop.
* On `destroy-protyle`, detach the corresponding root observer and discard queued nodes belonging to it.

**Acceptance criteria:**

* [ ] Existing editors, static/dynamic Protyle loads, switching editors, task edits, paste, and dynamically inserted tasks all reach the renderer.
* [ ] Multiple lifecycle events for one root do not create multiple observers or duplicate work.
* [ ] Observer callbacks ignore unrelated blocks and do not cause recursive mutation loops.

**Verification:** Add observer/controller tests with fake roots and a controllable RAF, then run the unit suite. Manually exercise a document containing all markers in desktop WYSIWYG and confirm no console errors or visible lag.

**Dependencies:** Tasks 5-6.

**Files likely touched:**

* `src/index.ts`
* `src/task-observer.ts` (or the observer portion of `src/task-renderer.ts`)
* `tests/task-observer.test.ts`

**Estimated scope:** Large; keep the public controller surface to `start()`, `attach(protyle/root)`, `detach(root)`, and `stop()`.

#### Task 8: Make processing idempotent and unload-safe

**Description:** Give the renderer controller explicit ownership of observers, RAF handles, and event subscriptions. Replace all remaining sample tabs, docks, dialogs, commands, and demo listeners so the plugin's lifecycle is only the checkbox renderer lifecycle.

**Implementation details:**

* Store every event listener callback and unregister it in `onunload`; call `stop()` to disconnect observers, cancel pending RAF work, clear queues, and release root references.
* Keep rendering declarative: CSS pseudo-elements are not appended to the DOM, so repeated processing cannot create duplicate decorations. If plugin-owned attributes are introduced for diagnostics, remove only those attributes during cleanup.
* Fail closed when `document`, a Protyle root, a task action, or a marker is missing; do not throw because SiYuan changed an unrelated DOM subtree.
* Keep API creation out of this phase unless required for type wiring; no click interception or persistence belongs in the rendering controller.

**Acceptance criteria:**

* [ ] `pnpm exec tsc --noEmit` passes after the sample `src/index.ts` is replaced.
* [ ] Calling `start()` twice and `stop()` twice is safe and leaves no observer/event/RAF registrations.
* [ ] Unloading the plugin stops future processing and restores native presentation by removing plugin-owned state; unknown/native tasks were never modified.

**Verification:** Run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm format:check`, and the production build. Install the generated package in a clean SiYuan workspace, enable/disable the plugin, and verify that native checkboxes remain intact.

**Dependencies:** Tasks 5-7.

**Files likely touched:**

* `src/index.ts`
* `src/task-renderer.ts`
* `src/task-observer.ts`
* `tests/task-observer.test.ts`

**Estimated scope:** Medium (3-5 files).

### Checkpoint: Rendering

* [ ] All unit tests pass and full TypeScript typecheck is clean.
* [ ] Sass and production package build complete without errors.
* [ ] Existing, newly opened, edited, pasted, and dynamically loaded tasks render exactly once.
* [ ] Every custom marker matches the icon/color table; ``, `x`, `X`, and unknown markers remain native.
* [ ] Light and dark themes are readable and the 18px action geometry does not shift task text.
* [ ] Plugin unload removes observers/listeners and leaves native presentation in place.
* [ ] No Phase 3 behavior (click interception, menu, API write, or settings) has been introduced.

### Phase 3: Interaction and persistence

* [ ] Task 9: Intercept task-button click and cycle configured statuses.
* [ ] Task 10: Add status picker menu with icon, label, and keyboard navigation.
* [ ] Task 11: Persist changes through kernel API with optimistic UI and rollback.
* [ ] Task 12: Add keyboard shortcuts and configurable cycle order.

### Checkpoint: Core flow

* [ ] User can create, cycle, and select every status.
* [ ] Reload preserves status.
* [ ] API failure does not leave misleading UI state.
* [ ] Native checkbox behavior still works for unsupported or excluded items.

### Phase 4: Input, configuration, and polish

* [ ] Task 13: Detect typed `- [marker]` input and preserve native task conversion where safe.
* [ ] Task 14: Add settings for enabled statuses, colors, icon set, cycle order, and click behavior.
* [ ] Task 15: Add batch status updates for selected task items.
* [ ] Task 16: Add localization, accessibility labels, and reduced-motion behavior.

### Checkpoint: Release candidate

* [ ] Build package contains required `plugin.json`, JS, CSS, and assets.
* [ ] Settings persist through plugin reload.
* [ ] No direct workspace file writes.
* [ ] README documents supported markers, limitations, and recovery behavior.

### Phase 5: Compatibility validation

* [ ] Task 17: Test desktop editor, mobile frontend, browser frontend, and read-only mode.
* [ ] Task 18: Test sync, export, import, search, undo/redo, and duplicate document views.
* [ ] Task 19: Test plugin disable/uninstall with existing custom markers.
* [ ] Task 20: Compare behavior across supported SiYuan versions and document minimum version.

## Key Implementation Details

### Native selector

```css
.protyle-wysiwyg div[data-type="NodeListItem"][data-subtype="t"][data-task="/"] > .protyle-action--task {
  /* incomplete icon */
}
```

### Persistence contract

```json
{
  "id": "task-block-id",
  "marker": "/"
}
```

Batch updates use the native wrapper payload:

```json
{
  "items": [
    { "id": "task-block-id", "marker": "/" }
  ]
}
```

Use the current SiYuan endpoints:

* `POST /api/block/updateTaskListItemMarker`
* `POST /api/block/batchUpdateTaskListItemMarker`

### Processing rules

* Process existing editors once at startup.
* Observe `childList`, `data-task`, `data-subtype`, and relevant class changes.
* Queue affected items with `requestAnimationFrame`.
* Mark processed nodes to prevent duplicate listeners.
* Never assume every task marker is in the registry.

## Risks and Mitigations

| Risk                                    | Impact | Mitigation                                                                                |
| --------------------------------------- | -----: | ----------------------------------------------------------------------------------------- |
| Markdown parser rejects custom markers  |   High | Test target SiYuan build; fall back to native marker or preserve source text.             |
| Core click handler races plugin handler |   High | Use capture phase, stop only supported task items, verify API result.                     |
| DOM structure changes                   |   High | Centralize selectors; use feature detection and graceful fallback.                        |
| Export/PDF ignores plugin CSS           | Medium | Validate export separately; document editor-only scope or add export-compatible CSS path. |
| Mobile frontend differs                 |   High | Feature-detect selectors/events; test mobile before release.                              |
| Broad observer causes lag               | Medium | Scope to `.protyle-wysiwyg`, filter attributes, batch with RAF.                           |
| API write fails                         |   High | Roll back optimistic state and show actionable error.                                     |
| Theme contrast problems                 | Medium | Use CSS variables, contrast checks, and dark-mode fixtures.                               |

## Definition of Done

* All requested statuses render and persist.
* Native task content remains valid with plugin disabled.
* Core interactions pass desktop and mobile smoke tests.
* API failure, unknown markers, and lifecycle cleanup are tested.
* Build output installable in a clean SiYuan workspace.

## Open Questions

* Which SiYuan minimum version must be supported?
* Should custom markers be written into Markdown export, or editor-only first?
* Click behavior: one fixed cycle, configurable cycle, or menu only?
* Should status changes update task timestamps like native toggle?
* Should plugin support only WYSIWYG editor or also exported/read-only views?

## Sources

* [SiYuan native task rendering](https://github.com/siyuan-note/siyuan/blob/master/app/src/protyle/wysiwyg/list.ts#L2180-L2225)
* [SiYuan block marker API](https://github.com/siyuan-note/siyuan/blob/master/kernel/api/block_op.go)
* [Lute task marker model](https://github.com/88250/lute/blob/master/ast/node.go#L72-L173)
* [SiYuan plugin API](https://github.com/siyuan-note/petal/blob/main/siyuan.d.ts)
* [Custom callout plugin](https://github.com/zongqir/siyuan-custom-callout)
