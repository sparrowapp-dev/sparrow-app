import type {
  CollectionItemTypeDtoEnum,
  CollectionSourceTypeDtoEnum,
} from "./collection-dto";

export enum SocketIORequestBodyModeDtoEnum {
  NONE = "none",
  JSON = "application/json",
  XML = "application/xml",
  TEXT = "text/plain",
  HTML = "text/html",
}

export type SocketIORequestSourceDtoType = "SPEC" | "USER";

export interface SocketIORequestEventsDtoInterface {
  event: string;
  listen: boolean;
}

export interface SocketIORequestKeyValueDtoInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface SocketIORequestMetaDataDtoInterface {
  url?: string;
  message?: string;
  selectedSocketIOBodyType?: SocketIORequestBodyModeDtoEnum;
  queryParams?: SocketIORequestKeyValueDtoInterface[];
  headers?: SocketIORequestKeyValueDtoInterface[];
  events?: SocketIORequestEventsDtoInterface[];
}

export interface SocketIORequestCreateUpdateInCollectionPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: SocketIORequestSourceDtoType;

  items?: {
    id?: string;
    name: string;
    description?: string;
    type: CollectionItemTypeDtoEnum.SOCKETIO;
    source?: CollectionSourceTypeDtoEnum;
    socketio?: SocketIORequestMetaDataDtoInterface;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };

  currentBranch?: string;
}

export interface SocketIORequestCreateUpdateInFolderPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: SocketIORequestSourceDtoType;
  items?: {
    name: string;
    type: CollectionItemTypeDtoEnum.FOLDER;
    id: string;
    items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeDtoEnum.SOCKETIO;
      source?: CollectionSourceTypeDtoEnum;
      socketio?: SocketIORequestMetaDataDtoInterface;
      isDeleted?: boolean;
      createdAt?: string;
      updatedAt?: string;
      createdBy?: string;
      updatedBy?: string;
    };
  };
  currentBranch?: string;
}

export interface SocketIORequestDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: CollectionSourceTypeDtoEnum;
  currentBranch?: string;
}
