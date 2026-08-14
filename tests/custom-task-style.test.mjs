import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {fileURLToPath} from "node:url";

const stylesheetPath = fileURLToPath(new URL("../dist/index.css", import.meta.url));
const customMarkers = [
    ">",
    "<",
    "?",
    "/",
    "!",
    "-",
    "*",
    "l",
    "i",
    "S",
    "I",
    "f",
    "k",
    "u",
    "d",
    "w",
    "p",
    "c",
    "b",
    '"',
    "“",
];

function markerSelector(marker) {
    if (marker === '"') {
        return "[data-task='\"']";
    }
    if (marker === "“" || /^[a-zA-Z]$/.test(marker)) {
        return `[data-task=${marker}]`;
    }
    return `[data-task="${marker}"]`;
}

async function readStylesheet() {
    return readFile(stylesheetPath, "utf8");
}

for (const marker of customMarkers) {
    test(`alternate marker ${JSON.stringify(marker)} keeps task text unchecked`, async () => {
        const stylesheet = await readStylesheet();
        const selector = `${markerSelector(marker)}.protyle-task--done>[data-node-id].p`;
        const ruleStart = stylesheet.indexOf(selector);
        assert.notEqual(ruleStart, -1, `missing completion override for marker ${JSON.stringify(marker)}`);

        const ruleEnd = stylesheet.indexOf("}", ruleStart);
        assert.match(
            stylesheet.slice(ruleStart, ruleEnd),
            /text-decoration:none!important/,
            `marker ${JSON.stringify(marker)} should not inherit the completion strikethrough`,
        );
    });
}

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

test("alternate marker rules target component checkboxes", async () => {
    const stylesheet = await readStylesheet();
    for (const marker of customMarkers) {
        const selector = `${markerSelector(marker)}>.protyle-action--task>.siyuan-custom-checkbox`;
        assert.notEqual(stylesheet.indexOf(selector), -1, `missing component selector for ${JSON.stringify(marker)}`);
    }
    assert.match(stylesheet, /visibility:visible!important/);
    assert.doesNotMatch(stylesheet, /::before/);
});
