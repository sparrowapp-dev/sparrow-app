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
    id: string;
    name: string;
    description: string;
    type: string;
    items?: object[];
    request: {
      id: string;
      name: string;
      method: string;
      operationId: string;
      url: string;
      body: [
        {
          type: string;
          schema: object;
        },
      ];
      queryParams: [];
      pathParams: [
        {
          name: string;
          description: string;
          required: true;
          schema: object;
        },
      ];
      headers: [];
    };
  };
}
