import { FolderDefault } from "@sparrow/common/enums";
import {
  type Path,
  TabPersistenceTypeEnum,
  TabTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import type { Tab } from "../types/workspace/tab";

class InitFolderTab {
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
      name: FolderDefault.NAME,
      type: TabTypeEnum.FOLDER,
      tabType: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        folder: {
          id: "",
        },
        totalRequests: 0,
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
      console.error("invalid id or workspace id on create new tab request!");
    }
  }
  public getValue(): FolderTab {
    return this._tab;
  }
  public getSpacificValue(_value: string) {
    return this._tab[_value];
  }
  public updateId(_id: string) {
    this._tab.id = _id;
  }
  public updateTabType(type: TabPersistenceTypeEnum) {
    this._tab.tabType = type;
  }
  public updateName(_name: string) {
    this._tab.name = _name;
  }
  public updateDescription(_description: string) {
    this._tab.description = _description;
  }
  public updateActiveSync(_activeSync: boolean) {
    this._tab.activeSync = _activeSync;
  }
  public updateSource(_source: string) {
    this._tab.source = _source;
  }
  public updateIsDeleted(_isDeleted: boolean) {
    this._tab.isDeleted = _isDeleted;
  }
  public updatePath(_path: Path) {
    this._tab.path = _path;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
}

export { InitFolderTab };
