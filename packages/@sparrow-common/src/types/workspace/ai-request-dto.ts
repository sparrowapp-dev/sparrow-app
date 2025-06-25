import type { AiModelProviderEnum, AIModelVariant } from "./ai-request-base";
import type { CollectionItemTypeBaseEnum } from "./collection-base";
import type { CollectionSourceTypeDtoEnum } from "./collection-dto";

export type AiRequestSourceDtoType = "SPEC" | "USER";

export interface AiRequestKeyValueDtoInterface {
  key: string;
  value: string;
  checked: boolean;
}

export enum AiRequestAuthModeDtoEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export interface AiRequestAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string | unknown;
    addTo: AiRequestAddToDtoEnum;
  };
}

export enum AiRequestAddToDtoEnum {
  HEADER = "HEADER",
  QUERY = "QUERY",
}

export interface AiRequestMetaDataDtoInterface {
  aiModelProvider?: AiModelProviderEnum;
  aiModelVariant?: AIModelVariant;
  systemPrompt?: string;
  auth?: AiRequestAuthDtoInterface;
  selectedRequestAuthType?: AiRequestAuthModeDtoEnum;
}

export interface AiRequestCreateUpdateInCollectionPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: AiRequestSourceDtoType;

  items?: {
    id?: string;
    name: string;
    description?: string;
    type: CollectionItemTypeBaseEnum.AI_REQUEST;
    source?: CollectionSourceTypeDtoEnum;
    aiRequest?: AiRequestMetaDataDtoInterface;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };

  currentBranch?: string;
}

export interface AiRequestCreateUpdateInFolderPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: AiRequestSourceDtoType;
  items?: {
    name: string;
    type: CollectionItemTypeBaseEnum.FOLDER;
    id: string;
    items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeBaseEnum.AI_REQUEST;
      source?: CollectionSourceTypeDtoEnum;
      aiRequest?: AiRequestMetaDataDtoInterface;
      isDeleted?: boolean;
      createdAt?: string;
      updatedAt?: string;
      createdBy?: string;
      updatedBy?: string;
    };
  };
  currentBranch?: string;
}

export interface AiRequestDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: CollectionSourceTypeDtoEnum;
  currentBranch?: string;
}
