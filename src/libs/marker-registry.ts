export const SUPPORTED_MARKERS = [
    " ",
    "/",
    "x",
    "-",
    ">",
    "<",
    "?",
    "!",
    "*",
    '"',
    "l",
    "b",
    "i",
    "S",
    "I",
    "p",
    "c",
    "f",
    "k",
    "w",
    "u",
    "d",
] as const;

export type SupportedMarker = typeof SUPPORTED_MARKERS[number];

/**
 * SiYuan's native task-list markers. The space marker is also registered as
 * the plugin's default status so it can be configured and rendered explicitly.
 */
export const NATIVE_TASK_MARKERS = [" ", "X"] as const;

export type NativeTaskMarker = typeof NATIVE_TASK_MARKERS[number];

export interface MarkerDefinition {
    readonly marker: SupportedMarker;
    readonly label: string;
    readonly icon: string;
    readonly color: string;
    readonly next: SupportedMarker;
    readonly ariaLabel: string;
}

export const MARKER_REGISTRY: Readonly<Record<SupportedMarker, MarkerDefinition>> = Object.freeze({
    " ": {
        marker: " ",
        label: "Todo",
        icon: "status-unchecked",
        color: "#64748b",
        next: "/",
        ariaLabel: "Task status: todo",
    },
    "/": {
        marker: "/",
        label: "In progress",
        icon: "status-in-progress",
        color: "#f59e0b",
        next: "x",
        ariaLabel: "Task status: in progress",
    },
    x: {
        marker: "x",
        label: "Done",
        icon: "status-complete",
        color: "#16a34a",
        next: "-",
        ariaLabel: "Task status: done",
    },
    "-": {
        marker: "-",
        label: "Canceled",
        icon: "status-canceled",
        color: "#6b7280",
        next: ">",
        ariaLabel: "Task status: canceled",
    },
    ">": {
        marker: ">",
        label: "Forwarded",
        icon: "status-forwarded",
        color: "#475569",
        next: "<",
        ariaLabel: "Task status: forwarded",
    },
    "<": {
        marker: "<",
        label: "Scheduled",
        icon: "status-scheduled",
        color: "#94a3b8",
        next: "?",
        ariaLabel: "Task status: scheduled",
    },
    "?": {
        marker: "?",
        label: "Question",
        icon: "status-question",
        color: "#a855f7",
        next: "!",
        ariaLabel: "Task status: question",
    },
    "!": {
        marker: "!",
        label: "Important",
        icon: "status-important",
        color: "#dc2626",
        next: "*",
        ariaLabel: "Task status: important",
    },
    "*": {
        marker: "*",
        label: "Starred",
        icon: "status-star",
        color: "#eab308",
        next: '"',
        ariaLabel: "Task status: starred",
    },
    '"': {
        marker: '"',
        label: "Quoted",
        icon: "status-quote",
        color: "#ec4899",
        next: "l",
        ariaLabel: "Task status: quoted",
    },
    l: {
        marker: "l",
        label: "Location",
        icon: "status-location",
        color: "#be123c",
        next: "b",
        ariaLabel: "Task status: location",
    },
    b: {
        marker: "b",
        label: "Bookmark",
        icon: "status-bookmark",
        color: "#d97706",
        next: "i",
        ariaLabel: "Task status: bookmark",
    },
    i: {
        marker: "i",
        label: "Information",
        icon: "status-information",
        color: "#2563eb",
        next: "S",
        ariaLabel: "Task status: information",
    },
    S: {
        marker: "S",
        label: "Savings",
        icon: "status-savings",
        color: "#0f766e",
        next: "I",
        ariaLabel: "Task status: savings",
    },
    I: {
        marker: "I",
        label: "Idea",
        icon: "status-idea",
        color: "#f97316",
        next: "p",
        ariaLabel: "Task status: idea",
    },
    p: {
        marker: "p",
        label: "Pros",
        icon: "status-pros",
        color: "#22c55e",
        next: "c",
        ariaLabel: "Task status: pros",
    },
    c: {
        marker: "c",
        label: "Cons",
        icon: "status-cons",
        color: "#ca8a04",
        next: "f",
        ariaLabel: "Task status: cons",
    },
    f: {
        marker: "f",
        label: "Fire",
        icon: "status-fire",
        color: "#f43f5e",
        next: "k",
        ariaLabel: "Task status: fire",
    },
    k: {
        marker: "k",
        label: "Key",
        icon: "status-key",
        color: "#7c3aed",
        next: "w",
        ariaLabel: "Task status: key",
    },
    w: {
        marker: "w",
        label: "Win",
        icon: "status-win",
        color: "#0891b2",
        next: "u",
        ariaLabel: "Task status: win",
    },
    u: {
        marker: "u",
        label: "Up",
        icon: "status-up",
        color: "#65a30d",
        next: "d",
        ariaLabel: "Task status: up",
    },
    d: {
        marker: "d",
        label: "Down",
        icon: "status-down",
        color: "#b91c1c",
        next: " ",
        ariaLabel: "Task status: down",
    },
});

export const DEFAULT_STATUS_CYCLE: readonly SupportedMarker[] = SUPPORTED_MARKERS;

export function isSupportedMarker(marker: string): marker is SupportedMarker {
    return SUPPORTED_MARKERS.indexOf(marker as SupportedMarker) !== -1;
}

export function isNativeTaskMarker(marker: string): marker is NativeTaskMarker {
    return NATIVE_TASK_MARKERS.indexOf(marker as NativeTaskMarker) !== -1;
}

/**
 * SiYuan validates task markers as one-byte values and reserves square
 * brackets for the task-list syntax itself.
 */
export function isValidTaskMarker(marker: string): boolean {
    return marker.length === 1 && marker.charCodeAt(0) <= 0x7f && marker !== "[" && marker !== "]";
}

export function assertValidTaskMarker(marker: string): void {
    if (!isValidTaskMarker(marker)) {
        throw new TypeError("task marker must be a one-byte marker other than [ or ]");
    }
}

export function isValidStatusCycle(cycle: readonly string[]): cycle is readonly SupportedMarker[] {
    if (cycle.length === 0) {
        return false;
    }

    const seen = new Set<string>();
    for (const marker of cycle) {
        if (!isSupportedMarker(marker) || seen.has(marker)) {
            return false;
        }
        seen.add(marker);
    }
    return true;
}

export function getNextMarker(
    marker: string,
    cycle: readonly SupportedMarker[] = DEFAULT_STATUS_CYCLE,
): SupportedMarker | undefined {
    if (!isValidStatusCycle(cycle)) {
        return undefined;
    }

    const index = cycle.indexOf(marker as SupportedMarker);
    if (index === -1) {
        return undefined;
    }
    return cycle[(index + 1) % cycle.length];
}

export type ParsedTaskMarker =
    | {
        readonly kind: "supported";
        readonly marker: SupportedMarker;
        readonly definition: MarkerDefinition;
    }
    | {
        readonly kind: "native";
        readonly marker: NativeTaskMarker;
    }
    | {
        readonly kind: "unknown";
        readonly marker: string;
    };

export function parseTaskMarker(marker: string | null | undefined): ParsedTaskMarker {
    const value = marker ?? "";
    const definition = isSupportedMarker(value) ? MARKER_REGISTRY[value] : undefined;
    if (definition) {
        return {
            kind: "supported",
            marker: value as SupportedMarker,
            definition,
        };
    }
    if (isNativeTaskMarker(value)) {
        return {
            kind: "native",
            marker: value,
        };
    }
    return {
        kind: "unknown",
        marker: value,
    };
}
