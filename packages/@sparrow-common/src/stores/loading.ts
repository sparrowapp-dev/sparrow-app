import { writable } from "svelte/store";

// Create the writable store with an initial empty object
export const loadingState = writable<Map<string | number, boolean>>(new Map());
