import type { CollectionItemsDto } from "@common/types/workspace";
import { writable } from "svelte/store";
export type KeyValuePair = {
  key: string;
  value: string;
  checked: boolean;
};
export type Response = {
  headers: KeyValuePair[];
  status: string;
  body: string;
  time: number;
  size: number;
};
export type nodes = {
  id: string;
  response: Response;
  request: CollectionItemsDto
};

type Request = {
  method: string;
  name: string;
  status: string;
  time: string;
};

export type TFHistoryType = {
  status: "pass" | "fail";
  successRequests: string;
  failedRequests: string;
  totalTime: string;
  timestamp: string;
  requests: Request[];
  expand: boolean;
};

export type TestFlowData = {
  nodes: nodes[];
  history: History[];
  isRunHistoryEnable: boolean;
};

export const testFlowDataStore = writable<Map<string, TestFlowData>>(new Map());
