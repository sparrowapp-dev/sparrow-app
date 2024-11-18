export enum GraphqlRequestAuthTypeTabEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export enum GraphqlRequestSectionTabEnum {
  QUERY = "Query",
  Schema = "Schema",
  AUTHORIZATION = "Authorization",
  HEADERS = "Headers",
}

export interface GraphqlRequestKeyWrapperTabInterface {
  key: string;
}
export interface GraphqlRequestValueWrapperTabInterface {
  value: string;
}
export interface GraphqlRequestCheckedWrapperTabInterface {
  checked: boolean;
}

export interface GraphqlRequestLeftSplitterWidthPercentageWrapperTabInterface {
  requestLeftSplitterWidthPercentage: number;
}
export interface GraphqlRequestRightSplitterWidthPercentageWrapperTabInterface {
  requestRightSplitterWidthPercentage: number;
}

export interface GraphqlRequestIsBulkHeaderWrapperTabInterface {
  isHeaderBulkEditActive: boolean;
}

export interface GraphqlRequestUsernameWrapperTabInterface {
  username: string;
}
export interface GraphqlRequestPasswordWrapperTabInterface {
  password: string;
}
export interface GraphqlRequestAuthKeyWrapperTabInterface {
  authKey: string;
}
export interface GraphqlRequestAuthValueWrapperTabInterface {
  authValue: string;
}

export interface GraphqlRequestBearerTokenWrapperTabInterface {
  bearerToken: string;
}
export interface GraphqlRequestUrlWrapperTabInterface {
  url: string;
}
export interface GraphqlRequestQueryWrapperTabInterface {
  query: string;
}
export interface GraphqlRequestSchemaWrapperTabInterface {
  schema: string;
}

export interface GraphqlRequestKeyValueCheckedTabInterface
  extends GraphqlRequestKeyWrapperTabInterface,
    GraphqlRequestValueWrapperTabInterface,
    GraphqlRequestCheckedWrapperTabInterface {}

export interface GraphqlRequestNavigationWrapperTabInterface {
  requestNavigation: GraphqlRequestSectionTabEnum;
}
export interface GraphqlRequestAuthNavigationWrapperTabInterface {
  requestAuthNavigation: GraphqlRequestAuthTypeTabEnum;
}
export interface GraphqlRequestStateTabInterface
  extends GraphqlRequestNavigationWrapperTabInterface,
    GraphqlRequestAuthNavigationWrapperTabInterface,
    GraphqlRequestLeftSplitterWidthPercentageWrapperTabInterface,
    GraphqlRequestRightSplitterWidthPercentageWrapperTabInterface,
    GraphqlRequestIsBulkHeaderWrapperTabInterface {}

export interface GraphqlRequestStateWrapperTabInterface {
  state: GraphqlRequestStateTabInterface;
}

export interface GraphqlRequestBasicAuthTabInterface
  extends GraphqlRequestUsernameWrapperTabInterface,
    GraphqlRequestPasswordWrapperTabInterface {}
export interface GraphqlRequestBasicAuthWrapperTabInterface {
  basicAuth: GraphqlRequestBasicAuthTabInterface;
}
export interface GraphqlRequestApiKeyTabInterface
  extends GraphqlRequestAuthKeyWrapperTabInterface,
    GraphqlRequestAuthValueWrapperTabInterface {}
export interface GraphqlRequestApiKeyWrapperTabInterface {
  apiKey: GraphqlRequestApiKeyTabInterface;
}
export interface GraphqlRequestAuthTabInterface
  extends GraphqlRequestBearerTokenWrapperTabInterface,
    GraphqlRequestBasicAuthWrapperTabInterface,
    GraphqlRequestApiKeyWrapperTabInterface {}
export interface GraphqlRequestAuthWrapperTabInterface {
  auth: GraphqlRequestAuthTabInterface;
}

export interface GraphqlRequestHeadersWrapperTabInterface {
  headers: GraphqlRequestKeyValueCheckedTabInterface[];
}

export interface GraphqlRequestHeadersTabInterface
  extends GraphqlRequestKeyValueCheckedTabInterface {}
export interface GraphqlRequestAutoGeneratedHeadersTabInterface
  extends GraphqlRequestKeyValueCheckedTabInterface {}

export interface GraphqlRequestQueryParamsWrapperTabInterface {
  queryParams: GraphqlRequestKeyValueCheckedTabInterface[];
}
export interface GraphqlRequestAutoGeneratedHeadersWrapperTabInterface {
  autoGeneratedHeaders: GraphqlRequestKeyValueCheckedTabInterface[];
}

export interface GraphqlRequestWrapperTabInterface {
  graphql: GraphqlRequestTabInterface;
}
export interface GraphqlRequestTabInterface
  extends GraphqlRequestAutoGeneratedHeadersWrapperTabInterface,
    GraphqlRequestStateWrapperTabInterface,
    GraphqlRequestAuthWrapperTabInterface,
    GraphqlRequestUrlWrapperTabInterface,
    GraphqlRequestQueryWrapperTabInterface,
    GraphqlRequestSchemaWrapperTabInterface,
    GraphqlRequestHeadersWrapperTabInterface {}
