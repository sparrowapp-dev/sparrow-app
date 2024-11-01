import type { SocketIORequestOutputTabInterface } from "@sparrow/common/types/workspace/socket-io-request-tab";
import { writable } from "svelte/store";

export const socketIoDataStore = writable<
  Map<string, SocketIORequestOutputTabInterface>
>(new Map());
