[中文](README.zh-CN.md)

# SiYuan Custom Checkbox

A SiYuan plugin that adds alternate task statuses and Minimal-style icons while keeping native task-list blocks and markers.

## Features

* Renders distinct icons and theme-aware colors for alternate task markers.
* Keeps SiYuan's native unchecked and completed checkbox icons for ``, `x`, and `X`.
* Left-clicking an alternate status resets the task to unchecked.
* Right-clicking a task action opens the status picker on desktop; touch long-press opens it on mobile.
* The command palette command **Choose task status** opens the picker for the selected task.
* Settings control which statuses appear in the picker and apply immediately.
* Uses SiYuan's native task-marker API; no `.sy` file writes or custom block formats.
* Works with desktop, mobile, and browser frontends using platform-agnostic DOM behavior.

## Usage

1. Create a native SiYuan task list item.
2. Right-click its checkbox, or long-press it on a touch device.
3. Choose a status from the picker.
4. Left-click an alternate status whenever you want to reset it to unchecked.

Native ``, `x`, and `X` items keep SiYuan's normal toggle behavior. Unknown markers are left untouched and retain SiYuan's native presentation.

Open **Settings → Plugins → SiYuan Custom Checkbox** to show or hide statuses in the picker. The setting is saved immediately.

## Statuses

The blank marker in the first row means one ASCII space (``).

| Marker    | Markdown          | Status           | Rendering           | Color token           |
| --------- | ----------------- | ---------------- | ------------------- | --------------------- |
| (space)   | `- [ ]`           | Todo / unchecked | Native SiYuan icon  | Native theme          |
| `x` / `X` | `- [x]`           | Done             | Native SiYuan icon  | Native theme          |
| `/`       | `- [/]`           | Incomplete       | Split checkbox      | `--b3-theme-primary`  |
| `-`       | `- [-]`           | Canceled         | Horizontal line     | `--b3-font-secondary` |
| `>`       | `- [>]`           | Forwarded        | Rotated paper plane | `--b3-font-secondary` |
| `<`       | `- [<]`           | Scheduled        | Calendar            | `--b3-font-secondary` |
| `?`       | `- [?]`           | Question         | Question tile       | `--b3-theme-warning`  |
| `!`       | `- [!]`           | Important        | Alert triangle      | `--b3-theme-warning`  |
| `*`       | `- [*]`           | Starred          | Star                | `--b3-theme-warning`  |
| `"` / `“` | `- ["]` / `- [“]` | Quoted           | Quote tile          | `--b3-theme-primary`  |
| `l`       | `- [l]`           | Location         | Location pin        | `--b3-theme-error`    |
| `b`       | `- [b]`           | Bookmark         | Bookmark            | `--b3-theme-warning`  |
| `i`       | `- [i]`           | Information      | Information tile    | `--b3-theme-primary`  |
| `S`       | `- [S]`           | Savings          | Dollar tile         | `--b3-theme-success`  |
| `I`       | `- [I]`           | Idea             | Lightbulb           | `--b3-theme-warning`  |
| `p`       | `- [p]`           | Pros             | Thumbs up           | `--b3-theme-success`  |
| `c`       | `- [c]`           | Cons             | Thumbs down         | `--b3-theme-warning`  |
| `f`       | `- [f]`           | Fire             | Flame               | `--b3-theme-error`    |
| `k`       | `- [k]`           | Key              | Key                 | `--b3-theme-warning`  |
| `w`       | `- [w]`           | Win              | Trophy              | `--b3-theme-primary`  |
| `u`       | `- [u]`           | Up               | Upward trend        | `--b3-theme-success`  |
| `d`       | `- [d]`           | Down             | Downward trend      | `--b3-theme-error`    |

The ASCII quote (`"`) is the canonical persisted marker. The curly quote is a visual compatibility alias. Unknown markers are not mapped.

## Compatibility and persistence

Statuses remain native one-character task markers. Changes use:

* `POST /api/block/updateTaskListItemMarker`
* `POST /api/block/batchUpdateTaskListItemMarker`

The plugin only enhances the WYSIWYG editor. Export and PDF rendering continue to use SiYuan's native task markup.

## Development

Requirements: Node.js 24 or newer and pnpm.

```bash
pnpm install
pnpm dev       # watch build into dev/
pnpm build     # production build and package.zip
pnpm make-link # link dev/ into a SiYuan plugin directory
pnpm make-install # build and copy dist/ into a SiYuan plugin directory
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit
```

`pnpm make-link` detects the running SiYuan workspace and falls back to `SIYUAN_PLUGIN_DIR` when the API is unavailable. `pnpm make-install` builds the plugin and copies `dist/` into the selected workspace's plugin directory.

The release package contains `index.js`, `index.css`, `plugin.json`, `i18n/`, the icon and preview assets, and the localized README files. The plugin has no kernel component.

## License

This plugin is licensed under the MIT License. The checklist icon geometry is adapted from [Minimal for Obsidian](https://github.com/kepano/obsidian-minimal), also under the MIT License.
