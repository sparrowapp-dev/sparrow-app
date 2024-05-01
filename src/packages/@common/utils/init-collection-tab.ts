import type { Path } from "$lib/utils/interfaces/request.interface";
import { v4 as uuidv4 } from "uuid";
import { ItemType } from "$lib/utils/enums";
import type { CollectionTab } from "@common/types/rest-explorer";

class InitCollectionTab {
  private _tab: CollectionTab;
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
        type: ItemType.COLLECTION,
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
        timestamp: new Date().toString(),
      };
    }
  }
  public getValue(): TabDocument {
    return this._tab;
  }
  public getSpacificValue(_value: string) {
    return this._tab[_value];
  }
  public updateId(_id: string) {
    this._tab.id = _id;
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
  public updateTotalRequest(_totalRequest: number) {
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
