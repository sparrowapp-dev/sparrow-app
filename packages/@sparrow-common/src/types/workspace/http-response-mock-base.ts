import type { CollectionRequestAddToBaseEnum } from "./collection-base";

interface HttpRequestMockKeyValueCheckedWithBaseBaseInterface {
  key: string;
  value: string;
  checked: boolean;
  base: string;
}
export interface HttpResponseMockKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface HttpRequestMockBodyBaseInterface {
  raw?: string;
  urlencoded?: HttpResponseMockKeyValueCheckedBaseInterface[];
  formdata?: {
    text: HttpResponseMockKeyValueCheckedBaseInterface[];
    file: HttpRequestMockKeyValueCheckedWithBaseBaseInterface[];
  };
}

interface HttpRequestMockBasicAuthBaseInterface {
  username?: string;
  password?: string;
}

interface HttpRequestMockApiKeyBaseInterface {
  authKey: string;
  authValue: string;
  addTo: CollectionRequestAddToBaseEnum;
}

interface HttpRequestMockAuthBaseInterface {
  bearerToken?: string;
  basicAuth?: HttpRequestMockBasicAuthBaseInterface;
  apiKey?: HttpRequestMockApiKeyBaseInterface;
}

export enum HttpRequestMockMethodBaseEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export enum HttpRequestMockDefaultNameBaseEnum {
  NAME = "REST API",
}

export enum HttpRequestMockBodyModeBaseEnum {
  NONE = "none",
  JSON = "application/json",
  XML = "application/xml",
  URLENCODED = "application/x-www-form-urlencoded",
  FORMDATA = "multipart/form-data",
  JAVASCRIPT = "application/javascript",
  TEXT = "text/plain",
  HTML = "text/html",
}

export enum HttpRequestMockAuthModeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
  INHERIT_AUTH = "Inherit Auth",
}

export enum HttpResponseMockBodyModeBaseEnum {
  NONE = "none",
  JSON = "application/json",
  XML = "application/xml",
  JAVASCRIPT = "application/javascript",
  TEXT = "text/plain",
  HTML = "text/html",
}

export enum HttpRequestMockAddToBaseEnum {
  HEADER = "HEADER",
  QUERY = "QUERY",
}

export interface HttpResponseMockBaseInterface {
  selectedResponseBodyType: HttpResponseMockBodyModeBaseEnum;
  isMockResponseActive: boolean;
  responseBody?: string;
  responseStatus: string;
  responseDate: string;
  responseHeaders?: HttpResponseMockKeyValueCheckedBaseInterface[];
}
