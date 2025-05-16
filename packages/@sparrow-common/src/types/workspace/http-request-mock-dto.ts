import type { CollectionItemTypeBaseEnum } from "./collection-base";
import type { CollectionSourceTypeDtoEnum } from "./collection-dto";
import type {
  HttpRequestMockAddToBaseEnum,
  HttpRequestMockAuthModeBaseEnum,
  HttpRequestMockBodyModeBaseEnum,
  HttpRequestMockMethodBaseEnum,
  HttpResponseMockBodyModeBaseEnum,
} from "./http-request-mock-base";

export interface HttpRequestMockQueryParamsDtoInterface {
  key: string;
  value: string;
}

export interface HttpRequestMockBodyDtoInterface {
  raw?: string;
  urlencoded?: HttpRequestMockKeyValueDtoInterface[];
  formdata?: HttpRequestMockFormDataDtoInterface;
}

export interface HttpRequestMockFormDataDtoInterface {
  text: HttpRequestMockKeyValueDtoInterface[];
  file: HttpRequestMockFormDataFileEntryDtoInterface[];
}

export interface HttpRequestMockKeyValueDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
}

export interface HttpRequestMockFormDataFileEntryDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
  base: string;
}

export interface HttpRequestMockAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string | unknown;
    addTo: HttpRequestMockAddToBaseEnum;
  };
}

export interface HttpRequestMockMetaDataDtoInterface {
  method: HttpRequestMockMethodBaseEnum;
  url: string;
  body?: HttpRequestMockBodyDtoInterface;
  responseBody?: string;
  responseStatus?: string;
  responseDate?: string;
  responseHeaders?: HttpRequestMockKeyValueDtoInterface[];
  selectedRequestBodyType?: HttpRequestMockBodyModeBaseEnum;
  selectedRequestAuthType?: HttpRequestMockAuthModeBaseEnum;
  selectedResponseBodyType?: HttpResponseMockBodyModeBaseEnum;
  queryParams?: HttpRequestMockKeyValueDtoInterface[];
  pathParams?: HttpRequestMockKeyValueDtoInterface[];
  headers?: HttpRequestMockKeyValueDtoInterface[];
  auth?: HttpRequestMockAuthDtoInterface;
}

export interface HttpRequestMockCreateUpdatePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  // requestId?: string;
  // source?: HttpRequestMockSourceDtoType;
  items?: {
    id?: string;
    name: string;
    description?: string;
    type: CollectionItemTypeBaseEnum.MOCK_REQUEST;
    source?: CollectionSourceTypeDtoEnum;
    mockRequest?: HttpRequestMockMetaDataDtoInterface;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };
  currentBranch?: string;
}

export interface HttpRequestMockUpdatePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  requestId?: string;
  name?: string;
  description?: string;
  selectedResponseBodyType?: HttpResponseMockBodyModeBaseEnum;
}

export interface HttpRequestMockDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  // requestId?: string;
}
