import type {
  RequestAuthProperty,
  RequestProperty,
} from "../enums/request.enum";

export type RequestType =
  | RequestProperty.AUTH
  | RequestProperty.AUTO_GENERATED_HEADERS
  | RequestProperty.BODY
  | RequestProperty.HEADERS
  | RequestProperty.METHOD
  | RequestProperty.QUERY_PARAMS
  | RequestProperty.RESPONSE
  | RequestProperty.STATE
  | RequestProperty.URL;

export type RequestAuthType =
  | RequestAuthProperty.API_KEY
  | RequestAuthProperty.BASIC_AUTH
  | RequestAuthProperty.BEARER_TOKEN;
