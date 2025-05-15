import type { FolderBaseInterface } from "./folder-base";
import type { GraphqlRequestBaseInterface } from "./graphql-request-base";
import type { HttpRequestBaseInterface } from "./http-request-base";
import type { HttpRequestMockBaseInterface } from "./http-request-mock-base";
import type { HttpRequestSavedBaseInterface } from "./http-request-saved-base";
import type { SocketIORequestBaseInterface } from "./socket-io-request-base";
import type { WebsocketRequestBaseInterface } from "./websocket-request-base";

export enum CollectionItemTypeBaseEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  WEBSOCKET = "WEBSOCKET",
  SOCKETIO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
  SAVED_REQUEST = "REQUEST_RESPONSE",
  MOCK_REQUEST = "MOCK_REQUEST",
}

export interface CollectionItemBaseInterface {
  id: string;
  name: string;
  description: string;
  type: CollectionItemTypeBaseEnum;
  source: string;
  isDeleted: boolean;
  request?: HttpRequestBaseInterface;
  websocket?: WebsocketRequestBaseInterface;
  socketio?: SocketIORequestBaseInterface;
  graphql?: GraphqlRequestBaseInterface;
  requestResponse?: HttpRequestSavedBaseInterface;
  mockRequest?: HttpRequestMockBaseInterface;
  folder?: FolderBaseInterface;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  items: CollectionItemBaseInterface[];
}

interface Branch {
  id: string;
  name: string;
}

export enum CollectionRequestAddToBaseEnum {
  HEADER = "Header",
  QUERY_PARAMETER = "Query Parameter",
  COOKIES = "Cookies",
}

export enum CollectionAuthTypeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export enum CollectionTypeBaseEnum {
  MOCK = "MOCK",
  STANDARD = "STANDARD",
}

export interface CollectionAuthBaseInterface {
  bearerToken: string;
  basicAuth: {
    username: string;
    password: string;
  };
  apiKey: {
    authKey: string;
    authValue: string;
    addTo: CollectionRequestAddToBaseEnum;
  };
}

export interface CollectionBaseInterface {
  collectionId?: string;
  id: string;
  name: string;
  totalRequests: number;
  description: string;
  collectionType?: CollectionTypeBaseEnum;
  mockCollectionUrl?: string;
  items: CollectionItemBaseInterface[];
  uuid?: string;
  activeSync?: boolean;
  activeSyncUrl?: string;
  localRepositoryPath?: string;
  workspaceId: string;
  auth?: CollectionAuthBaseInterface;
  selectedAuthType?: CollectionAuthTypeBaseEnum;
  branches?: Branch[];
  primaryBranch?: string;
  currentBranch?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  syncedAt?: string;
}

export interface CollectionArgsBaseInterface {
  workspaceId: string;
  collection?: CollectionBaseInterface;
  folder?: CollectionItemBaseInterface;
  request?: CollectionItemBaseInterface;
  websocket?: CollectionItemBaseInterface;
  socketio?: CollectionItemBaseInterface;
  graphql?: CollectionItemBaseInterface;
  requestResponse?: CollectionItemBaseInterface;
  mockRequest?: CollectionItemBaseInterface;
  newName?: string;
  importCurl?: string;
  deletedIds?: string[];
  requestIds?: string[];
}
