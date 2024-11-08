export enum WebSocketRequestBodyModeDtoEnum {
  NONE = "none",
  JSON = "application/json",
  XML = "application/xml",
  TEXT = "text/plain",
  HTML = "text/html",
}

export interface WebSocketRequestKeyValueDtoInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface WebSocketRequestMetaDataDtoInterface {
  url: string;
  message?: string;
  selectedWebSocketBodyType?: WebSocketRequestBodyModeDtoEnum;
  queryParams?: WebSocketRequestKeyValueDtoInterface[];
  headers?: WebSocketRequestKeyValueDtoInterface[];
}
