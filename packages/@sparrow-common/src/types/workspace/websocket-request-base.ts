interface WebsocketRequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface WebsocketRequestBaseInterface {
  url: string;
  message: string;
  queryParams: WebsocketRequestKeyValueCheckedBaseInterface[];
  headers: WebsocketRequestKeyValueCheckedBaseInterface[];
  selectedWebSocketBodyType: string;
}
