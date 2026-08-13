import {
    MARKER_REGISTRY,
    type SupportedMarker,
} from "./marker-registry";

export const STATUS_LABEL_KEYS: Readonly<Record<SupportedMarker, string>> = Object.freeze({
    " ": "statusTodo",
    "/": "statusInProgress",
    x: "statusDone",
    "-": "statusCanceled",
    ">": "statusForwarded",
    "<": "statusScheduled",
    "?": "statusQuestion",
    "!": "statusImportant",
    "*": "statusStarred",
    '"': "statusQuoted",
    l: "statusLocation",
    b: "statusBookmark",
    i: "statusInformation",
    S: "statusSavings",
    I: "statusIdea",
    p: "statusPros",
    c: "statusCons",
    f: "statusFire",
    k: "statusKey",
    w: "statusWin",
    u: "statusUp",
    d: "statusDown",
});

export function getStatusLabel(marker: SupportedMarker, i18n: Record<string, string>): string {
    return i18n[STATUS_LABEL_KEYS[marker]] || MARKER_REGISTRY[marker].label;
}
