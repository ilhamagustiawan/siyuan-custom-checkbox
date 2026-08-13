[English](README.md)

# 思源自定义复选框

一个为思源笔记增加自定义任务状态和 Minimal 风格图标的插件，同时保留思源原生任务列表块和任务标记。

## 功能

* 为自定义任务标记显示不同的图标和跟随主题的颜色。
* ``、`x`、`X` 保留思源原生的未完成和已完成复选框图标。
* 点击自定义状态的复选框会将任务重置为未完成。
* 桌面端右键点击任务图标打开状态菜单；移动端长按打开状态菜单。
* 命令面板中的 **选择任务状态** 命令可以为当前选中的任务打开菜单。
* 设置可以控制哪些状态显示在菜单中，修改后立即生效。
* 使用思源原生任务标记 API，不直接写入 `.sy` 文件，也不创建自定义块格式。
* 使用跨平台 DOM 行为，支持桌面端、移动端和浏览器端前端。

## 使用方法

1. 创建一个思源原生任务列表项。
2. 在桌面端右键点击复选框，或在触摸设备上长按复选框。
3. 在状态菜单中选择状态。
4. 需要将自定义状态重置为未完成时，直接点击复选框即可。

``、`x`、`X` 会保留思源的原生切换行为。未知标记不会被插件拦截，并继续使用思源原生显示。

打开 **设置 → 集市 → 已下载 → 思源自定义复选框**，可以控制状态是否显示在状态菜单中。设置会立即保存。

## 状态列表

第一行的空白标记表示一个 ASCII 空格（``）。

| 标记      | Markdown          | 状态          | 显示         | 颜色变量              |
| --------- | ----------------- | ------------- | ------------ | --------------------- |
| （空格）  | `- [ ]`           | 待办 / 未完成 | 思源原生图标 | 原生主题              |
| `x` / `X` | `- [x]`           | 已完成        | 思源原生图标 | 原生主题              |
| `/`       | `- [/]`           | 进行中        | 分割复选框   | `--b3-theme-primary`  |
| `-`       | `- [-]`           | 已取消        | 横线         | `--b3-font-secondary` |
| `>`       | `- [>]`           | 已转发        | 旋转的纸飞机 | `--b3-font-secondary` |
| `<`       | `- [<]`           | 已安排        | 日历         | `--b3-font-secondary` |
| `?`       | `- [?]`           | 疑问          | 问号色块     | `--b3-theme-warning`  |
| `!`       | `- [!]`           | 重要          | 警告三角形   | `--b3-theme-warning`  |
| `*`       | `- [*]`           | 已标星        | 星标         | `--b3-theme-warning`  |
| `"` / `“` | `- ["]` / `- [“]` | 引用          | 引号色块     | `--b3-theme-primary`  |
| `l`       | `- [l]`           | 位置          | 定位图钉     | `--b3-theme-error`    |
| `b`       | `- [b]`           | 书签          | 书签         | `--b3-theme-warning`  |
| `i`       | `- [i]`           | 信息          | 信息色块     | `--b3-theme-primary`  |
| `S`       | `- [S]`           | 储蓄          | 美元色块     | `--b3-theme-success`  |
| `I`       | `- [I]`           | 想法          | 灯泡         | `--b3-theme-warning`  |
| `p`       | `- [p]`           | 优点          | 赞           | `--b3-theme-success`  |
| `c`       | `- [c]`           | 缺点          | 踩           | `--b3-theme-warning`  |
| `f`       | `- [f]`           | 火焰          | 火焰         | `--b3-theme-error`    |
| `k`       | `- [k]`           | 关键          | 钥匙         | `--b3-theme-warning`  |
| `w`       | `- [w]`           | 胜利          | 奖杯         | `--b3-theme-primary`  |
| `u`       | `- [u]`           | 上升          | 上升趋势     | `--b3-theme-success`  |
| `d`       | `- [d]`           | 下降          | 下降趋势     | `--b3-theme-error`    |

ASCII 引号（`"`）是持久化时使用的规范标记。弯引号仅作为视觉兼容别名。未知标记不会被映射。

## 兼容性和持久化

状态仍然保存为思源原生的单字符任务标记。插件使用以下接口更新状态：

* `POST /api/block/updateTaskListItemMarker`
* `POST /api/block/batchUpdateTaskListItemMarker`

插件只增强所见即所得编辑器。导出和 PDF 渲染继续使用思源原生任务标记。

## 开发

要求：Node.js 24 或更高版本，以及 pnpm。

```bash
pnpm install
pnpm dev       # 监听构建到 dev/
pnpm build     # 生产构建并生成 package.zip
pnpm make-link # 将 dev/ 链接到思源插件目录
pnpm make-install # 构建并将 dist/ 复制到思源插件目录
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit
```

`pnpm make-link` 会检测正在运行的思源工作空间；如果 API 不可用，则回退使用 `SIYUAN_PLUGIN_DIR`。`pnpm make-install` 会构建插件，并将 `dist/` 复制到选定工作空间的插件目录。

## 许可证

本插件采用 MIT 许可证。复选框图标几何形状改编自 [Minimal for Obsidian](https://github.com/kepano/obsidian-minimal)，同样采用 MIT 许可证。
