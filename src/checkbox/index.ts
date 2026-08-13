import {
    fetchPost,
    Menu,
    showMessage,
} from "siyuan";
import {createTaskMarkerApi} from "../api";
import {
    SUPPORTED_MARKERS,
    isSupportedMarker,
    type SupportedMarker,
} from "../libs/marker-registry";
import {getStatusLabel} from "../libs/status-labels";
import type {CheckboxSettings} from "../settings";

const TASK_ITEM_SELECTOR = '[data-type="NodeListItem"][data-subtype="t"]';
const TASK_ACTION_SELECTOR = ".protyle-action--task";
const TASK_ACTION_IN_ITEM_SELECTOR = `:scope > ${TASK_ACTION_SELECTOR}, :scope > p > ${TASK_ACTION_SELECTOR}`;
const UNCHECKED_MARKER = " ";
const NATIVE_MARKERS = new Set([" ", "x", "X"]);
const LONG_PRESS_MS = 500;
const SUPPRESS_CLICK_MS = 750;

interface TaskContext {
    readonly action: Element;
    readonly taskItem: Element;
}

interface MenuPosition {
    readonly x: number;
    readonly y: number;
}

export interface CheckboxController {
    start(): void;
    stop(): void;
    setSettings(settings: CheckboxSettings): void;
    openStatusMenuAtSelection(root?: Element): void;
}

function getTaskItem(target: EventTarget | null): Element | undefined {
    if (!(target instanceof Element)) {
        return undefined;
    }

    const taskItem = target.closest(TASK_ITEM_SELECTOR);
    if (!taskItem || !taskItem.closest(".protyle-wysiwyg")) {
        return undefined;
    }

    return taskItem;
}

function getTaskContext(target: EventTarget | null): TaskContext | undefined {
    if (!(target instanceof Element)) {
        return undefined;
    }

    const action = target.closest(TASK_ACTION_SELECTOR);
    const taskItem = action ? getTaskItem(action) : undefined;
    if (!action || !taskItem || getTaskAction(taskItem) !== action) {
        return undefined;
    }

    return {action, taskItem};
}

function getTaskAction(taskItem: Element): Element | undefined {
    return taskItem.querySelector(TASK_ACTION_IN_ITEM_SELECTOR) ?? undefined;
}

function getTaskContextAtSelection(root?: Element): TaskContext | undefined {
    const anchorNode = document.getSelection()?.anchorNode;
    const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    const taskItem = getTaskItem(anchorElement);
    if (!taskItem || (root && !root.contains(taskItem))) {
        return undefined;
    }

    const action = getTaskAction(taskItem);
    return action ? {action, taskItem} : undefined;
}

function getText(i18n: Record<string, string>, key: string, fallback: string): string {
    return i18n[key] || fallback;
}

function getErrorText(
    i18n: Record<string, string>,
    key: string,
    fallback: string,
    error: unknown,
): string {
    const detail = error instanceof Error && error.message ? `: ${error.message}` : "";
    return getText(i18n, key, fallback).replace("${message}", detail);
}

function isKnownMarker(marker: string | null): boolean {
    return marker !== null && (NATIVE_MARKERS.has(marker) || isSupportedMarker(marker));
}

function isCurrentTaskContext(taskItem: Element, action: Element, id: string): boolean {
    if (!taskItem.isConnected || !action.isConnected) {
        return false;
    }

    const context = getTaskContext(action);
    return context?.taskItem === taskItem &&
        taskItem.getAttribute("data-node-id") === id &&
        isKnownMarker(taskItem.getAttribute("data-task"));
}

function hasTouchIdentifier(touches: TouchList, identifier: number): boolean {
    for (let index = 0; index < touches.length; index += 1) {
        if (touches.item(index)?.identifier === identifier) {
            return true;
        }
    }
    return false;
}

