export enum TabTypeEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  COLLECTION = "COLLECTION",
  WORKSPACE = "WORKSPACE",
  WEB_SOCKET = "WEBSOCKET",
  PERSONAL = "PERSONAL",
  ENVIRONMENT = "ENVIRONMENT",
  TESTFLOW = "TESTFLOW",
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
