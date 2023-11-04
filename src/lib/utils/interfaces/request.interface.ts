export interface Path {
  workspaceId: string;
  collectionId: string;
  folderId: string;
  folderName: string;
}

export interface Response {
  headers: unknown;
  status: string;
  body: string;
}

export interface Tab {
  id: string;
  name: string;
  method?: string;
  path?: Path;
  type?: string;
  body?: string;
  url?: string;
  header?: unknown;
  requestType?: string;
  response?: Response;
  save: boolean;
  requestInProgress: boolean;
}

export interface CurrentTab {
  id: string | null;
}
