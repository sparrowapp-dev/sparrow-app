import type { HttpRequestBaseInterface } from "./http-request-base";
import type { SocketioRequestBaseInterface } from "./socket-io-request-base";
import type { WebsocketRequestBaseInterface } from "./websocket-request-base";

export interface CollectionItemBaseInterface {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  isDeleted: boolean;
  request?: HttpRequestBaseInterface;
  websocket?: WebsocketRequestBaseInterface;
  socketio?: SocketioRequestBaseInterface;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  items?: CollectionItemBaseInterface;
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
  newName?: string;
  importCurl?: string;
  deletedIds?: string[];
  requestIds?: string[];
}
