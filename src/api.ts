import {assertValidTaskMarker} from "./libs/marker-registry";
import type {
    TaskMarkerApi,
    TaskMarkerPost,
    TaskMarkerRequest,
    TaskMarkerResponse,
    TaskMarkerUpdate,
} from "./types/api";
export type {
    TaskMarkerApi,
    TaskMarkerPost,
    TaskMarkerRequest,
    TaskMarkerResponse,
    TaskMarkerUpdate,
} from "./types/api";

export const TASK_MARKER_ENDPOINTS = {
    update: "/api/block/updateTaskListItemMarker",
    batchUpdate: "/api/block/batchUpdateTaskListItemMarker",
} as const;

export class TaskMarkerApiError extends Error {
    readonly code?: number;
    readonly response?: TaskMarkerResponse;

    constructor(message: string, response?: TaskMarkerResponse) {
        super(message);
        this.name = "TaskMarkerApiError";
        this.code = response?.code;
        this.response = response;
    }
}

export function createTaskMarkerApi(post: TaskMarkerPost): TaskMarkerApi {
    return {
        updateTaskListItemMarker(update) {
            try {
                validateUpdate(update);
                return callEndpoint(
                    TASK_MARKER_ENDPOINTS.update,
                    update,
                    post,
                );
            } catch (error) {
                return Promise.reject(error);
            }
        },
        batchUpdateTaskListItemMarker(updates) {
            try {
                validateUpdates(updates);
                return callEndpoint(
                    TASK_MARKER_ENDPOINTS.batchUpdate,
                    {items: updates},
                    post,
                );
            } catch (error) {
                return Promise.reject(error);
            }
        },
    };
}

function validateUpdates(updates: readonly TaskMarkerUpdate[]): void {
    if (!Array.isArray(updates)) {
        throw new TypeError("task marker updates must be an array");
    }
    updates.forEach(validateUpdate);
}

function validateUpdate(update: TaskMarkerUpdate): void {
    if (!update || typeof update.id !== "string" || update.id.length === 0) {
        throw new TypeError("task block id is required");
    }
    if (typeof update.marker !== "string") {
        throw new TypeError("task marker must be a string");
    }
    assertValidTaskMarker(update.marker);
}

function callEndpoint(
    url: string,
    request: TaskMarkerRequest,
    post: TaskMarkerPost,
): Promise<TaskMarkerResponse> {
    return new Promise((resolve, reject) => {
        let settled = false;

        const resolveResponse = (value: unknown): void => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                const response = parseResponse(value);
                if (response.code !== 0) {
                    throw new TaskMarkerApiError(response.msg || "SiYuan rejected the task marker update", response);
                }
                resolve(response);
            } catch (error) {
                reject(error);
            }
        };

        const rejectResponse = (value: unknown): void => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                const response = parseResponse(value);
                reject(new TaskMarkerApiError(response.msg || "Task marker request failed", response));
            } catch (error) {
                reject(error);
            }
        };

        try {
            post(url, request, resolveResponse, undefined, rejectResponse);
        } catch (error) {
            if (!settled) {
                settled = true;
                reject(error);
            }
        }
    });
}

function parseResponse(value: unknown): TaskMarkerResponse {
    if (typeof value !== "object" || value === null || typeof (value as {code?: unknown;}).code !== "number") {
        throw new TaskMarkerApiError("SiYuan returned a malformed task marker response");
    }

    const response = value as {code: number; msg?: unknown; data?: unknown;};
    return {
        code: response.code,
        msg: typeof response.msg === "string" ? response.msg : undefined,
        data: response.data,
    };
}
