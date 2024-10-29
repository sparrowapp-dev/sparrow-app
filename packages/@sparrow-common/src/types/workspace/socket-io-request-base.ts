interface SocketIORequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface SocketIORequestBaseInterface {
  url: string;
  message: string;
  queryParams: SocketIORequestKeyValueCheckedBaseInterface[];
  headers: SocketIORequestKeyValueCheckedBaseInterface[];
  selectedWebSocketBodyType: string;
}
