import type { CollectionWrapper } from "./collection-tab";
import type { RequestWrapper } from "./http-request-tab";
import type { FolderWrapper } from "./folder-tab";
import type { WorkspaceWrapper } from "./workspace-tab";
import type { WebSocketWrapper } from "./websocket-request-tab";
import type { TFTabItemWrapperType } from "./testflow-tab";
import type { SocketIoWrapper } from "./socket-io-request-tab";
import type { GraphqlRequestWrapperTabInterface } from "./graphql-request-tab";
import type { HttpRequestSavedWrapperTabInterface } from "./http-request-saved-tab";
import type { HttpRequestMockWrapperTabInterface } from "./http-request-mock-tab";
import type { AiRequestWrapper } from "./ai-request-tab";

export enum TabTypeEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  COLLECTION = "COLLECTION",
  WORKSPACE = "WORKSPACE",
  WEB_SOCKET = "WEBSOCKET",
  PERSONAL = "PERSONAL",
  ENVIRONMENT = "ENVIRONMENT",
  TESTFLOW = "TESTFLOW",
  SOCKET_IO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
  SAVED_REQUEST = "SAVED_REQUEST",
  AI_REQUEST = "AI_REQUEST",
  MOCK_REQUEST = "MOCK_REQUEST",
}

export enum TabPersistenceTypeEnum {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
}
export interface WorkspaceIdWrapper {
  workspaceId: string;
}
export interface CollectionIdWrapper {
  collectionId?: string;
}
export interface RequestIdWrapper {
  requestId?: string;
}
export interface FolderIdWrapper {
  folderId?: string;
}
export interface LLMRequestIdWrapper {
  LLMRequestId?: string;
}
export interface Path
  extends WorkspaceIdWrapper,
  CollectionIdWrapper,
  FolderIdWrapper,
    RequestIdWrapper { }
export interface DescriptionWrapper {
  description: string;
}
export interface IdWrapper {
  id: string;
}
export interface NameWrapper {
  name: string;
}
export interface TypeWrapper {
  type: TabTypeEnum;
}

export interface PersistenceWrapper {
  persistence: TabPersistenceTypeEnum;
}
export interface IsDeletedWrapper {
  isDeleted: boolean;
}
export interface ActiveSyncWrapper {
  activeSync: boolean;
}
export interface SourceWrapper {
  source: string;
}
export interface IsActiveWrapper {
  isActive: boolean;
}
export interface IsSavedWrapper {
  isSaved: boolean;
}
export interface TimestampWrapper {
  timestamp: string;
}
export interface IndexWrapper {
  index: number;
}
export interface TabIdWrapper {
  tabId: string;
}
export interface PathWrapper {
  path: Path;
}

export interface Property
  extends Partial<RequestWrapper>,
  Partial<FolderWrapper>,
  Partial<CollectionWrapper>,
  Partial<WorkspaceWrapper>,
  Partial<WebSocketWrapper>,
  Partial<TFTabItemWrapperType>,
  Partial<SocketIoWrapper>,
  Partial<GraphqlRequestWrapperTabInterface>,
    Partial<HttpRequestMockWrapperTabInterface>,
  Partial<HttpRequestSavedWrapperTabInterface>,
  Partial<AiRequestWrapper> { }

export interface PropertyWrapper {
  property: Property;
}

export interface Tab
  extends ActiveSyncWrapper,
  DescriptionWrapper,
  IdWrapper,
  IndexWrapper,
  IsActiveWrapper,
  IsDeletedWrapper,
  IsSavedWrapper,
  NameWrapper,
  PathWrapper,
  SourceWrapper,
  TabIdWrapper,
  TimestampWrapper,
  TypeWrapper,
  PersistenceWrapper,
  PropertyWrapper { }
