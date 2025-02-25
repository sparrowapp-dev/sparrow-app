import type { CollectionWrapper } from "./collection-tab";
import type { RequestWrapper } from "./http-request-tab";
import type { FolderWrapper } from "./folder-tab";
import type { WorkspaceWrapper } from "./workspace-tab";
import type { WebSocketWrapper } from "./websocket-request-tab";
import type { TFTabItemWrapperType } from "./testflow-tab";
import type { SocketIoWrapper } from "./socket-io-request-tab";
import type { GraphqlRequestWrapperTabInterface } from "./graphql-request-tab";

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
}

export enum TabPersistenceTypeEnum {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
}
export interface WorkspaceIdWrapper {
  workspaceId: string;
}
export interface CollectionIdWrapper {
  collectionId: string;
}
export interface FolderIdWrapper {
  folderId: string;
}
export interface Path
  extends WorkspaceIdWrapper,
    CollectionIdWrapper,
    FolderIdWrapper {}
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

export interface TabTypeWrapper {
  tabType: TabPersistenceTypeEnum;
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
    Partial<GraphqlRequestWrapperTabInterface> {}

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
    TabTypeWrapper,
    PropertyWrapper {}
