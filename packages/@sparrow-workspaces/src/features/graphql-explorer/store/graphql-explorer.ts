import { writable } from "svelte/store";

export type graphqlExplorerData = {
  abortController: AbortController;
  response: {
    body: string;
    headers: any[];
    status: string;
    time: number;
    size: number;
    navigation: string;
  };
  isSendRequestInProgress: boolean;
};

export const graphqlExplorerDataStore = writable<
  Map<string, graphqlExplorerData>
>(new Map());
