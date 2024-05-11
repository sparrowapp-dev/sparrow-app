import type { CollectionWrapper } from "./collection";
import type { RequestWrapper } from "./request";
import type { FolderWrapper } from "./folder";
import type { WorkspaceWrapper } from "./workspace";

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

export interface Property
  extends Partial<RequestWrapper>,
    Partial<FolderWrapper>,
    Partial<CollectionWrapper>,
    Partial<WorkspaceWrapper> {}

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
    PropertyWrapper {}
