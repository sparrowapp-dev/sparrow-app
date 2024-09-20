import type { RequestDataTypeEnum, Tab } from "@common/types/workspace";
import { writable } from "svelte/store";
export type KeyValuePair = {
  key: string;
  value: string;
  checked: boolean;
};

export type TFKeyValueStoreType = {
  key: string;
  value: string;
};

export type TFHistoryAPIResponseStoreType = {
  headers: TFKeyValueStoreType[];
  status: string;
  body: string;
  time: number;
  size: number;
  responseContentType?: RequestDataTypeEnum;
};
export type TFNodeStoreType = {
  id: string;
  response: TFHistoryAPIResponseStoreType;
  request: Tab;
};

export type TFAPIStoreType = {
  method: string;
  name: string;
  status: string;
  time: string;
};

export type TFHistoryStoreType = {
  status: "pass" | "fail";
  successRequests: string;
  failedRequests: string;
  totalTime: string;
  timestamp: string;
  requests: TFAPIStoreType[];
  expand: boolean;
};

export type TFDataStoreType = {
  nodes: TFNodeStoreType[];
  history: TFHistoryStoreType[];
  isRunHistoryEnable: boolean;
};

export const testFlowDataStore = writable<Map<string, TFDataStoreType>>(
  new Map(),
);
