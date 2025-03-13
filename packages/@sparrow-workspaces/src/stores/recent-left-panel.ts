import { writable } from "svelte/store";

export const isExpandCollection = writable<boolean>(false);
export const isExpandEnvironment = writable<boolean>(false);
export const isExpandTestflow = writable<boolean>(false);
export const isFirstCollectionExpand = writable<boolean>(false);

export const opendComponent = writable(new Map());