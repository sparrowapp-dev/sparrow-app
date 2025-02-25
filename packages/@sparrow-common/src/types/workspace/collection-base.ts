import type { FolderBaseInterface } from "./folder-base";
import type { GraphqlRequestBaseInterface } from "./graphql-request-base";
import type { HttpRequestBaseInterface } from "./http-request-base";
import type { HttpRequestSavedBaseInterface } from "./http-request-saved-base";
import type { SocketIORequestBaseInterface } from "./socket-io-request-base";
import type { WebsocketRequestBaseInterface } from "./websocket-request-base";

export enum CollectionItemTypeBaseEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  WEBSOCKET = "WEBSOCKET",
  SOCKETIO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
  SAVED_REQUEST = "SAVED_REQUEST"
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

export interface CollectionBaseInterface {
  collectionId?: string;
  id: string;
  name: string;
  totalRequests: number;
  description: string;
  items: CollectionItemBaseInterface[];
  uuid?: string;
  activeSync?: boolean;
  activeSyncUrl?: string;
  localRepositoryPath?: string;
  workspaceId: string;
  branches?: Branch[];
  primaryBranch?: string;
  currentBranch?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CollectionArgsBaseInterface {
  workspaceId: string;
  collection?: CollectionBaseInterface;
  folder?: CollectionItemBaseInterface;
  request?: CollectionItemBaseInterface;
  websocket?: CollectionItemBaseInterface;
  socketio?: CollectionItemBaseInterface;
  graphql?: CollectionItemBaseInterface;
  newName?: string;
  importCurl?: string;
  deletedIds?: string[];
  requestIds?: string[];
}
