import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createTaskMarkerApi,
    type TaskMarkerPost,
} from "../src/api";

interface RecordedRequest {
    url: string;
    data: unknown;
}

function createPost(
    response: unknown,
    requests: RecordedRequest[],
    failure = false,
): TaskMarkerPost {
    return (url, data, onSuccess, _headers, onFailure) => {
        requests.push({url, data});
        if (failure) {
            onFailure?.(response);
            return;
        }
        onSuccess(response);
    };
}

describe("task marker API", () => {
    it("uses the native contract for single marker updates", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: 0, data: "transaction"}, requests));

        const response = await api.updateTaskListItemMarker({id: "task-id", marker: "/"});

        expect(response.code).toBe(0);
        expect(requests).toEqual([{
            url: "/api/block/updateTaskListItemMarker",
            data: {id: "task-id", marker: "/"},
        }]);
    });

    it("wraps batch marker updates in the native items payload", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: 0, data: "transaction"}, requests));
        const updates = [
            {id: "task-a", marker: "/"},
            {id: "task-b", marker: "x"},
        ] as const;

        await api.batchUpdateTaskListItemMarker(updates);

        expect(requests).toEqual([{
            url: "/api/block/batchUpdateTaskListItemMarker",
            data: {items: updates},
        }]);
    });

    it("rejects kernel errors with the server message", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: -1, msg: "block is not a task"}, requests));

        await expect(api.updateTaskListItemMarker({id: "task-id", marker: "/"})).rejects.toMatchObject({
            name: "TaskMarkerApiError",
            message: "block is not a task",
        });
    });

    it("rejects transport failures", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: -1, msg: "request failed"}, requests, true));

        await expect(api.updateTaskListItemMarker({id: "task-id", marker: "/"})).rejects.toThrow("request failed");
    });

    it("rejects invalid IDs and forbidden markers before transport", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: 0}, requests));

        await expect(api.updateTaskListItemMarker({id: "", marker: "/"})).rejects.toThrow("block id is required");
        await expect(api.updateTaskListItemMarker({id: "task-id", marker: "["})).rejects.toThrow("one-byte marker");
        await expect(api.updateTaskListItemMarker({id: "task-id", marker: "xx"})).rejects.toThrow("one-byte marker");
        expect(requests).toEqual([]);
    });

    it("sends unknown one-byte markers to preserve source data", async () => {
        const requests: RecordedRequest[] = [];
        const api = createTaskMarkerApi(createPost({code: 0}, requests));

        await api.updateTaskListItemMarker({id: "task-id", marker: "~"});

        expect(requests[0].data).toEqual({id: "task-id", marker: "~"});
    });
});
