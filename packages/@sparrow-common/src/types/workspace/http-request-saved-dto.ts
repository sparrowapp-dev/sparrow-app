import type { CollectionItemTypeBaseEnum } from "./collection-base";
import type { CollectionSourceTypeDtoEnum } from "./collection-dto";
import type { HttpRequestSavedAddToBaseEnum, HttpRequestSavedAuthModeBaseEnum, HttpRequestSavedBodyModeBaseEnum, HttpRequestSavedMethodBaseEnum } from "./http-request-saved-base";

export interface HttpRequestSavedQueryParamsDtoInterface {
  key: string;
  value: string;
}

export interface HttpRequestSavedBodyDtoInterface {
  raw?: string;
  urlencoded?: HttpRequestSavedKeyValueDtoInterface[];
  formdata?: HttpRequestSavedFormDataDtoInterface;
}

export interface HttpRequestSavedFormDataDtoInterface {
  text: HttpRequestSavedKeyValueDtoInterface[];
  file: HttpRequestSavedFormDataFileEntryDtoInterface[];
}

export interface HttpRequestSavedKeyValueDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
}

export interface HttpRequestSavedFormDataFileEntryDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
  base: string;
}

export interface HttpRequestSavedAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string | unknown;
    addTo: HttpRequestSavedAddToBaseEnum;
  };
}

export interface HttpRequestSavedMetaDataDtoInterface {
  method: HttpRequestSavedMethodBaseEnum;
  url: string;
  body?: HttpRequestSavedBodyDtoInterface;
  responseBody?: string;
  responseStatus: string;
  responseDate: string;
  responseHeaders?: HttpRequestSavedKeyValueDtoInterface[];
  selectedRequestBodyType?: HttpRequestSavedBodyModeBaseEnum;
  selectedRequestAuthType?: HttpRequestSavedAuthModeBaseEnum;
  queryParams?: HttpRequestSavedKeyValueDtoInterface[];
  pathParams?: HttpRequestSavedKeyValueDtoInterface[];
  headers?: HttpRequestSavedKeyValueDtoInterface[];
  auth?: HttpRequestSavedAuthDtoInterface;
}

export interface HttpRequestSavedCreateUpdatePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  requestId?: string;
  // source?: HttpRequestSavedSourceDtoType;
  items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeBaseEnum.SAVED_REQUEST;
      source?: CollectionSourceTypeDtoEnum;
      requestResponse?: HttpRequestSavedMetaDataDtoInterface;
      isDeleted?: boolean;
      createdAt?: string;
      updatedAt?: string;
      createdBy?: string;
      updatedBy?: string;
    
  };
  currentBranch?: string;
}

export interface HttpRequestSavedUpdatePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  requestId?: string;
  name?: string;
  description?: string;
}