import { writable } from "svelte/store";

export type LLM_AI_ExplorerData = {
    abortController: AbortController;
    response: {
        body: string;
        headers: any[];
        status: string;
        time: number;
        size: number;
        navigation: string;
        bodyLanguage: string;
        bodyFormatter: string;
    };
    isSendRequestInProgress: boolean;
};

export const LLM_AI_ExplorerDataStore = writable<Map<string, LLM_AI_ExplorerData>>(
    new Map(),
);
