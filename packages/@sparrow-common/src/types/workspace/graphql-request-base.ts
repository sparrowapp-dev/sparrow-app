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

export interface GraphqlRequestBaseInterface {
  url: string;
  query: string;
  schema: string;
  auth: GraphqlRequestAuthBaseInterface;
  headers: GraphqlRequestKeyValueCheckedBaseInterface[];
}

export enum GraphqlRequestDefaultAliasBaseEnum {
  NAME = "GraphQL",
}
