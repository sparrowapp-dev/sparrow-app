import type { Headers, QueryParams } from "../dto";
import type { ItemType } from "../enums/item-type.enum";

export interface Path {
  workspaceId: string;
  collectionId: string;
  folderId?: string;
  folderName?: string;
}

export interface Response {
  headers: unknown;
  status: string;
  body: string;
}

export interface RequestBody {
  method: string;
  url?: string;
  body?: string;
  headers?: Headers[];
  queryParams?: QueryParams[];
}

export interface NewTab {
  id: string;
  name: string;
  type: ItemType.COLLECTION | ItemType.FOLDER | ItemType.REQUEST;
  request?: {
    method: string;
    body?: string;
    url?: string;
    headers?: unknown;
    queryParams?: unknown;
    response?: Response;
  };
  save: boolean;
  requestInProgress: boolean;
  path?: Path;
}

export interface CurrentTab {
  id: string | null;
}
