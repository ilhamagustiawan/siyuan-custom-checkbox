import {
    isSupportedMarker,
    type SupportedMarker,
} from "./marker-registry";
import type {TaskIconName} from "./task-icons";

export type TaskStyleMode = "mask" | "background" | "split";

export interface TaskStyle {
    readonly color: string;
    readonly mode: TaskStyleMode;
    readonly icon?: TaskIconName;
    readonly backgroundSize?: string;
    readonly transform?: string;
}

export const TASK_COLORS = Object.freeze(
    {
        primary: "var(--b3-theme-primary, var(--b3-theme-on-surface))",
        secondary: "var(--b3-font-secondary, var(--b3-theme-on-surface))",
        warning: "var(--b3-theme-warning, var(--b3-theme-primary, var(--b3-theme-on-surface)))",
        error: "var(--b3-theme-error, var(--b3-theme-primary, var(--b3-theme-on-surface)))",
        success: "var(--b3-theme-success, var(--b3-theme-primary, var(--b3-theme-on-surface)))",
    } as const,
);

type CustomMarker = Exclude<SupportedMarker, " " | "x">;

export const TASK_STYLES: Readonly<Record<CustomMarker, TaskStyle>> = Object.freeze({
    ">": {color: TASK_COLORS.secondary, icon: "forwarded", mode: "mask", transform: "rotate(90deg)"},
    "<": {color: TASK_COLORS.secondary, icon: "schedule", mode: "mask"},
    "?": {color: TASK_COLORS.warning, icon: "question", mode: "background", backgroundSize: "100% 100%"},
    "/": {color: "currentColor", mode: "split"},
    "!": {color: TASK_COLORS.warning, icon: "important", mode: "mask"},
    "-": {color: TASK_COLORS.secondary, icon: "canceled", mode: "mask"},
    "*": {color: TASK_COLORS.warning, icon: "star", mode: "mask"},
    l: {color: TASK_COLORS.error, icon: "location", mode: "mask"},
    i: {color: TASK_COLORS.primary, icon: "information", mode: "background", backgroundSize: "100%"},
    S: {color: TASK_COLORS.success, icon: "savings", mode: "background", backgroundSize: "100%"},
    I: {color: TASK_COLORS.warning, icon: "idea", mode: "mask"},
    f: {color: TASK_COLORS.error, icon: "fire", mode: "mask"},
    k: {color: TASK_COLORS.warning, icon: "key", mode: "mask"},
    u: {color: TASK_COLORS.success, icon: "up", mode: "mask"},
    d: {color: TASK_COLORS.error, icon: "down", mode: "mask"},
    w: {color: TASK_COLORS.primary, icon: "win", mode: "mask"},
    p: {color: TASK_COLORS.success, icon: "pros", mode: "mask"},
    c: {color: TASK_COLORS.warning, icon: "cons", mode: "mask"},
    b: {color: TASK_COLORS.warning, icon: "bookmark", mode: "mask"},
    '"': {color: TASK_COLORS.primary, icon: "quote", mode: "background", backgroundSize: "75%"},
});

const QUOTE_MARKER = '"';
const CURLY_QUOTE_MARKER = "“";

function isCustomStyleMarker(marker: SupportedMarker): marker is CustomMarker {
    return marker !== " " && marker !== "x";
}
export function getTaskStyle(marker: string): TaskStyle | undefined {
    const canonicalMarker = marker === CURLY_QUOTE_MARKER ? QUOTE_MARKER : marker;
    if (!isSupportedMarker(canonicalMarker) || !isCustomStyleMarker(canonicalMarker)) {
        return undefined;
    }
    return TASK_STYLES[canonicalMarker];
}
