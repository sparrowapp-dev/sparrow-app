import { writable } from "svelte/store";

export type WebSocketData = {
  messages: {
    data: string;
    transmitter: string;
    timestamp: Date;
  }[];
  status: "connected" | "disconnected" | "inprogress";
};

export const webSocketDataStore = writable<Map<string, WebSocketData>>(
  new Map(),
);
