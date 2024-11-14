import type {
  CollectionItemTypeDtoEnum,
  CollectionSourceTypeDtoEnum,
} from "./collection-dto";

export interface GraphqlRequestKeyValueDtoInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface GraphqlRequestAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string;
  };
}

export type GraphqlRequestSourceDtoType = "SPEC" | "USER";

export interface GraphqlRequestMetaDataDtoInterface {
  url?: string;
  query?: string;
  schema?: string;
  headers?: GraphqlRequestKeyValueDtoInterface[];
  auth?: GraphqlRequestAuthDtoInterface;
}

export interface GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: GraphqlRequestSourceDtoType;

  items?: {
    id?: string;
    name: string;
    description?: string;
    type: CollectionItemTypeDtoEnum.GRAPHQL;
    source?: CollectionSourceTypeDtoEnum;
    graphql?: GraphqlRequestMetaDataDtoInterface;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };

  currentBranch?: string;
}

export interface GraphqlRequestCreateUpdateInFolderPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: GraphqlRequestSourceDtoType;
  items?: {
    name: string;
    type: CollectionItemTypeDtoEnum.FOLDER;
    id: string;
    items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeDtoEnum.GRAPHQL;
      source?: CollectionSourceTypeDtoEnum;
      graphql?: GraphqlRequestMetaDataDtoInterface;
      isDeleted?: boolean;
      createdAt?: string;
      updatedAt?: string;
      createdBy?: string;
      updatedBy?: string;
    };
  };
  currentBranch?: string;
}

export interface GraphqlRequestDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: CollectionSourceTypeDtoEnum;
  currentBranch?: string;
}
