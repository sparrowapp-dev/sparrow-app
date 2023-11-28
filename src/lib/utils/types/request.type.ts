import type { AuthType } from "../enums/authorization.enum";
import {
  RequestMethod,
  type RequestAuthProperty,
  type RequestProperty,
  RequestDataType,
  RequestDataset,
  RequestSection,
  ResponseSection,
  ResponseFormatter,
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

export type RequestMethodType =
  | RequestMethod.DELETE
  | RequestMethod.GET
  | RequestMethod.HEAD
  | RequestMethod.OPTIONS
  | RequestMethod.PATCH
  | RequestMethod.POST
  | RequestMethod.PUT;

export type RequestRawType =
  | RequestDataType.HTML
  | RequestDataType.JSON
  | RequestDataType.JAVASCRIPT
  | RequestDataType.TEXT
  | RequestDataType.XML;

export type RequestDatasetType =
  | RequestDataset.FORMDATA
  | RequestDataset.NONE
  | RequestDataset.RAW
  | RequestDataset.URLENCODED;

export type RequestAuthTypes =
  | AuthType.API_KEY
  | AuthType.BASIC_AUTH
  | AuthType.BEARER_TOKEN
  | AuthType.NO_AUTH;

export type RequestSectionType =
  | RequestSection.PARAMETERS
  | RequestSection.REQUEST_BODY
  | RequestSection.HEADERS
  | RequestSection.AUTHORIZATION;

export type ResponseSectionType =
  | ResponseSection.RESPONSE
  | ResponseSection.HEADERS;

export type ResponseFormatterType =
  | ResponseFormatter.PRETTY
  | ResponseFormatter.RAW;