export function createCheckboxController(
    initialSettings: CheckboxSettings,
    i18n: Record<string, string>,
): CheckboxController {
    const markerApi = createTaskMarkerApi(fetchPost);
    let settings = initialSettings;
    let activeMenu: Menu | undefined;
    let longPressTimer: number | undefined;
    let suppressClickTimer: number | undefined;
    let longPressAction: Element | undefined;
    let longPressTouchId: number | undefined;
    let suppressClickTarget: Element | undefined;
    let started = false;

    const clearLongPressTimer = (): void => {
        if (longPressTimer !== undefined) {
            window.clearTimeout(longPressTimer);
            longPressTimer = undefined;
        }
    };

    const clearSuppressClick = (): void => {
        if (suppressClickTimer !== undefined) {
            window.clearTimeout(suppressClickTimer);
            suppressClickTimer = undefined;
        }
        suppressClickTarget = undefined;
    };

    const updateMarker = (
        taskItem: Element,
        id: string,
        nextMarker: SupportedMarker,
        errorKey: string,
        fallbackError: string,
    ): void => {
        const previousMarker = taskItem.getAttribute("data-task");
        if (previousMarker === null) {
            return;
        }

        const normalizedPrevious = previousMarker === "X" ? "x" : previousMarker;
        if (normalizedPrevious === nextMarker) {
            return;
        }

        taskItem.setAttribute("data-task", nextMarker);
        const restoreOnError = (error: unknown): void => {
            if (taskItem.getAttribute("data-task") === nextMarker) {
                taskItem.setAttribute("data-task", previousMarker);
            }
            showMessage(getErrorText(i18n, errorKey, fallbackError, error), 6000, "error");
        };

        try {
            void markerApi.updateTaskListItemMarker({id, marker: nextMarker}).catch(restoreOnError);
        } catch (error) {
            restoreOnError(error);
        }
    };

    const openStatusMenu = (taskItem: Element, action: Element, position: MenuPosition): boolean => {
        const id = taskItem.getAttribute("data-node-id");
        if (!id || !isCurrentTaskContext(taskItem, action, id)) {
            return false;
        }

        activeMenu?.close();
        const currentMarker = taskItem.getAttribute("data-task");
        const normalizedCurrent = currentMarker === "X" ? "x" : currentMarker;
        const menu = new Menu("siyuan-custom-checkbox-status");
        menu.addItem({
            type: "readonly",
            label: getText(i18n, "taskStatusMenuTitle", "Task status"),
        });
        menu.addSeparator();

        const enabledMarkers = SUPPORTED_MARKERS.filter((marker) => settings.enabledMarkers.indexOf(marker) !== -1);
        if (enabledMarkers.length === 0) {
            menu.addItem({
                type: "readonly",
                label: getText(i18n, "taskStatusMenuNoOptions", "No statuses are enabled."),
            });
        } else {
            enabledMarkers.forEach((marker) => {
                menu.addItem({
                    label: getStatusLabel(marker, i18n),
                    current: normalizedCurrent === marker,
                    click: () => {
                        if (!isCurrentTaskContext(taskItem, action, id)) {
                            return;
                        }
                        updateMarker(
                            taskItem,
                            id,
                            marker,
                            "taskStatusUpdateError",
                            "Unable to update task status${message}",
                        );
                    },
                });
            });
        }

        activeMenu = menu;
        if (position.x === 0 && position.y === 0) {
            const rect = action.getBoundingClientRect();
            menu.open({x: rect.left, y: rect.bottom});
        } else {
            menu.open(position);
        }
        return true;
    };

    const openStatusMenuAtSelection = (root?: Element): void => {
        const context = getTaskContextAtSelection(root);
        const marker = context?.taskItem.getAttribute("data-task");
        if (
            !context || !isKnownMarker(marker) ||
            !context.taskItem.getAttribute("data-node-id")
        ) {
            showMessage(
                getText(
                    i18n,
                    "taskStatusCommandNoTask",
                    "Place the cursor in a task item first.",
                ),
                3000,
                "info",
            );
            return;
        }

        const rect = context.action.getBoundingClientRect();
        openStatusMenu(context.taskItem, context.action, {x: rect.left, y: rect.bottom});
    };
    const handleClick = (event: MouseEvent): void => {
        const context = getTaskContext(event.target);
        if (
            suppressClickTarget &&
            context?.action === suppressClickTarget &&
            isKnownMarker(context.taskItem.getAttribute("data-task"))
        ) {
            clearSuppressClick();
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (!context) {
            return;
        }

        const marker = context.taskItem.getAttribute("data-task");
        if (!isKnownMarker(marker) || NATIVE_MARKERS.has(marker)) {
            return;
        }

        const id = context.taskItem.getAttribute("data-node-id");
        if (!id) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        updateMarker(
            context.taskItem,
            id,
            UNCHECKED_MARKER,
            "taskStatusResetError",
            "Unable to reset task status${message}",
        );
    };

    const handleContextMenu = (event: MouseEvent): void => {
        const context = getTaskContext(event.target);
        const marker = context?.taskItem.getAttribute("data-task");
        const id = context?.taskItem.getAttribute("data-node-id");
        if (!context || !id || !isKnownMarker(marker)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        openStatusMenu(context.taskItem, context.action, {x: event.clientX, y: event.clientY});
    };

    const handleTouchStart = (event: TouchEvent): void => {
        if (event.touches.length !== 1) {
            if (!longPressAction) {
                clearLongPressTimer();
                longPressTouchId = undefined;
            }
            return;
        }

        const context = getTaskContext(event.target);
        const marker = context?.taskItem.getAttribute("data-task");
        const id = context?.taskItem.getAttribute("data-node-id");
        if (!context || !id || !isKnownMarker(marker)) {
            return;
        }

        clearLongPressTimer();
        longPressAction = undefined;
        const touch = event.touches[0];
        longPressTouchId = touch.identifier;
        longPressTimer = window.setTimeout(() => {
            longPressTimer = undefined;
            if (openStatusMenu(context.taskItem, context.action, {x: touch.clientX, y: touch.clientY})) {
                longPressAction = context.action;
            }
        }, LONG_PRESS_MS);
    };

    const handleTouchMove = (): void => {
        clearLongPressTimer();
    };

    const handleTouchEnd = (event: TouchEvent): void => {
        const touchId = longPressTouchId;
        if (touchId === undefined || !hasTouchIdentifier(event.changedTouches, touchId)) {
            return;
        }

        clearLongPressTimer();
        longPressTouchId = undefined;
        const action = longPressAction;
        longPressAction = undefined;
        if (!action) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        clearSuppressClick();
        suppressClickTarget = action;
        suppressClickTimer = window.setTimeout(() => {
            suppressClickTarget = undefined;
            suppressClickTimer = undefined;
        }, SUPPRESS_CLICK_MS);
    };

    const handleTouchCancel = (event: TouchEvent): void => {
        const touchId = longPressTouchId;
        if (touchId === undefined || !hasTouchIdentifier(event.changedTouches, touchId)) {
            return;
        }

        clearLongPressTimer();
        longPressTouchId = undefined;
        longPressAction = undefined;
    };

    return {
        setSettings(nextSettings: CheckboxSettings) {
            settings = nextSettings;
        },
        openStatusMenuAtSelection,
        start() {
            if (started) {
                return;
            }
            started = true;
            document.addEventListener("click", handleClick, true);
            document.addEventListener("contextmenu", handleContextMenu, true);
            document.addEventListener("touchstart", handleTouchStart, {capture: true, passive: true});
            document.addEventListener("touchmove", handleTouchMove, {capture: true, passive: true});
            document.addEventListener("touchend", handleTouchEnd, true);
            document.addEventListener("touchcancel", handleTouchCancel, true);
        },
        stop() {
            if (!started) {
                return;
            }
            started = false;
            clearLongPressTimer();
            clearSuppressClick();
            longPressAction = undefined;
            longPressTouchId = undefined;
            activeMenu?.close();
            activeMenu = undefined;
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("contextmenu", handleContextMenu, true);
            document.removeEventListener("touchstart", handleTouchStart, true);
            document.removeEventListener("touchmove", handleTouchMove, true);
            document.removeEventListener("touchend", handleTouchEnd, true);
            document.removeEventListener("touchcancel", handleTouchCancel, true);
        },
    };
}
