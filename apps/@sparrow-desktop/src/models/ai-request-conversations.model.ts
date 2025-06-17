import {
    toTypedRxJsonSchema,
    type ExtractDocumentTypeFromTypedRxJsonSchema,
    type RxJsonSchema,
} from "rxdb";

export const aiRequestConversationsSchemaLiteral = {
    title: "aiConversations",
    primaryKey: "id",
    type: "object",
    version: 0,
    properties: {
        id: {
            type: "string",
            maxLength: 100,
        },
        provider: {
            type: "string",
            description: "AI model provider name (e.g., openai, anthropic, deepseek, gemini)",
        },
        apiKey: {
            type: "string",
            description: "API key for the provider",
        },
        conversations: {
            type: "array",
            default: [],
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                    },
                    title: {
                        type: "string",
                    },
                    inputTokens: {
                        type: "number",
                        minimum: 0,
                    },
                    outputTokens: {
                        type: "number",
                        minimum: 0,
                    },
                    date: {
                        type: "string",
                    },
                    time: {
                        type: "string",
                    },
                    authoredBy: {
                        type: "string",
                    },
                    conversation: {
                        type: "array",
                        default: [],
                        items: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                },
                                messageId: {
                                    type: "string",
                                },
                                type: {
                                    type: "string",
                                    enum: ["Sender", "Receiver"],
                                },
                                status: {
                                    type: "boolean",
                                },
                                modelProvider: {
                                    type: "string",
                                },
                                modelVariant: {
                                    type: "string",
                                },
                                statusCode: {
                                    type: "number",
                                },
                                inputTokens: {
                                    type: "number",
                                    minimum: 0,
                                },
                                outputTokens: {
                                    type: "number",
                                    minimum: 0,
                                },
                                totalTokens: {
                                    type: "number",
                                    minimum: 0,
                                },
                                time: {
                                    type: "number",
                                    minimum: 0,
                                },
                            },
                            required: ["message", "messageId", "type"],
                        },
                    },
                },
                required: ["id", "title", "authoredBy"],
            },
        },
        createdAt: {
            type: "string",
        },
        updatedAt: {
            type: "string",
        },
        createdBy: {
            type: "string",
        },
        updatedBy: {
            type: "string",
        },
    },
    required: ["id", "provider", "apiKey"],
} as const;

const schemaTyped = toTypedRxJsonSchema(aiRequestConversationsSchemaLiteral);
export type AiRequestConversationsDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
    typeof schemaTyped
>;

export const aiRequestConversationsSchema: RxJsonSchema<AiRequestConversationsDocType> =
    aiRequestConversationsSchemaLiteral;