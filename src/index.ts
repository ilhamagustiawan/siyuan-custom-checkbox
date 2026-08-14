import {
    Plugin,
    showMessage,
} from "siyuan";
import {
    createCheckboxController,
    type CheckboxController,
} from "./checkbox";
import {
    createSettings,
    normalizeSettings,
    SETTINGS_STORAGE_NAME,
} from "./settings";
import "./index.scss";

export default class CustomCheckboxPlugin extends Plugin {
    private controller: CheckboxController | undefined;

    async onload(): Promise<void> {
        let savedConfig: unknown;
        try {
            savedConfig = await this.loadData(SETTINGS_STORAGE_NAME);
        } catch (error) {
            const detail = error instanceof Error && error.message ? `: ${error.message}` : "";
            const message = this.i18n["settingsLoadError"] ||
                "Unable to load task status settings; using defaults${message}";
            showMessage(message.replace("${message}", detail), 6000, "error");
        }
        const settings = normalizeSettings(savedConfig);
        this.controller = createCheckboxController(settings, this.i18n, this.eventBus);
        this.controller.start();
        this.addCommand({
            langKey: "taskStatusCommand",
            editorCallback: (protyle) => {
                this.controller?.openStatusMenuAtSelection(protyle.wysiwyg.element);
            },
        });
        this.setting = createSettings(this, settings, (nextSettings) => {
            this.controller?.setSettings(nextSettings);
        });
    }

    onunload(): void {
        this.controller?.stop();
        this.controller = undefined;
    }
}
