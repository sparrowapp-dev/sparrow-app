export interface CreateDirectoryPostBody {
  name?: string;
  description?: string;
}

export interface CreateCollectionPostBody {
  name: string;
  workspaceId: string;
}

export interface UpdateCollectionName {
  name?: string;
  description?: string;
}

export interface UpdateFolderName {
  name: string;
}

export interface Headers {
  name: string;
  description: string;
}

export interface QueryParams {
  name: string;
  description: string;
  checked: boolean;
}

export interface UpdateRequestName {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  items: {
    name: string;
    type: string;
  };
}

export interface DeleteRequestName {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
}

export interface ImportCollectionBody {}

export interface ImportBodyUrl {
  url: string;
  urlData: {
    data: string;
    headers: string;
  };
  primaryBranch: string;
  currentBranch: string;
}

interface CollectionItemsPayload {
  name?: string;
  type?: string;
  id?: string;
  description?: string;
  request?: {
    method: string;
  };
  items?: CollectionItemsPayload;
}

export interface CreateApiRequestPostBody {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  items?: CollectionItemsPayload;
}
