# TODO

## Goal

Build the siyuan-custom-checkbox plugin from scratch: render Minimal-style icons for alternate task-list markers on native SiYuan task blocks, click any custom-marked checkbox to reset it to unchecked, pick any status from a context/long-press menu, persist through SiYuan's native marker API, and ship a clean package for all platforms with no kernel component.

## Tasks

### 1. Cleanup and build reset

* [x] Delete sample/demo modules: `src/index-v2-example.ts`, `src/dock/`, `src/kernel.ts`, and the sample contents of `src/checkbox/index.ts` and `src/settings/index.ts`; delete superseded `plan.md`
* [x] Remove kernel from tooling: drop `dev:kernel`/`build:kernel` from `package.json` scripts (`dev` and `build` run the app target only) and remove the kernel branch plus `VITE_BUILD_TARGET` handling from `vite.config.ts`
* [x] Remove the `kernels` field from `plugin.json` and delete stale root build artifacts `index.js`, `index.css`, `kernel.js` (fresh output goes to `dev/` and `dist/`)
* [x] Replace `src/index.ts` with a minimal real `Plugin` subclass (no features yet) and confirm `pnpm build` passes with no `kernel.js` in `dist/` or `package.zip`

### 2. Entry point and rendering layer

* [x] Verify the SiYuan DOM contract from `siyuan-note/siyuan` source (master + the 3.8.0 line): `data-task` attribute values on `NodeListItem`, `.protyle-action--task` placement (direct child and `p`-wrapped), and the exact marker value the kernel uses for an unchecked task; record findings in `TODO.md` Notes
* [x] Audit `src/index.scss` against the verified contract and adjust selectors if needed so all 18 custom markers (plus the curly-quote alias) render 18px icons from theme tokens while ``, `x`, `X` keep native rendering
* [x] Flesh out `src/index.ts`: `onload` loads saved config and starts the interaction controller, `onunload` removes every listener it added; import `./index.scss` so Vite emits `index.css`
* [x] Confirm compiled `dist/index.css` contains a rule for every custom `data-task` value and that `pnpm dev` produces a loadable `dev/` build

### 3. Click-to-uncheck interaction

* [x] Implement one delegated capture-phase `click` listener (document level, no per-node listeners, no MutationObserver): when the click lands on `.protyle-action--task` of a task item whose `data-task` is a custom (non-native) marker, `preventDefault`/`stopPropagation` and persist the unchecked marker via `updateTaskListItemMarker`
* [x] Make the write optimistic (set `data-task` locally at once) with rollback plus a `showMessage` error if the API rejects or fails
* [x] Guarantee native markers (``, `x`, `X`) and unknown markers are never intercepted, so SiYuan's native toggle keeps working

* [x] Consolidate i18n on the root `i18n/` directory (the one SiYuan loads), remove the duplicate `src/i18n/`, and add all UI strings (22 status labels, menu title, settings labels, error messages) to `en.json` and `zh-CN.json`

* [x] Implement the status picker: `contextmenu` on desktop and ~500 ms long-press on touch devices on `.protyle-action--task` opens a siyuan `Menu` listing statuses with i18n labels and the current status checked; choosing one persists via the API with the same optimistic-update/rollback path as click
* [x] Add a plugin command (no default hotkey) that opens the picker for the task list item at the current selection, no-op with an info message when the selection is not on a task
* [x] Rewrite `src/settings/index.ts` as a real settings panel: a toggle per status controlling its visibility in the picker menu, persisted with `loadData`/`saveData`, applied to the menu without restarting the plugin

### 5. Quality gates, packaging, and docs

* [x] All gates pass: `tsc --noEmit`, `pnpm lint`, `pnpm format:check`, `pnpm build`
* [x] Inspect `package.zip`: contains `index.js`, `index.css`, `plugin.json`, `i18n/`, `icon.png`, `preview.png`, `README*.md`; contains no `kernel.js`
* [x] Rewrite `README.md` and `README.zh-CN.md` for the real plugin (feature list, marker table from `icon.md`, usage: click = reset to unchecked, menu = pick status, settings) and add a `0.1.0` entry to `CHANGELOG.md`
* [x] Write `TESTING.md`: manual smoke checklist covering render of all markers, click-to-uncheck, menu set, reload persistence, disable/uninstall restoring native look, and a mobile/browser spot-check (executed by the user in SiYuan)

## Notes

* Plan written from scratch per user decision; the old `plan.md`/`todo.md` phasing is ignored and `plan.md` is deleted in Task 1.
* Click behavior (user decision): clicking a custom-marked checkbox always resets it to unchecked. Native ``/`x` items are left to SiYuan's own toggle, which already satisfies "click → unchecked" for `x`.
* Kernel plugin removed entirely (user decision): no `src/kernel.ts`, no kernel build target, no `kernels` in `plugin.json`.
* No Vitest or other test framework (user decision); verification = typecheck, lint, format, build, plus manual smoke tests.
* Target all platforms (user decision): only platform-agnostic DOM APIs; long-press covers mobile since `contextmenu` is unreliable there; `plugin.json` frontend/backend declarations stay as-is.
* Editor-only rendering scope: export/PDF rendering of custom icons is out of scope; the Markdown source always keeps valid native one-character markers.
* Menu items use text labels with a check on the current status; custom SVG symbols in the menu are deferred unless requested.
* The marker registry's `next` cycle metadata no longer drives behavior; the registry remains the single source for labels/icons/menu order.
* `.tmp/siyuan-custom-callout` is reference material and stays untouched; `docs/superpowers/` documents the removed kernel demo and is kept as history.
* Official source verification: both `v3.8.0` and `master` generate task items as `[data-type="NodeListItem"][data-subtype="t"][data-task]` with a direct-child `.protyle-action--task`; no paragraph-wrapped action is generated by the official source, so the existing `> p >` compatibility selector is retained without treating it as canonical.
* Official source verification: the unchecked marker is the single ASCII space (`" "`); `toggleTaskListItem` resets every non-space marker to `" "` and toggles the native checked marker to `"X"`. The kernel endpoint accepts exactly one byte and rejects only `[` and `]`. Sources: `https://github.com/siyuan-note/siyuan/blob/v3.8.0/app/src/protyle/wysiwyg/list.ts#L67-L96`, `https://github.com/siyuan-note/siyuan/blob/master/app/src/protyle/wysiwyg/list.ts#L67-L96`, `https://github.com/siyuan-note/siyuan/blob/v3.8.0/kernel/api/block_op.go#L49-L91`, `https://github.com/siyuan-note/siyuan/blob/master/kernel/api/block_op.go#L49-L91`
