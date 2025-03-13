import type { Socket } from "socket.io-client";
import { writable } from "svelte/store";

export const socketStore = writable<Socket | null>(null);
export const isExpandCollection = writable<boolean>(false);
export const isExpandEnvironment = writable<boolean>(false);
export const isExpandTestflow = writable<boolean>(false);
export const isFirstCollectionExpand = writable<boolean>(false);

export const opendComponent = writable(new Map());