import { writable } from "svelte/store";

export type LLM_AI_ExplorerData = {
    response: {
        messageId: string,
        statusCode: string,
        inputTokens: number,
        outputTokens: number,
        totalTokens: number,
        time: number;
        // size: number;
    };
};

export const LLM_AI_ExplorerDataStore = writable<Map<string, LLM_AI_ExplorerData>>(
    new Map(),
);
