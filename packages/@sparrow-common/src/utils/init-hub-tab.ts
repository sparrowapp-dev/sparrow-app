import {
  type Path,
  TabPersistenceTypeEnum,
  TabTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import type { Tab } from "../types/workspace/tab";
// import type { HubWrapper } from "../types/workspace/hub-tab";

class InitHubTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Request mongo id
   * @param _workspaceId - Workspace Id to which Hub belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: "Hub",
      type: TabTypeEnum.HUB,
      persistence: TabPersistenceTypeEnum.TEMPORARY,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        hub: {
          id: "",
          name: "",
          description: "",
          hubUrl: "",
          users: [
            {
              id: "",
              name: "",
              email: "",
              role: "",
            },
          ],
          xUrl: "",
          linkedinUrl: "",
          githubUrl: "",
          owner: "",
          createdAt: "",
          createdBy: "",
          updatedAt: "",
          updatedBy: "",
          logo: {},
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
      console.error("invalid id or workspace id on create new tab request!");
    }
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
  public updateHubProperty(hubProperty: any) {
    this._tab.property.hub = hubProperty;
  }
}

export { InitHubTab };
