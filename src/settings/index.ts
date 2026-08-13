import {
    showMessage,
    Setting,
    type Plugin,
} from "siyuan";
import {
    isSupportedMarker,
    SUPPORTED_MARKERS,
    type SupportedMarker,
} from "../libs/marker-registry";
import {getStatusLabel} from "../libs/status-labels";

export const SETTINGS_STORAGE_NAME = "checkbox-config";

export interface CheckboxSettings {
    readonly enabledMarkers: readonly SupportedMarker[];
}

type SettingsHost = Pick<Plugin, "i18n" | "saveData">;
type SettingsChange = (settings: CheckboxSettings) => void;

function getText(i18n: Record<string, string>, key: string, fallback: string): string {
    return i18n[key] || fallback;
}

export function normalizeSettings(value: unknown): CheckboxSettings {
    if (
        typeof value !== "object" || value === null ||
        !Array.isArray((value as {enabledMarkers?: unknown;}).enabledMarkers)
    ) {
        return {enabledMarkers: [...SUPPORTED_MARKERS]};
    }

    const enabled = new Set<SupportedMarker>();
    for (const marker of (value as {enabledMarkers: unknown[];}).enabledMarkers) {
        if (typeof marker === "string" && isSupportedMarker(marker)) {
            enabled.add(marker);
        }
    }
    return {enabledMarkers: SUPPORTED_MARKERS.filter((marker) => enabled.has(marker))};
}

export function createSettings(
    host: SettingsHost,
    initialSettings: CheckboxSettings,
    onChange: SettingsChange,
): Setting {
    let currentSettings = normalizeSettings(initialSettings);

    const persist = (): void => {
        void host.saveData(SETTINGS_STORAGE_NAME, currentSettings).catch((error: unknown): void => {
            const detail = error instanceof Error && error.message ? `: ${error.message}` : "";
            const template = getText(
                host.i18n,
                "settingsSaveError",
                "Unable to save task status settings${message}",
            );
            showMessage(template.replace("${message}", detail), 6000, "error");
        });
    };

    const setting = new Setting({confirmCallback: persist});
    const description = document.createElement("div");
    description.className = "b3-label";
    description.textContent = getText(
        host.i18n,
        "settingsStatusDescription",
        "Choose which statuses appear in the status picker.",
    );
    setting.addItem({
        title: getText(host.i18n, "settingsStatusTitle", "Task statuses"),
        direction: "column",
        actionElement: description,
    });

    for (const marker of SUPPORTED_MARKERS) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "b3-switch";
        input.checked = currentSettings.enabledMarkers.indexOf(marker) !== -1;
        const label = getStatusLabel(marker, host.i18n);
        input.setAttribute("aria-label", label);
        input.addEventListener("change", () => {
            const enabledMarkers = SUPPORTED_MARKERS.filter((item) =>
                item === marker ? input.checked : currentSettings.enabledMarkers.indexOf(item) !== -1
            );
            currentSettings = {enabledMarkers};
            onChange(currentSettings);
            persist();
        });
        setting.addItem({
            title: label,
            description: getText(host.i18n, "settingsStatusEnabled", "Show in status picker"),
            direction: "row",
            actionElement: input,
        });
    }

    return setting;
}
