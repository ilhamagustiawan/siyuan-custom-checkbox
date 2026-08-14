import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {fileURLToPath} from "node:url";

const stylesheetPath = fileURLToPath(new URL("../dist/index.css", import.meta.url));
const scssPath = fileURLToPath(new URL("../src/index.scss", import.meta.url));
const taskStylesPath = fileURLToPath(new URL("../src/libs/task-styles.ts", import.meta.url));
const taskIconsPath = fileURLToPath(new URL("../src/libs/task-icons.ts", import.meta.url));

async function readStylesheet() {
    return readFile(stylesheetPath, "utf8");
}

test("custom task styles are shared instead of marker-specific CSS", async () => {
    const stylesheet = await readStylesheet();

    assert.match(stylesheet, /\.siyuan-custom-checkbox-action/);
    assert.match(stylesheet, /\.siyuan-custom-checkbox-action>svg\{display:none\s*!important\}/);
    assert.match(stylesheet, /background-color:var\(--siyuan-custom-checkbox/);
    assert.match(stylesheet, /visibility:visible\s*!important/);
    assert.doesNotMatch(stylesheet, /data-task=/);
    assert.doesNotMatch(stylesheet, /data:image\/svg\+xml/);
});

test("visual marker mappings live in TypeScript registries", async () => {
    const [scss, taskStyles, taskIcons] = await Promise.all([
        readFile(scssPath, "utf8"),
        readFile(taskStylesPath, "utf8"),
        readFile(taskIconsPath, "utf8"),
    ]);

    assert.doesNotMatch(scss, /\$icon-library|\$marker-styles/);
    assert.doesNotMatch(scss, /data:image\/svg\+xml/);
    assert.match(taskStyles, /TASK_STYLES/);
    assert.match(taskStyles, /getTaskStyle/);
    assert.match(taskIcons, /TASK_ICONS/);
});

test("custom task text uses the editor text color", async () => {
    const stylesheet = await readStylesheet();

    assert.match(
        stylesheet,
        /\.siyuan-custom-checkbox-task>\[data-node-id\]\.p\{[^}]*color:inherit\s*!important/,
    );
});

test("native completed markers keep SiYuan's completion styling", async () => {
    const stylesheet = await readStylesheet();

    assert.equal(
        stylesheet.includes("[data-task=x].protyle-task--done>[data-node-id].p"),
        false,
    );
    assert.equal(
        stylesheet.includes("[data-task=X].protyle-task--done>[data-node-id].p"),
        false,
    );
});
