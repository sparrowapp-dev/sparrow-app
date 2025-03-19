import { writable } from "svelte/store";

export type TabsStore = Record<string, boolean>;

// Create the writable store with an initial empty object
export const saveTabs = writable<TabsStore>({});
