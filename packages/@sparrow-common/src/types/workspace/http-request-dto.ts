export enum HttpRequestBodyModeDtoEnum {
  NONE = "none",
  JSON = "application/json",
  XML = "application/xml",
  URLENCODED = "application/x-www-form-urlencoded",
  FORMDATA = "multipart/form-data",
  JAVASCRIPT = "application/javascript",
  TEXT = "text/plain",
  HTML = "text/html",
}

export type HttpRequestMethodsDtoInterface =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "OPTIONS"
  | "PROPFIND"
  | "PROPPATCH"
  | "MKCOL"
  | "COPY"
  | "MOVE"
  | "LOCK"
  | "UNLOCK"
  | "TRACE"
  | "SEARCH";

export enum HttpRequestAuthModeDtoEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export interface HttpRequestQueryParamsDtoInterface {
  key: string;
  value: string;
}

export interface HttpRequestBodyDtoInterface {
  raw?: string;
  urlencoded?: HttpRequestKeyValueDtoInterface[];
  formdata?: HttpRequestFormDataDtoInterface;
}

export interface HttpRequestFormDataDtoInterface {
  text: HttpRequestKeyValueDtoInterface[];
  file: HttpRequestFormDataFileEntryDtoInterface[];
}

export interface HttpRequestKeyValueDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
}

export interface HttpRequestFormDataFileEntryDtoInterface {
  key: string;
  value: string | unknown;
  checked: boolean;
  base: string;
}

export interface HttpRequestAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string | unknown;
    addTo: HttpRequestAddToDtoEnum;
  };
}

export enum HttpRequestAddToDtoEnum {
  HEADER = "HEADER",
  QUERY = "QUERY",
}

export interface HttpRequestMetaDataDtoInterface {
  method: HttpRequestMethodsDtoInterface;
  operationId: string;
  url: string;
  body?: HttpRequestBodyDtoInterface;
  selectedRequestBodyType?: HttpRequestBodyModeDtoEnum;
  selectedRequestAuthType?: HttpRequestAuthModeDtoEnum;
  queryParams?: HttpRequestKeyValueDtoInterface[];
  pathParams?: HttpRequestKeyValueDtoInterface[];
  headers?: HttpRequestKeyValueDtoInterface[];
  auth?: HttpRequestAuthDtoInterface;
  selectedRequestAuthProfileId?: string;
}
