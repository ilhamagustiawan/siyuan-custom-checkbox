export interface TaskMarkerUpdate {
    readonly id: string;
    readonly marker: string;
}

export interface TaskMarkerResponse<T = unknown> {
    readonly code: number;
    readonly msg?: string;
    readonly data?: T;
}

export type TaskMarkerRequest = TaskMarkerUpdate | {
    readonly items: readonly TaskMarkerUpdate[];
};

export type TaskMarkerPost = typeof import("siyuan").fetchPost;

export interface TaskMarkerApi {
    updateTaskListItemMarker(update: TaskMarkerUpdate): Promise<TaskMarkerResponse>;
    batchUpdateTaskListItemMarker(updates: readonly TaskMarkerUpdate[]): Promise<TaskMarkerResponse>;
}
