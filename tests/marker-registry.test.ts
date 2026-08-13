import {
    describe,
    expect,
    it,
} from "vitest";

import {
    DEFAULT_STATUS_CYCLE,
    MARKER_REGISTRY,
    NATIVE_TASK_MARKERS,
    SUPPORTED_MARKERS,
    getNextMarker,
    isNativeTaskMarker,
    isSupportedMarker,
    isValidStatusCycle,
    parseTaskMarker,
} from "../src/marker-registry";

describe("marker registry", () => {
    it("contains every requested marker exactly once", () => {
        const expectedMarkers = [
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
        ];

        expect([...SUPPORTED_MARKERS]).toEqual(expectedMarkers);
        expect(new Set(SUPPORTED_MARKERS).size).toBe(expectedMarkers.length);

        for (const marker of SUPPORTED_MARKERS) {
            const definition = MARKER_REGISTRY[marker];
            expect(definition.marker).toBe(marker);
            expect(definition.label.length).toBeGreaterThan(0);
            expect(definition.ariaLabel.length).toBeGreaterThan(0);
            expect(definition.icon.length).toBeGreaterThan(0);
            expect(definition.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(isSupportedMarker(definition.next)).toBe(true);
        }

        expect(new Set(SUPPORTED_MARKERS.map((marker) => MARKER_REGISTRY[marker].icon)).size)
            .toBe(expectedMarkers.length);
        expect(new Set(SUPPORTED_MARKERS.map((marker) => MARKER_REGISTRY[marker].color)).size)
            .toBe(expectedMarkers.length);
    });

    it("follows the registry's next-status links in the default cycle", () => {
        expect([...DEFAULT_STATUS_CYCLE]).toEqual([...SUPPORTED_MARKERS]);

        for (const [index, marker] of SUPPORTED_MARKERS.entries()) {
            const expectedNext = SUPPORTED_MARKERS[(index + 1) % SUPPORTED_MARKERS.length];
            expect(MARKER_REGISTRY[marker].next).toBe(expectedNext);
            expect(getNextMarker(marker)).toBe(expectedNext);
        }
    });

    it("validates and cycles custom status orders", () => {
        const cycle = [" ", "/", "x"] as const;

        expect(isValidStatusCycle(cycle)).toBe(true);
        expect(getNextMarker(" ", cycle)).toBe("/");
        expect(getNextMarker("/", cycle)).toBe("x");
        expect(getNextMarker("x", cycle)).toBe(" ");
        expect(getNextMarker("?", cycle)).toBeUndefined();
        expect(isValidStatusCycle([])).toBe(false);
        expect(isValidStatusCycle([" ", "/", "/"])).toBe(false);
        expect(isValidStatusCycle([" ", "unknown"])).toBe(false);
    });

    it("parses supported markers into status metadata", () => {
        const parsed = parseTaskMarker("/");

        expect(parsed.kind).toBe("supported");
        if (parsed.kind !== "supported") {
            return;
        }

        expect(parsed.marker).toBe("/");
        expect(parsed.definition).toBe(MARKER_REGISTRY["/"]);
    });

    it("keeps native checked markers as native fallbacks", () => {
        expect([...NATIVE_TASK_MARKERS]).toEqual([" ", "X"]);
        expect(isNativeTaskMarker(" ")).toBe(true);
        expect(isNativeTaskMarker("X")).toBe(true);
        expect(parseTaskMarker("X")).toEqual({kind: "native", marker: "X"});
    });

    it("keeps unknown and malformed markers representable", () => {
        expect(parseTaskMarker("~")).toEqual({kind: "unknown", marker: "~"});
        expect(parseTaskMarker("xx")).toEqual({kind: "unknown", marker: "xx"});
        expect(parseTaskMarker(null)).toEqual({kind: "unknown", marker: ""});
    });
});
