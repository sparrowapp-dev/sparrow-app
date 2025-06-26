import type { FileUploadRestrictions } from "../types";

export const FILE_UPLOAD_RESTRICTIONS: FileUploadRestrictions = {
    openai: {
        // File upload only available for below mentioned models, for others its disabled right now.
        "gpt-4o": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5
        },
        "gpt-4o-mini": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "gpt-4.5-preview": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "gpt-4-turbo": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "gpt-4.1": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "gpt-o1": {
            supportedExtensions: ["txt", "pdf"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        }
    },
    anthropic: {
        "claude-3-5-sonnet-20241022": {
            supportedExtensions: ["txt", "pdf", "jpg", "jpeg", "png"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "claude-3-5-haiku-20241022": {
            supportedExtensions: ["txt", "pdf", "jpg", "jpeg", "png"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "claude-3-opus-20240229": {
            supportedExtensions: ["jpg", "jpeg", "png"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        "claude-3-haiku-20240307": {
            supportedExtensions: ["jpg", "jpeg", "png"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
        // "Claude 3 Sonnet"
        "claude-3-5-sonnet-20240620": {
            supportedExtensions: ["txt", "pdf", "jpg", "jpeg", "png"],
            maxFileSize: 5 * 1024 * 1024,
            maxFiles: 5
        },
    },
    deepseek: {
        // Currently no file upload support for DeepSeek models
    },
    google: {
        // Currently no file upload support for Google models
    }
};

export const getFileRestrictions = (provider: string, model: string): FileRestrictions | null => {
    const providerRestrictions = FILE_UPLOAD_RESTRICTIONS[provider];
    if (!providerRestrictions) return null;
    return providerRestrictions[model] || null;
};

export const isFileUploadSupported = (provider: string, model: string): boolean => {
    return getFileRestrictions(provider, model) !== null;
};