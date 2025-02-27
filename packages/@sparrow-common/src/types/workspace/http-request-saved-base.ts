interface HttpRequestSavedKeyValueCheckedWithBaseBaseInterface {
    key: string;
    value: string;
    checked: boolean;
    base: string;
  }
  interface HttpRequestSavedKeyValueCheckedBaseInterface {
    key: string;
    value: string;
    checked: boolean;
  }
  
  interface HttpRequestSavedBodyBaseInterface {
    raw?: string;
    urlencoded?: HttpRequestSavedKeyValueCheckedBaseInterface[];
    formdata?: {
      text: HttpRequestSavedKeyValueCheckedBaseInterface[];
      file: HttpRequestSavedKeyValueCheckedWithBaseBaseInterface[];
    };
  }
  
  interface HttpRequestSavedBasicAuthBaseInterface {
    username?: string;
    password?: string;
  }
  
  export enum HttpRequestSavedAddToBaseEnum {
    HEADER = "Header",
    QUERY_PARAMETER = "Query Parameter",
    COOKIES = "Cookies",
  }

  interface HttpRequestSavedApiKeyBaseInterface {
    authKey: string;
    authValue: string;
    addTo: HttpRequestSavedAddToBaseEnum;
  }
  
  interface HttpRequestSavedAuthBaseInterface {
    bearerToken?: string;
    basicAuth?: HttpRequestSavedBasicAuthBaseInterface;
    apiKey?: HttpRequestSavedApiKeyBaseInterface;
  }
  
  export enum HttpRequestSavedMethodBaseEnum {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
  }
  
  export enum HttpRequestSavedDefaultNameBaseEnum {
    NAME = "REST API",
  }

  export enum HttpRequestSavedBodyModeBaseEnum {
    NONE = "none",
    JSON = "application/json",
    XML = "application/xml",
    URLENCODED = "application/x-www-form-urlencoded",
    FORMDATA = "multipart/form-data",
    JAVASCRIPT = "application/javascript",
    TEXT = "text/plain",
    HTML = "text/html",}

    export enum HttpRequestSavedAuthModeBaseEnum {
      NO_AUTH = "No Auth",
      API_KEY = "API Key",
      BEARER_TOKEN = "Bearer Token",
      BASIC_AUTH = "Basic Auth",
    }
  
  export interface HttpRequestSavedBaseInterface {
    method: HttpRequestSavedMethodBaseEnum;
    operationId: string;
    url: string;
    body: HttpRequestSavedBodyBaseInterface;
    selectedRequestBodyType: HttpRequestSavedBodyModeBaseEnum;
    selectedRequestAuthType: HttpRequestSavedAuthModeBaseEnum;
    queryParams: HttpRequestSavedKeyValueCheckedBaseInterface[];
    auth: HttpRequestSavedAuthBaseInterface;
    headers: HttpRequestSavedKeyValueCheckedBaseInterface[];
    responseBody?: string;
    responseStatus: string;
    responseDate: string;
    responseHeaders?: HttpRequestSavedKeyValueCheckedBaseInterface[];
  }
  