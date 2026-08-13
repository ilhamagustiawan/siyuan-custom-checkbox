# Checkbox icon mapping

The checkbox markers below map to the Minimal-style icons in `src/checklist-icons.scss`.
The stylesheet targets SiYuan task items through `data-task` and keeps the native SiYuan icons for the ordinary unchecked and completed states.

| Marker    | Markdown syntax   | Status           | Icon mapping       | Rendering                          | Color token           |
| --------- | ----------------- | ---------------- | ------------------ | ---------------------------------- | --------------------- |
| ``        | `- [ ]`           | Todo / unchecked | `iconUncheck`      | SiYuan native icon                 | Native theme          |
| `x` / `X` | `- [x]`           | Done             | `iconCheck`        | SiYuan native icon                 | Native theme          |
| `/`       | `- [/]`           | Incomplete       | `icon-in-progress` | Split checkbox                     | `--b3-theme-primary`  |
| `-`       | `- [-]`           | Canceled         | `icon-canceled`    | Horizontal line mask               | `--b3-font-secondary` |
| `>`       | `- [>]`           | Forwarded        | `icon-forwarded`   | Rotated paper-plane mask           | `--b3-font-secondary` |
| `<`       | `- [<]`           | Scheduled        | `icon-schedule`    | Calendar mask                      | `--b3-font-secondary` |
| `?`       | `- [?]`           | Question         | `icon-question`    | Question mark on a filled tile     | `--b3-theme-warning`  |
| `!`       | `- [!]`           | Important        | `icon-important`   | Alert triangle mask                | `--b3-theme-warning`  |
| `*`       | `- [*]`           | Starred          | `icon-star`        | Star mask                          | `--b3-theme-warning`  |
| `"` / `“` | `- ["]` / `- [“]` | Quote            | `icon-quote`       | Quote glyph on a filled tile       | `--b3-theme-primary`  |
| `l`       | `- [l]`           | Location         | `icon-location`    | Location-pin mask                  | `--b3-theme-error`    |
| `b`       | `- [b]`           | Bookmark         | `icon-bookmark`    | Bookmark mask                      | `--b3-theme-warning`  |
| `i`       | `- [i]`           | Information      | `icon-information` | Information glyph on a filled tile | `--b3-theme-primary`  |
| `S`       | `- [S]`           | Savings          | `icon-savings`     | Dollar glyph on a filled tile      | `--b3-theme-success`  |
| `I`       | `- [I]`           | Idea             | `icon-idea`        | Lightbulb mask                     | `--b3-theme-warning`  |
| `p`       | `- [p]`           | Pros             | `icon-pros`        | Thumbs-up mask                     | `--b3-theme-success`  |
| `c`       | `- [c]`           | Cons             | `icon-cons`        | Thumbs-down mask                   | `--b3-theme-warning`  |
| `f`       | `- [f]`           | Fire             | `icon-fire`        | Flame mask                         | `--b3-theme-error`    |
| `k`       | `- [k]`           | Key              | `icon-key`         | Key mask                           | `--b3-theme-warning`  |
| `w`       | `- [w]`           | Win              | `icon-win`         | Win/trophy mask                    | `--b3-theme-primary`  |
| `u`       | `- [u]`           | Up               | `icon-up`          | Upward-trend mask                  | `--b3-theme-success`  |
| `d`       | `- [d]`           | Down             | `icon-down`        | Downward-trend mask                | `--b3-theme-error`    |

## Source

The icon geometry is adapted from Minimal for Obsidian:

- [Minimal `checklist-icons.scss`](https://github.com/kepano/obsidian-minimal/blob/master/src/scss/features/checklist-icons.scss)
- [Minimal MIT license](https://github.com/kepano/obsidian-minimal/blob/master/LICENSE)

Unknown markers are not mapped and retain SiYuan's native task presentation.
