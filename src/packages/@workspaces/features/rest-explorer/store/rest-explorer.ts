import { writable } from "svelte/store";

export type restExplorerData = {
  abortController: AbortController;
};

export const restExplorerDataStore = writable<Map<string, restExplorerData>>(
  new Map(),
);
