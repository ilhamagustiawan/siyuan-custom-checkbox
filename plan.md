# Implementation Plan: Alternate Checkboxes for SiYuan

## Overview

Build a SiYuan plugin that adds configurable checkbox statuses and icons while preserving native task-list blocks. Persist status as native one-character task markers through SiYuan's block API. Borrow custom-callout's native-DOM enhancement, CSS theme, lifecycle, and observer patterns.

## Goals

- Support the requested markers: ` `, `/`, `x`, `-`, `>`, `<`, `?`, `!`, `*`, `\"`, `l`, `b`, `i`, `S`, `I`, `p`, `c`, `f`, `k`, `w`, `u`, `d`.
- Render distinct icons/colors for every supported marker.
- Change status by click, keyboard, and status menu.
- Preserve normal SiYuan behavior when plugin disabled or marker unknown.
- Avoid direct `.sy` file writes and custom block formats.

## Architecture Decisions

1. **Native task blocks remain source of truth.** Read `data-task` from native `NodeListItem` elements. Persist with `/api/block/updateTaskListItemMarker` and batch endpoint.
2. **DOM enhancement, not block replacement.** Style `.protyle-action--task`; do not replace list items or rewrite document HTML.
3. **Explicit marker registry.** Each status defines marker, label, icon, color, next status, and optional accessibility text. Unknown markers fall back to native UI.
4. **Scoped lifecycle.** Observe Protyle editors and relevant attributes only. Disconnect observers and remove listeners/styles on unload.
5. **Theme variables.** Generate CSS using SiYuan theme variables plus configurable status colors. Keep contrast and dark-mode support.
6. **Separate visual and persistence layers.** CSS/DOM updates are immediate; API writes are authoritative and failures restore the previous state.

## Task List

### Phase 1: Foundation and compatibility

- [x] Task 1: Create plugin scaffold and manifest (metadata adapted; sample lifecycle remains until Phase 2 replacement).
- [x] Task 2: Define typed marker registry and status-cycle rules.
- [x] Task 3: Add API wrapper for single and batch marker updates.
- [x] Task 4: Build fixture-based parser tests for supported, native, and unknown markers.

### Checkpoint: Foundation

- [ ] TypeScript compiles (new Phase 1 modules pass; existing sample `src/index.ts` typing errors are deferred to the Phase 2 replacement).
- [x] Marker registry covers all requested statuses.
- [x] API payloads match current SiYuan endpoint contract.
- [x] Unknown markers remain representable.

**Phase 1 verification:** `pnpm test` (Vitest: 12 tests passed), isolated Phase 1 typecheck, and ESLint/dprint checks for the new modules pass.

### Phase 2: Rendering

- [ ] Task 5: Detect native task items and map `data-task` to status metadata.
- [ ] Task 6: Implement generated CSS/SVG icon styles for all statuses.
- [ ] Task 7: Add Protyle lifecycle handling and scoped `MutationObserver`.
- [ ] Task 8: Add cleanup and idempotent processing.

### Checkpoint: Rendering

- [ ] Existing tasks render without duplicate decorations.
- [ ] Newly opened, edited, pasted, and dynamically loaded tasks render.
- [ ] Dark and light themes remain readable.
- [ ] Plugin unload restores native presentation.

### Phase 3: Interaction and persistence

- [ ] Task 9: Intercept task-button click and cycle configured statuses.
- [ ] Task 10: Add status picker menu with icon, label, and keyboard navigation.
- [ ] Task 11: Persist changes through kernel API with optimistic UI and rollback.
- [ ] Task 12: Add keyboard shortcuts and configurable cycle order.

### Checkpoint: Core flow

- [ ] User can create, cycle, and select every status.
- [ ] Reload preserves status.
- [ ] API failure does not leave misleading UI state.
- [ ] Native checkbox behavior still works for unsupported or excluded items.

### Phase 4: Input, configuration, and polish

- [ ] Task 13: Detect typed `- [marker]` input and preserve native task conversion where safe.
- [ ] Task 14: Add settings for enabled statuses, colors, icon set, cycle order, and click behavior.
- [ ] Task 15: Add batch status updates for selected task items.
- [ ] Task 16: Add localization, accessibility labels, and reduced-motion behavior.

### Checkpoint: Release candidate

- [ ] Build package contains required `plugin.json`, JS, CSS, and assets.
- [ ] Settings persist through plugin reload.
- [ ] No direct workspace file writes.
- [ ] README documents supported markers, limitations, and recovery behavior.

### Phase 5: Compatibility validation

- [ ] Task 17: Test desktop editor, mobile frontend, browser frontend, and read-only mode.
- [ ] Task 18: Test sync, export, import, search, undo/redo, and duplicate document views.
- [ ] Task 19: Test plugin disable/uninstall with existing custom markers.
- [ ] Task 20: Compare behavior across supported SiYuan versions and document minimum version.

## Key Implementation Details

### Native selector

```css
.protyle-wysiwyg
  div[data-type="NodeListItem"][data-subtype="t"][data-task="/"]
  > .protyle-action--task {
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
    {"id": "task-block-id", "marker": "/"}
  ]
}
```

Use the current SiYuan endpoints:

- `POST /api/block/updateTaskListItemMarker`
- `POST /api/block/batchUpdateTaskListItemMarker`

### Processing rules

- Process existing editors once at startup.
- Observe `childList`, `data-task`, `data-subtype`, and relevant class changes.
- Queue affected items with `requestAnimationFrame`.
- Mark processed nodes to prevent duplicate listeners.
- Never assume every task marker is in the registry.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Markdown parser rejects custom markers | High | Test target SiYuan build; fall back to native marker or preserve source text. |
| Core click handler races plugin handler | High | Use capture phase, stop only supported task items, verify API result. |
| DOM structure changes | High | Centralize selectors; use feature detection and graceful fallback. |
| Export/PDF ignores plugin CSS | Medium | Validate export separately; document editor-only scope or add export-compatible CSS path. |
| Mobile frontend differs | High | Feature-detect selectors/events; test mobile before release. |
| Broad observer causes lag | Medium | Scope to `.protyle-wysiwyg`, filter attributes, batch with RAF. |
| API write fails | High | Roll back optimistic state and show actionable error. |
| Theme contrast problems | Medium | Use CSS variables, contrast checks, and dark-mode fixtures. |

## Definition of Done

- All requested statuses render and persist.
- Native task content remains valid with plugin disabled.
- Core interactions pass desktop and mobile smoke tests.
- API failure, unknown markers, and lifecycle cleanup are tested.
- Build output installable in a clean SiYuan workspace.

## Open Questions

- Which SiYuan minimum version must be supported?
- Should custom markers be written into Markdown export, or editor-only first?
- Click behavior: one fixed cycle, configurable cycle, or menu only?
- Should status changes update task timestamps like native toggle?
- Should plugin support only WYSIWYG editor or also exported/read-only views?

## Sources

- [SiYuan native task rendering](https://github.com/siyuan-note/siyuan/blob/master/app/src/protyle/wysiwyg/list.ts#L2180-L2225)
- [SiYuan block marker API](https://github.com/siyuan-note/siyuan/blob/master/kernel/api/block_op.go)
- [Lute task marker model](https://github.com/88250/lute/blob/master/ast/node.go#L72-L173)
- [SiYuan plugin API](https://github.com/siyuan-note/petal/blob/main/siyuan.d.ts)
- [Custom callout plugin](https://github.com/zongqir/siyuan-custom-callout)
