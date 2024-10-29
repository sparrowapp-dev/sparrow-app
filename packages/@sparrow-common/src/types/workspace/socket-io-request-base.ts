interface SocketioRequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface SocketioRequestBaseInterface {
  url: string;
  message: string;
  queryParams: SocketioRequestKeyValueCheckedBaseInterface[];
  headers: SocketioRequestKeyValueCheckedBaseInterface[];
  selectedWebSocketBodyType: string;
}
