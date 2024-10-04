import type { UnlistenFn } from "@tauri-apps/api/event";
import { writable } from "svelte/store";

export const webSocketListener = writable<Map<string, UnlistenFn>>(new Map());
