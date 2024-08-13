import {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
} from "$lib/api/api.common";

export class WebSocketService {
  public connectWebsocket = async (
    _url: string,
    _tabId: string,
    _headers: string,
  ) => {
    return connectWebSocket(_url, _tabId, _headers);
  };
  public disconnectWebsocket = async (_tabId: string, _url: string) => {
    return disconnectWebSocket(_tabId, _url);
  };
  public sendMessageWebsocket = async (_tabId: string, _message: string) => {
    return sendMessage(_tabId, _message);
  };
}
