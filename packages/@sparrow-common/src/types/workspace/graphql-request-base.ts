interface GraphqlRequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

interface GraphqlRequestBasicAuthBaseInterface {
  username?: string;
  password?: string;
}

interface GraphqlRequestApiKeyBaseInterface {
  authKey: string;
  authValue: string;
}

interface GraphqlRequestAuthBaseInterface {
  bearerToken?: string;
  basicAuth?: GraphqlRequestBasicAuthBaseInterface;
  apiKey?: GraphqlRequestApiKeyBaseInterface;
}

export enum GraphqlRequestAuthModeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export interface GraphqlRequestBaseInterface {
  url: string;
  query: string;
  schema: string;
  auth: GraphqlRequestAuthBaseInterface;
  headers: GraphqlRequestKeyValueCheckedBaseInterface[];
  variables: string,
  selectedGraphqlAuthType?: GraphqlRequestAuthModeBaseEnum;
}

export enum GraphqlRequestDefaultAliasBaseEnum {
  NAME = "GraphQL",
}
