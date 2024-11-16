interface SocketIORequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export enum SocketIORequestDefaultAliasBaseEnum {
  NAME = "Socket.IO",
}

export interface SocketIORequestEventBaseInterface {
  event: string;
  listen: boolean;
}

export enum SocketIORequestBodyModeBaseEnum {
  "none" = "none",
  "application/json" = "application/json",
  "application/xml" = "application/xml",
  "text/plain" = "text/plain",
  "text/html" = "text/html",
}
export interface SocketIORequestBaseInterface {
  url: string;
  message: string;
  eventName: string;
  events: SocketIORequestEventBaseInterface[];
  queryParams: SocketIORequestKeyValueCheckedBaseInterface[];
  headers: SocketIORequestKeyValueCheckedBaseInterface[];
  selectedSocketIOBodyType: SocketIORequestBodyModeBaseEnum;
}
