import type { TFDataStoreType } from "@sparrow/common/types/workspace/testflow";
import { writable } from "svelte/store";

export const testFlowDataStore = writable<Map<string, TFDataStoreType>>(
  new Map(),
);
