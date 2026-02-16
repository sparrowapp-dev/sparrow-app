import type { CollectionRequestAddToBaseEnum } from "./collection-base";

interface HttpRequestKeyValueCheckedWithBaseBaseInterface {
  key: string;
  value: string;
  checked: boolean;
  base: string;
}
interface HttpRequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export enum HttpRequestAuthTypeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
  OAUTH2 = "OAuth 2.0",
  INHERIT_AUTH = "Inherit Auth",
  AUTH_PROFILES = "Authentication Profiles"
}

export interface HttpRequestBodyBaseInterface {
  raw?: string;
  urlencoded?: HttpRequestKeyValueCheckedBaseInterface[];
  formdata?: {
    text: HttpRequestKeyValueCheckedBaseInterface[];
    file: HttpRequestKeyValueCheckedWithBaseBaseInterface[];
  };
}

interface HttpRequestBasicAuthBaseInterface {
  username?: string;
  password?: string;
}

interface HttpRequestApiKeyBaseInterface {
  authKey: string;
  authValue: string;
  addTo: CollectionRequestAddToBaseEnum;
}

export enum HttpRequestOAuth2GrantTypeBaseEnum {
  AUTHORIZATION_CODE = "Authorization Code",
  CLIENT_CREDENTIALS = "Client Credentials",
}

interface HttpRequestOAuth2BaseInterface {
  grantType?: HttpRequestOAuth2GrantTypeBaseEnum;
  headerPrefix?: string;
  callbackUrl?: string;
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  accessTokenUrl?: string;
  scope?: string;
  state?: string;
  accessToken?: string;
}

interface HttpRequestAuthBaseInterface {
  bearerToken?: string;
  basicAuth?: HttpRequestBasicAuthBaseInterface;
  apiKey?: HttpRequestApiKeyBaseInterface;
  oauth2?: HttpRequestOAuth2BaseInterface;
}

export enum HttpRequestMethodBaseEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export enum HttpRequestDefaultNameBaseEnum {
  NAME = "REST API",
}

export enum HttpRequestContentTypeBaseEnum {
  "application/json" = "application/json",
  "application/xml" = "application/xml",
  "application/x-www-form-urlencoded" = "application/x-www-form-urlencoded",
  "multipart/form-data" = "multipart/form-data",
  "application/javascript" = "application/javascript",
  "text/plain" = "text/plain",
  "text/html" = "text/html",
  "none" = "none",
}

export interface HttpRequestBaseInterface {
  method: string;
  operationId: string;
  url: string;
  body: HttpRequestBodyBaseInterface[];
  selectedRequestBodyType: HttpRequestContentTypeBaseEnum;
  selectedRequestAuthType: HttpRequestAuthTypeBaseEnum;
  queryParams: HttpRequestKeyValueCheckedBaseInterface[];
  auth: HttpRequestAuthBaseInterface;
  headers: HttpRequestKeyValueCheckedBaseInterface[];
  selectedRequestAuthProfileId?: string;
}
