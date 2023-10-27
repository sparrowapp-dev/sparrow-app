export interface CreateDirectoryPostBody {
  name: string;
  description: string;
}

export interface CreateCollectionPostBody {
  name: string;
  workspaceId: string;
}

export interface CreateApiRequestPostBody {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  items: {
    name: string;
    type: string;
    request?: {
      method: string;
    };
    items?: {
      name: string;
      type: string;
      request: {
        method: string;
      };
    };
  };
}
