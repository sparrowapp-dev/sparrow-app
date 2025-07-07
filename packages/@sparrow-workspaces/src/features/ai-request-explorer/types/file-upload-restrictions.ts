export interface FileRestrictions {
    supportedExtensions: string[];
    maxFileSize: number; // in bytes
    maxFiles: number;
}

export interface ProviderRestrictions {
    [modelName: string]: FileRestrictions;
}

export interface FileUploadRestrictions {
    [providerName: string]: ProviderRestrictions;
}