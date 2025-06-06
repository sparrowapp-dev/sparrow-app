import type { AiModelProviderEnum, AIModelVariant } from "@sparrow/common/types/workspace/ai-request-base";
import { writable } from "svelte/store";

export type AiRequestExplorerData = {
    response: {
        messageId: string,
        statusCode: string,
        inputTokens: number,
        outputTokens: number,
        totalTokens: number,
        time: number;
        modelProvider: AiModelProviderEnum,
        modelVariant: AIModelVariant
        // size: number;
    };
};

export const AiRequestExplorerDataStore = writable<Map<string, AiRequestExplorerData>>(
    new Map(),
);
