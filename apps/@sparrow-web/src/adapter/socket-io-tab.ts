import { ContentTypeEnum } from "@sparrow/common/enums";
import { createDeepCopy } from "@sparrow/common/utils";
import { type Path, type Tab } from "@sparrow/common/types/workspace/tab";
import { RequestDataTypeEnum } from "@sparrow/common/types/workspace";
import { SocketDataTypeEnum } from "@sparrow/common/types/workspace/web-socket";
import { InitTab } from "@sparrow/common/factory";
import type { CollectionItemBaseInterface } from "@sparrow/common/types/workspace/collection-base";
import {
  type SocketIORequestBaseInterface,
  SocketIORequestBodyModeBaseEnum,
} from "@sparrow/common/types/workspace/socket-io-request-base";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class SocketIoTabAdapter {
  constructor() {}

  private setMessageType = (input: string): SocketDataTypeEnum => {
    let result = SocketDataTypeEnum.TEXT;
    switch (input) {
      case SocketIORequestBodyModeBaseEnum["application/json"]:
        result = SocketDataTypeEnum.JSON;
        break;
      case SocketIORequestBodyModeBaseEnum["application/xml"]:
        result = SocketDataTypeEnum.XML;
        break;
      case SocketIORequestBodyModeBaseEnum["text/plain"]:
        result = SocketDataTypeEnum.TEXT;
        break;
      case SocketIORequestBodyModeBaseEnum["text/html"]:
        result = SocketDataTypeEnum.HTML;
        break;
    }
    return result;
  };

  unsetMessageType = (input: string): SocketIORequestBodyModeBaseEnum => {
    let contentType = SocketIORequestBodyModeBaseEnum["text/plain"];
    switch (input) {
      case RequestDataTypeEnum.JSON:
        contentType = SocketIORequestBodyModeBaseEnum["application/json"];
        break;
      case RequestDataTypeEnum.XML:
        contentType = SocketIORequestBodyModeBaseEnum["text/html"];
        break;
      case RequestDataTypeEnum.HTML:
        contentType = SocketIORequestBodyModeBaseEnum["text/html"];
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = SocketIORequestBodyModeBaseEnum["text/plain"];
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
    _socket: CollectionItemBaseInterface,
  ): Tab {
    const socket = createDeepCopy(_socket);
    const path: Path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    const adaptedSocket = new InitTab()
      .socketIo(socket.id, workspaceId)
      .updateName(socket.name)
      .updateDescription(socket.description)
      .updateUrl(socket.socketio?.url)
      .updateQueryParams(socket.socketio?.queryParams)
      .updateEvents(socket.socketio?.events)
      .updateEventName(socket.socketio?.eventName)
      .updateHeaders(socket.socketio?.headers)
      .updateMessage(socket.socketio?.message)
      .updatePath(path);

    // parsing message type
    const selectedSocketBodyType = socket.socketio?.selectedSocketIOBodyType;
    if (selectedSocketBodyType) {
      const messageType = this.setMessageType(selectedSocketBodyType);
      adaptedSocket.updateState({
        messageLanguage: messageType,
      });
    }

    return adaptedSocket.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param _tab - request backend data
   * @returns
   */
  public unadapt(_tab: Partial<Tab>): SocketIORequestBaseInterface {
    const socketTab = createDeepCopy(_tab);
    const messageType = socketTab.property.socketio.state.messageLanguage;
    return {
      url: socketTab.property.socketio?.url,
      message: socketTab.property.socketio?.message,
      eventName: socketTab.property.socketio?.eventName,
      headers: socketTab.property.socketio?.headers,
      events: socketTab.property.socketio?.events,
      queryParams: socketTab.property.socketio?.queryParams,
      selectedSocketIOBodyType: this.unsetMessageType(messageType),
    };
  }
}
