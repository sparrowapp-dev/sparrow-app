import type { WorkspaceUserAgentBaseEnum } from "@sparrow/common/types/workspace/workspace-base";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { writable } from "svelte/store";

export type WebSocketMessage = {
  data: string;
  transmitter: string;
  timestamp: string;
  uuid: string;
};
export type WebSocketData = {
  messages: WebSocketMessage[];
  agent: WorkspaceUserAgentBaseEnum;
  status: "connected" | "disconnected" | "connecting" | "disconnecting";
  search: string;
  body: string;
  contentType: string;
  url: string;
  filter: "All Messages" | "Sent" | "Received";
  listener?: any;
};

export const webSocketDataStore = writable<Map<string, WebSocketData>>(
  new Map(),
);
