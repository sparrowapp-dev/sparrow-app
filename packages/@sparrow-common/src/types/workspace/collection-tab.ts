import type { CollectionAddToBaseEnum, CollectionAuthTypeBaseEnum } from "./collection-base";

export enum CollectionNavigationTabEnum {
  OVERVIEW = "Overview",
  AUTH = "Auth"
}
export interface AuthWrapper {
  auth: Auth;
}
export interface BearerTokenWrapper {
  bearerToken: string;
}

export interface UsernameWrapper {
  username: string;
}
export interface PasswordWrapper {
  password: string;
}
export interface BasicAuth extends UsernameWrapper, PasswordWrapper {}
export interface BasicAuthWrapper {
  basicAuth: BasicAuth;
}
export interface AuthKeyWrapper {
  authKey: string;
}
export interface AuthValueWrapper {
  authValue: string;
}
export interface AddtoWrapper {
  addTo: CollectionAddToBaseEnum;
}
export interface ApiKey
  extends AuthKeyWrapper,
    AuthValueWrapper,
    AddtoWrapper {}
export interface ApiKeyWrapper {
  apiKey: ApiKey;
}
export interface Auth
  extends BearerTokenWrapper,
    BasicAuthWrapper,
    ApiKeyWrapper {}

export interface CollectionAuthNavigationWrapper {
    collectionAuthNavigation: CollectionAuthTypeBaseEnum;
}
export interface CollectionNavigationWrapper {
  collectionNavigation: CollectionNavigationTabEnum;
}
export interface State
  extends
    CollectionAuthNavigationWrapper, CollectionNavigationWrapper {} 
    
export interface StateWrapper {
  state: State;
}
export interface Collection extends AuthWrapper, StateWrapper {}
export interface CollectionWrapper {
  collection: Collection;
}

export interface Property extends CollectionWrapper {}

export interface PropertyWrapper {
  property: Property;
}
