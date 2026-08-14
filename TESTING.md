# Manual testing checklist

These checks require a real SiYuan workspace. Use a copy of a test notebook and SiYuan 3.8.0 or newer.

## Setup

* [ ] Install the built `package.zip`, or link the `dev/` output into the workspace plugin directory.
* [ ] Enable **SiYuan Custom Checkbox**.
* [ ] Create a document containing native task items with markers from the table below.

## Rendering

Create one task for each marker and verify the checkbox action is visible, distinct, and aligned with the task text:

* [ ] Unchecked space (``) uses SiYuan's native unchecked icon.
* [ ] `x` and `X` use SiYuan's native completed icon.
* [ ] Alternate markers render their expected icon and theme color: `/`, `-`, `>`, `<`, `?`, `!`, `*`, `"`, `“`, `l`, `b`, `i`, `S`, `I`, `p`, `c`, `f`, `k`, `w`, `u`, `d`.
* [ ] Alternate markers keep the task text at unchecked opacity and do not appear dimmed as completed.
* [ ] Alternate markers contain one visible plugin checkbox component, not a duplicate native icon.
* [ ] Switch between light and dark themes; icons remain visible with readable contrast.
* [ ] Add nested task lists; icons remain scoped to task actions and do not affect ordinary lists.
* [ ] Open a read-only/published view and confirm the plugin does not add editor-only controls outside its intended scope.

## Click behavior

* [ ] Click an alternate marker; it changes to the unchecked space marker.
* [ ] Confirm the task remains a native task list item after the click.
* [ ] Click an unchecked native task; SiYuan changes it to its native completed state.
* [ ] Click a completed native task; SiYuan changes it to unchecked.
* [ ] Confirm unknown one-character markers are not intercepted by the plugin.
* [ ] Disconnect or invalidate the kernel request if possible; confirm a failed update restores the previous marker and shows an error message.

## Status picker

* [ ] Desktop: right-click a task action and verify the status menu opens at the pointer.
* [ ] Desktop: verify the menu title, localized labels, and current status checkmark.
* [ ] Choose each enabled alternate status and confirm the task marker and icon update.
* [ ] Touch device: long-press a task action for approximately 500 ms and verify the menu opens.
* [ ] Touch device: release after a long-press and confirm it does not also trigger an unwanted click-to-uncheck.
* [ ] Use the command palette command **Choose task status** with the cursor inside a task item; verify the same menu opens.
* [ ] Run the command with the cursor in an ordinary paragraph; verify an informational message appears and no block changes.

## Settings and persistence

* [ ] Open the plugin settings and verify one toggle exists for every supported marker.
* [ ] Hide a status; verify it disappears from newly opened status menus without restarting the plugin.
* [ ] Re-enable the status; verify it returns to newly opened menus.
* [ ] Disable all statuses; verify the menu displays its no-enabled-status message without breaking native task clicks.
* [ ] Reload SiYuan; verify the selected status visibility settings persist.
* [ ] Sync or reopen the notebook; verify task markers and native task structure remain intact.
* [ ] Export/import a document; verify native task markers survive, with editor-only custom icon styling treated as out of scope.

## Lifecycle and packaging

* [ ] Disable the plugin; verify native task icons and click behavior return without duplicate handlers or menus.
* [ ] Re-enable the plugin; verify handlers are installed once and behavior works again.
* [ ] Uninstall the plugin; verify documents remain valid native task lists and no plugin-owned block data remains.
* [ ] Install `package.zip` in a clean workspace; verify the plugin loads with no `kernel.js` requirement.
* [ ] Repeat the basic rendering, click, menu, and settings checks on desktop, mobile, browser-desktop, and browser-mobile where available.

## Automated checks already run

* `pnpm exec tsc --noEmit`
* `pnpm lint`
* `pnpm format:check`
* `pnpm build`
* `pnpm test`
