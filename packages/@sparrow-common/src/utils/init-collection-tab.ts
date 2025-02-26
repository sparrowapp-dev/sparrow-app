import { v4 as uuidv4 } from "uuid";
import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import type { Tab } from "../types/workspace/tab";

class InitCollectionTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Collection mongo id
   * @param _workspaceId - Workspace Id to which Collection belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    if (!_id || !_workspaceId) {
      console.error("invalid id or workspace id on create new tab request!");
    } else {
      this._tab = {
        id: _id,
        tabId: uuidv4(),
        name: "New Collection",
        type: TabTypeEnum.COLLECTION,
        persistence: TabPersistenceTypeEnum.PERMANENT,
        description: "",
        source: "USER",
        activeSync: false,
        property: {
          collection: {
            id: "",
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
        isDeleted: false,
        timestamp: new Date().toString(),
      };
    }
  }
  public getValue(): CollectionTab {
    return this._tab;
  }
  public getSpacificValue(_value: string) {
    return this._tab[_value];
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
  public updateActiveSync(_activeSync: boolean) {
    this._tab.activeSync = _activeSync;
  }
  public updateTotalRequests(_totalRequest: number) {
    this._tab.property.totalRequests = _totalRequest;
  }
  public updateTotalFolder(_totalFolder: number) {
    this._tab.property.totalFolders = _totalFolder;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
}

export { InitCollectionTab };
