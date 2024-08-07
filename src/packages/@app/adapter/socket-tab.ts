import {
  createDeepCopy,
  setAuthType,
  setBodyType,
  unsetAuthType,
  unsetBodyType,
} from "$lib/utils/helpers";
import {
  RequestDatasetEnum,
  type FormData,
  type Path,
  type RequestTab,
  type Tab,
} from "@common/types/workspace";
import { InitRequestTab, InitWebSocketTab } from "@common/utils";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class SocketTabAdapter {
  constructor() {}

  /**
   * @description - parse backend data to frontend compatible
   * @param workspaceId - workspace id
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param socket - request tab frontend data
   * @returns
   */
  public adapt(
    workspaceId: string,
    collectionId: string,
    folderId: string,
    _socket: any,
  ): Tab {
    const socket = createDeepCopy(_socket);
    const adaptedSocket = new InitWebSocketTab(socket.id, workspaceId);
    const path: Path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    adaptedSocket.updateName(socket.name);
    adaptedSocket.updateDescription(socket.description);
    adaptedSocket.updateUrl(socket.websocket?.url);
    adaptedSocket.updateQueryParams(socket.websocket?.queryParams);
    adaptedSocket.updateHeaders(socket.websocket?.headers);
    adaptedSocket.updateMessage(socket.websocket?.message);
    adaptedSocket.updatePath(path);

    return adaptedSocket.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param _tab - request backend data
   * @returns
   */
  public unadapt(_tab: Tab) {
    const socketTab = createDeepCopy(_tab);
    return {
      url: socketTab.property.websocket?.url,
      message: socketTab.property.websocket?.message,
      headers: socketTab.property.websocket?.headers,
      queryParams: socketTab.property.websocket?.queryParams,
    };
  }
}
