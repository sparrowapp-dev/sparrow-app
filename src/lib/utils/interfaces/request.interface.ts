import type { Headers, QueryParams } from "../dto";
import type { ItemType } from "../enums/item-type.enum";
import type { RequestDataset, RequestType } from "../enums/request.enum";

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

export interface UrlEncoded {
  key: string;
  value: string;
  checked: boolean;
}

export interface FormData {
  key: string;
  value: string;
  checked: boolean;
}

export interface NewTab {
  id: string;
  name: string;
  type: ItemType.COLLECTION | ItemType.FOLDER | ItemType.REQUEST;
  request?: {
    method: string;
    body?: {
      raw?: string;
      urlencoded?: UrlEncoded[];
      formdata?: FormData[];
    };
    url?: string;
    headers?: Headers[];
    queryParams?: QueryParams[];
    response?: Response;
    additions?: {
      raw?:
        | RequestType.HTML
        | RequestType.JSON
        | RequestType.JavaScript
        | RequestType.Text
        | RequestType.XML;
      dataset?:
        | RequestDataset.FORMDATA
        | RequestDataset.NONE
        | RequestDataset.RAW
        | RequestDataset.URLENCODED;
    };
  };
  save: boolean;
  requestInProgress: boolean;
  path?: Path;
}

export interface CurrentTab {
  id: string | null;
}
