interface SocketIORequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export enum SocketIORequestDefaultAliasBaseEnum {
  NAME = "Socket.IO",
}

export interface SocketIORequestBaseInterface {
  url: string;
  message: string;
  queryParams: SocketIORequestKeyValueCheckedBaseInterface[];
  headers: SocketIORequestKeyValueCheckedBaseInterface[];
  selectedWebSocketBodyType: string;
}
