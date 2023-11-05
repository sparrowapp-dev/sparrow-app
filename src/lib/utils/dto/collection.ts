export interface CreateDirectoryPostBody {
  name: string;
  description: string;
}

export interface CreateCollectionPostBody {
  name: string;
  workspaceId: string;
}

export interface Headers {
  name: string;
  description: string;
}

export interface QueryParams {
  name: string;
  description: string;
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
      url?: string;
      body?: string;
      headers?: Headers[];
      queryParams?: QueryParams[];
    };
    items?: {
      name: string;
      type: string;
      request: {
        method: string;
        url?: string;
        body?: string;
        headers?: Headers[];
        queryParams?: QueryParams[];
      };
    };
  };
}
