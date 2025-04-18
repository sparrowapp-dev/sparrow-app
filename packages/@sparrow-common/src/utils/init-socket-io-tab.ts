import { type KeyValueChecked } from "@sparrow/common/types/workspace";
import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
  type Path,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import {
  SocketDataTypeEnum,
  SocketSectionEnum,
  type EventsValues,
  type State,
} from "@sparrow/common/types/workspace/socket-io-request-tab";
import { v4 as uuidv4 } from "uuid";
import { SocketIORequestDefaultAliasBaseEnum } from "../types/workspace/socket-io-request-base";

class InitSocketIoTab {
  private generateWebSocketKey() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array as unknown as number[]));
  }
  private _tab: Tab;
  /**
   *
   * @param _id - Request mongo id
   * @param _workspaceId - Workspace Id to which Request belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: "New " + SocketIORequestDefaultAliasBaseEnum.NAME,
      type: TabTypeEnum.SOCKET_IO,
      persistence: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        socketio: {
          url: "",
          headers: [
            {
              key: "",
              value: "",
              checked: false,
            },
          ],
          events: [
            {
              event: "",
              listen: false,
            },
          ],
          queryParams: [
            {
              key: "",
              value: "",
              checked: false,
            },
          ],
          autoGeneratedHeaders: [
            {
              key: "Sec-WebSocket-Version",
              value: "13",
              checked: true,
            },
            {
              key: "Sec-WebSocket-Key",
              value: this.generateWebSocketKey(),
              checked: true,
            },
          ],
          message: "",
          eventName: "",
          state: {
            requestNavigation: SocketSectionEnum.MESSAGE,
            messageLanguage: SocketDataTypeEnum.TEXT,
            leftSplitterWidthPercentage: 50,
            rightSplitterWidthPercentage: 50,
            isSaveInProgress: false,
            isParameterBulkEditActive: false,
            isHeaderBulkEditActive: false,
          },
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
      },
      isSaved: true,
      index: 0,
      isActive: true,
      timestamp: new Date().toString(),
    };
    if (!_id || !_workspaceId) {
      console.error("invalid id or workspace id on create new tab web socket!");
    }
  }
  public getValue(): Tab {
    return this._tab;
  }
  public updateId(_id: string) {
    this._tab.id = _id;
    return this;
  }
  public updateTabType(type: TabPersistenceTypeEnum) {
    this._tab.persistence = type;
  }
  public updateName(_name: string) {
    this._tab.name = _name;
    return this;
  }
  public updateDescription(_description: string) {
    this._tab.description = _description;
    return this;
  }
  public updatePath(_path: Path) {
    this._tab.path = _path;
    return this;
  }
  public updateUrl(_url: string) {
    if (typeof _url !== "string") {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.url = _url;
    }

    return this;
  }
  public updateQueryParams(_queryParams: KeyValueChecked[]) {
    if (!_queryParams) {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.queryParams = _queryParams;
    }
    return this;
  }
  public updateHeaders(_headers: KeyValueChecked[]) {
    if (!_headers) {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.headers = _headers;
    }
    return this;
  }
  public updateEvents(_events: EventsValues[]) {
    if (!_events) {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.events = _events;
    }
    return this;
  }

  public updateEventName(_eventName: string) {
    if (!_eventName) {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.eventName = _eventName;
    }
    return this;
  }

  public updateMessage(_message: string) {
    if (typeof _message !== "string") {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.message = _message;
    }
    return this;
  }
  public updateAutoGeneratedHeaders(_autoGeneratedHeaders: KeyValueChecked[]) {
    if (!_autoGeneratedHeaders) {
      return this;
    }
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.autoGeneratedHeaders = _autoGeneratedHeaders;
    }
    return this;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
    return this;
  }
  public updateState(_state: Partial<State>) {
    if (this._tab?.property?.socketio) {
      this._tab.property.socketio.state = {
        ...this._tab.property.socketio.state,
        ..._state,
      };
    }
    return this;
  }
}

export { InitSocketIoTab };
