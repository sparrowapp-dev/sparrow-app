import { writable } from "svelte/store";

export type WebSocketData = {
  messages: {
    data: string;
    transmitter: string;
    timestamp: Date;
    uuid: string;
  }[];
  status: "connected" | "disconnected" | "connecting" | "disconnecting";
  search: string;
  body: string;
  contentType: string;
};

export const webSocketDataStore = writable<Map<string, WebSocketData>>(
  new Map(),
);
