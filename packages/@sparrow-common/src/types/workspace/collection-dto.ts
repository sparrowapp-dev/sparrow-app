import type { GraphqlRequestMetaDataDtoInterface } from "./graphql-request-dto";
import type { HttpRequestMetaDataDtoInterface } from "./http-request-dto";
import type { HttpRequestMockMetaDataDtoInterface } from "./http-request-mock-dto";
import type { SocketIORequestMetaDataDtoInterface } from "./socket-io-request-dto";
import type { WebSocketRequestMetaDataDtoInterface } from "./websocket-request-dto";

// Enums
export enum CollectionItemTypeDtoEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  WEBSOCKET = "WEBSOCKET",
  SOCKETIO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
  MOCK_REQUEST = "MOCK_REQUEST",
}

export enum CollectionSourceTypeDtoEnum {
  SPEC = "SPEC",
  USER = "USER",
}

export interface CollectionItemDtoInterface {
  id?: string;
  name: string;
  description?: string;
  type: CollectionItemTypeDtoEnum;
  source?: CollectionSourceTypeDtoEnum;
  items?: CollectionItemDtoInterface[];
  request?: HttpRequestMetaDataDtoInterface;
  websocket?: WebSocketRequestMetaDataDtoInterface;
  socketio?: SocketIORequestMetaDataDtoInterface;
  graphql?: GraphqlRequestMetaDataDtoInterface;
  mockRequest?: HttpRequestMockMetaDataDtoInterface;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CollectionBranchDtoInterface {
  id: string;
  name: string;
}

export interface CollectionUpdaterDetailsDtoInterface {
  name: string;
  id?: string;
}

export interface MockRequestHistoryDtoInterface {
  id?: string;
  timestamp: Date;
  name: string;
  url: string;
  method: string;
  responseStatus?: string;
  duration: number;
  requestHeaders?: { key: string; value: string; checked: boolean }[];
  requestBody?: any[];
  selectedRequestBodyType?: string;
  selectedResponseBodyType?: string;
  responseHeaders?: { key: string; value: string; checked: boolean }[];
  responseBody?: string;
}

export interface CollectionDtoInterface {
  name: string;
  description?: string;
  primaryBranch?: string;
  localRepositoryPath?: string;
  totalRequests: number;
  uuid?: string;
  items: CollectionItemDtoInterface[];
  activeSync?: boolean;
  activeSyncUrl?: string;
  branches?: CollectionBranchDtoInterface[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: CollectionUpdaterDetailsDtoInterface;
  mockRequestHistory?: MockRequestHistoryDtoInterface[];
}
