import { v4 as uuidv4 } from "uuid";
import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import type { Tab } from "../types/workspace/tab";

class InitWorkspaceTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Workspace mongo id
   * @param _workspaceId - Workspace Id to which Workspace belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: "My Workspace",
      type: TabTypeEnum.WORKSPACE,
      persistence: TabPersistenceTypeEnum.TEMPORARY,
      description: "",
      source: "USER",
      activeSync: false,
      property: {
        workspace: {},
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
      },
      isSaved: true,
      index: 0,
      isActive: true,
      isDeleted: false,
      timestamp: new Date().toString(),
    };
  }
  public getValue(): Tab {
    return this._tab;
  }
  public updateId(_id: string) {
    this._tab.id = _id;
  }
  public updateTabType(type: TabPersistenceTypeEnum) {
    this._tab.persistence = type;
  }
  public updateName(_name: string) {
    this._tab.name = _name;
  }
  public updateDescription(_description: string) {
    this._tab.description = _description;
  }
  public updatePath(_path: Path) {
    this._tab.path = _path;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
}

export { InitWorkspaceTab };
