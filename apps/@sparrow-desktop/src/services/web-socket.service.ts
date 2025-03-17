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
    _signal: AbortSignal,
  ) => {
    return connectWebSocket(_url, _tabId, _headers, _signal);
  };
  public disconnectWebsocket = async (_tabId: string, signal: AbortSignal) => {
    return disconnectWebSocket(_tabId, signal);
  };
  public sendMessageWebsocket = async (_tabId: string, _message: string) => {
    return sendMessage(_tabId, _message);
  };
}
