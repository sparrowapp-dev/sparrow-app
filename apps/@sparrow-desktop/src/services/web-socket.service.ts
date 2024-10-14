import {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
} from "@app/containers/api/api.common";

export class WebSocketService {
  public connectWebsocket = async (
    _url: string,
    _tabId: string,
    _headers: string,
  ) => {
    return connectWebSocket(_url, _tabId, _headers);
  };
  public disconnectWebsocket = async (_tabId: string) => {
    return disconnectWebSocket(_tabId);
  };
  public sendMessageWebsocket = async (_tabId: string, _message: string) => {
    return sendMessage(_tabId, _message);
  };
}
