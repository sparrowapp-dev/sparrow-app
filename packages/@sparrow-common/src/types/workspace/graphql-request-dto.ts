import type { CollectionItemTypeBaseEnum } from "./collection-base";
import { CollectionSourceTypeDtoEnum } from "./collection-dto";
import type { GraphqlRequestAuthModeBaseEnum } from "./graphql-request-base";

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
  variables?: string;
  headers?: GraphqlRequestKeyValueDtoInterface[];
  auth?: GraphqlRequestAuthDtoInterface;
  selectedGraphqlAuthType?: GraphqlRequestAuthModeBaseEnum;
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
    type: CollectionItemTypeBaseEnum.GRAPHQL;
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
    name?: string;
    type: CollectionItemTypeBaseEnum.FOLDER;
    id: string;
    items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeBaseEnum.GRAPHQL;
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
