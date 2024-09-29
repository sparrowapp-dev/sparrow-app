import { ContentTypeEnum } from "@sparrow/common/enums";
import { createDeepCopy } from "@sparrow/common/utils";
import {
  RequestDataTypeEnum,
  type CollectionItemsDto,
  type Path,
  type Tab,
} from "@sparrow/common/types/workspace";
import { SocketDataTypeEnum } from "@sparrow/common/types/workspace/web-socket";
import { InitWebSocketTab } from "@sparrow/common/utils";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class SocketTabAdapter {
  constructor() {}

  private setMessageType = (input: string) => {
    let result = SocketDataTypeEnum.TEXT;
    switch (input) {
      case ContentTypeEnum["application/json"]:
        result = SocketDataTypeEnum.JSON;
        break;
      case ContentTypeEnum["application/xml"]:
        result = SocketDataTypeEnum.XML;
        break;
      case ContentTypeEnum["application/javascript"]:
        result = SocketDataTypeEnum.JAVASCRIPT;
        break;
      case ContentTypeEnum["text/plain"]:
        result = SocketDataTypeEnum.TEXT;
        break;
      case ContentTypeEnum["text/html"]:
        result = SocketDataTypeEnum.HTML;
        break;
    }
    return result;
  };

  unsetMessageType = (input: string) => {
    let contentType: ContentTypeEnum = ContentTypeEnum["text/plain"];
    switch (input) {
      case RequestDataTypeEnum.JSON:
        contentType = ContentTypeEnum["application/json"];
        break;
      case RequestDataTypeEnum.XML:
        contentType = ContentTypeEnum["application/xml"];
        break;
      case RequestDataTypeEnum.HTML:
        contentType = ContentTypeEnum["text/html"];
        break;
      case RequestDataTypeEnum.JAVASCRIPT:
        contentType = ContentTypeEnum["application/javascript"];
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = ContentTypeEnum["text/plain"];
        break;
    }
    return contentType;
  };

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
    _socket: CollectionItemsDto,
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

    // parsing message type
    const selectedSocketBodyType = socket.websocket?.selectedWebSocketBodyType;
    if (selectedSocketBodyType) {
      const messageType = this.setMessageType(selectedSocketBodyType);
      adaptedSocket.updateState({
        socketMessageLanguage: messageType,
      });
    }

    return adaptedSocket.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param _tab - request backend data
   * @returns
   */
  public unadapt(_tab: Partial<Tab>) {
    const socketTab = createDeepCopy(_tab);
    const messageType =
      socketTab.property.websocket.state.socketMessageLanguage;
    return {
      url: socketTab.property.websocket?.url,
      message: socketTab.property.websocket?.message,
      headers: socketTab.property.websocket?.headers,
      queryParams: socketTab.property.websocket?.queryParams,
      selectedWebSocketBodyType: this.unsetMessageType(messageType),
    };
  }
}
