import { writable } from "svelte/store";

export type restExplorerData = {
  abortController: AbortController;
  response: {
    body: string;
    headers: any[];
    status: string;
    time: number;
    size: number;
    navigation: string;
    bodyLanguage: string;
    bodyFormatter: string;
  };
  isSendRequestInProgress: boolean;
};

export const restExplorerDataStore = writable<Map<string, restExplorerData>>(
  new Map(),
);
