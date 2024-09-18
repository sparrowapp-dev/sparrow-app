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
};
export type TestFlowData = {
  nodes: nodes[];
};

export const testFlowDataStore = writable<Map<string, TestFlowData>>(new Map());
