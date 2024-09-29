import type { ItemType } from "../enums/item-type.enum";
import type { RequestMethod } from "../enums/request.enum";

/* eslint-disable @typescript-eslint/no-explicit-any */
export enum BodyModeEnum {
  "application/json" = "application/json",
  "application/xml" = "application/xml",
  "application/x-www-form-urlencoded" = "application/x-www-form-urlencoded",
  "multipart/form-data" = "multipart/form-data",
}

export enum SourceTypeEnum {
  SPEC = "SPEC",
  USER = "USER",
}

export interface RequestBody {
  type: BodyModeEnum;
  schema?: Record<string, any>;
}

export interface Params {
  name: string;
  description: string;
  required: boolean;
  schema?: Record<string, any>;
}

export interface RequestMetaData {
  method: RequestMethod;
  operationId: string;
  url: string;
  body?: RequestBody[];
  queryParams?: Params[];
  pathParams?: Params[];
  headers?: Params[];
  auth?: any;
}

export interface CollectionItem {
  id?: string;
  name: string;
  description?: string;
  type: ItemType;
  source?: SourceTypeEnum;
  items?: CollectionItem[];
  request?: RequestMetaData;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Collection {
  name: string;
  totalRequests: number;
  uuid?: string;
  items: CollectionItem[];
  activeSync?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CollectionDto {
  id: string;
  name: string;
}
