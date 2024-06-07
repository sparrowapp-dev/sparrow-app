import type {
  ActiveSyncWrapper,
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
} from "./common";

export interface IdWrapper2 {
  id: string;
}

export interface Workspace extends IdWrapper2 {}

export interface WorkspaceWrapper {
  workspace: Workspace;
}

export interface Property extends WorkspaceWrapper {}

export interface PropertyWrapper {
  property: Property;
}

export interface WorkspaceTab
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
    PropertyWrapper {}
