import {
    isSupportedMarker,
    type SupportedMarker,
} from "../libs/marker-registry";
import {getStatusLabel} from "../libs/status-labels";

export const CUSTOM_CHECKBOX_CLASS = "siyuan-custom-checkbox";
export const CUSTOM_CHECKBOX_ACTION_CLASS = "siyuan-custom-checkbox-action";

const CUSTOM_MARKER_ALIAS = "“";
const QUOTE_MARKER = '"';
const UNCHECKED_MARKER = " ";
const DONE_MARKERS = new Set(["x", "X"]);
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const ACTION_ATTRIBUTES = [
    "data-siyuan-custom-checkbox",
    "role",
    "aria-checked",
    "aria-label",
    "tabindex",
];
const originalActionAttributes = new WeakMap<Element, Map<string, string | null>>();

function getDirectChild(element: Element, selector: string): Element | undefined {
    return Array.from(element.children).find((child) => child.matches(selector));
}

function getNativeSvg(action: Element): SVGElement | undefined {
    return getDirectChild(action, "svg") as SVGElement | undefined;
}

function setNativeIcon(action: Element, marker: string | null): void {
    if (marker === null) {
        return;
    }

    let svg = getNativeSvg(action);
    if (!svg) {
        svg = action.ownerDocument.createElementNS(SVG_NAMESPACE, "svg");
        action.appendChild(svg);
    }

    let use = getDirectChild(svg, "use") as SVGUseElement | undefined;
    if (!use) {
        use = action.ownerDocument.createElementNS(SVG_NAMESPACE, "use");
        svg.appendChild(use);
    }

    const icon = marker === UNCHECKED_MARKER ? "#iconUncheck" : "#iconCheck";
    const xlinkHref = use.getAttribute("xlink:href");
    const href = use.getAttribute("href");
    if (xlinkHref === icon && (href === null || href === icon)) {
        return;
    }
    use.setAttribute("xlink:href", icon);
    if (href !== null) {
        use.setAttribute("href", icon);
    }
}

function getCanonicalMarker(marker: string): SupportedMarker | undefined {
    const canonicalMarker = marker === CUSTOM_MARKER_ALIAS ? QUOTE_MARKER : marker;
    return isSupportedMarker(canonicalMarker) ? canonicalMarker : undefined;
}

export function isCustomMarker(marker: string | null): boolean {
    if (marker === CUSTOM_MARKER_ALIAS) {
        return true;
    }

    const canonicalMarker = marker === null ? undefined : getCanonicalMarker(marker);
    return canonicalMarker !== undefined &&
        canonicalMarker !== UNCHECKED_MARKER &&
        !DONE_MARKERS.has(canonicalMarker);
}
function isManagedMarker(marker: string | null): boolean {
    return marker !== null && (
        marker === UNCHECKED_MARKER ||
        DONE_MARKERS.has(marker) ||
        isCustomMarker(marker)
    );
}

function getCheckboxLabel(marker: string, i18n: Record<string, string>): string {
    const canonicalMarker = getCanonicalMarker(marker);
    if (!canonicalMarker) {
        return getStatusLabel(QUOTE_MARKER, i18n);
    }
    return getStatusLabel(canonicalMarker, i18n);
}

function rememberActionAttributes(action: Element): void {
    if (originalActionAttributes.has(action)) {
        return;
    }
    const attributes = new Map<string, string | null>();
    const hasPluginState = action.classList.contains(CUSTOM_CHECKBOX_ACTION_CLASS) ||
        action.getAttribute("data-siyuan-custom-checkbox") === "true";
    ACTION_ATTRIBUTES.forEach((name) => {
        attributes.set(name, hasPluginState ? null : action.getAttribute(name));
    });
    originalActionAttributes.set(action, attributes);
}
function restoreActionAttributes(action: Element): void {
    const attributes = originalActionAttributes.get(action);
    if (!attributes) {
        ACTION_ATTRIBUTES.forEach((name) => action.removeAttribute(name));
        return;
    }
    attributes.forEach((value, name) => {
        if (value === null) {
            action.removeAttribute(name);
        } else {
            action.setAttribute(name, value);
        }
    });
    originalActionAttributes.delete(action);
}
function ensureCheckboxElement(action: Element, marker: string): HTMLElement {
    const existing = getDirectChild(action, `.${CUSTOM_CHECKBOX_CLASS}`) as HTMLElement | undefined;
    const checkbox = existing || action.ownerDocument.createElement("span");
    checkbox.className = CUSTOM_CHECKBOX_CLASS;
    checkbox.setAttribute("data-marker", marker);
    checkbox.setAttribute("contenteditable", "false");
    checkbox.setAttribute("aria-hidden", "true");
    checkbox.textContent = "";

    if (!existing) {
        const nativeSvg = getNativeSvg(action);
        action.insertBefore(checkbox, nativeSvg ?? null);
    }

    return checkbox;
}

export function reconcileTaskCheckbox(
    taskItem: Element,
    action: Element | undefined,
    i18n: Record<string, string>,
): void {
    const marker = taskItem.getAttribute("data-task");
    if (!action) {
        return;
    }

    if (!isCustomMarker(marker)) {
        const wasCustom = restoreTaskCheckbox(action);
        if (wasCustom && isManagedMarker(marker)) {
            setNativeIcon(action, marker);
        }
        return;
    }

    const checkbox = ensureCheckboxElement(action, marker);
    rememberActionAttributes(action);
    action.classList.add(CUSTOM_CHECKBOX_ACTION_CLASS);
    action.setAttribute("data-siyuan-custom-checkbox", "true");
    action.setAttribute("role", "checkbox");
    action.setAttribute("aria-checked", "false");
    action.setAttribute("aria-label", getCheckboxLabel(marker, i18n));
    action.setAttribute("tabindex", "0");

    // Lute treats .protyle-action as presentation-only when serializing, so keep
    // the native SVG in place while making the plugin component the only visible
    // control for a custom marker.
    checkbox.setAttribute("data-visible", "true");
}

export function restoreTaskCheckbox(action?: Element): boolean {
    if (!action) {
        return false;
    }

    const checkbox = getDirectChild(action, `.${CUSTOM_CHECKBOX_CLASS}`);
    const wasCustom = action.classList.contains(CUSTOM_CHECKBOX_ACTION_CLASS) ||
        action.hasAttribute("data-siyuan-custom-checkbox") ||
        checkbox !== undefined;
    if (!wasCustom) {
        return false;
    }

    checkbox?.remove();
    restoreActionAttributes(action);
    action.classList.remove(CUSTOM_CHECKBOX_ACTION_CLASS);
    return true;
}

export function restoreTaskCheckboxes(root: ParentNode): void {
    const taskItems: Element[] = [];
    if (root instanceof Element && root.matches('[data-type="NodeListItem"][data-subtype="t"]')) {
        taskItems.push(root);
    }
    taskItems.push(...Array.from(root.querySelectorAll('[data-type="NodeListItem"][data-subtype="t"]')));
    taskItems.forEach((taskItem) => {
        const action = taskItem.querySelector(
            ":scope > .protyle-action--task, :scope > p > .protyle-action--task",
        ) ?? undefined;
        const wasCustom = restoreTaskCheckbox(action);
        if (wasCustom && isManagedMarker(taskItem.getAttribute("data-task"))) {
            setNativeIcon(action, taskItem.getAttribute("data-task"));
        }
    });
}
