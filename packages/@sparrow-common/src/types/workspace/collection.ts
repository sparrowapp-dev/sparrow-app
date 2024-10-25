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
import type { KeyValueChecked, KeyValueCheckedWithBase } from "./request";

export interface IdWrapper2 {
  id: string;
}
export interface Collection extends IdWrapper2 {}
export interface CollectionWrapper {
  collection: Collection;
}

export interface Property extends CollectionWrapper {}

export interface PropertyWrapper {
  property: Property;
}

export interface CollectionTab
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

interface RequestBodyDto {
  raw?: string;
  urlencoded?: KeyValueChecked[];
  formdata?: {
    text: KeyValueChecked[];
    file: KeyValueCheckedWithBase[];
  };
}

interface BasicAuth {
  username?: string;
  password?: string;
}

interface ApiKey {
  authKey: string;
  authValue: string;
  addTo: string;
}

interface RequestAuthDto {
  bearerToken?: string;
  basicAuth?: BasicAuth;
  apiKey?: ApiKey;
}

export interface RequestDto {
  method: string;
  operationId: string;
  url: string;
  body: RequestBodyDto[];
  selectedRequestBodyType: string;
  selectedRequestAuthType: string;
  queryParams: KeyValueChecked[];
  auth: RequestAuthDto;
  headers: KeyValueChecked[];
}

export interface WebsocketDto {
  url: string;
  message: string;
  queryParams: KeyValueChecked[];
  headers: KeyValueChecked[];
  selectedWebSocketBodyType: string;
}

export interface CollectionItemsDto {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  isDeleted: boolean;
  request?: RequestDto;
  websocket?: WebsocketDto;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  items?: CollectionItemsDto;
}

interface Branch {
  id: string;
  name: string;
}

export interface CollectionDto {
  collectionId?: string;
  id: string;
  name: string;
  totalRequests: number;
  description: string;
  items: CollectionItemsDto[];
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

export interface CollectionArgsDto {
  workspaceId: string;
  collection?: CollectionDto;
  folder?: CollectionItemsDto;
  request?: CollectionItemsDto;
  websocket?: CollectionItemsDto;
  newName?: string;
  importCurl?: string;
  deletedIds?: string[];
  requestIds?: string[];
}
