import { v4 as uuidv4 } from "uuid";
import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import type { Tab } from "../types/workspace/tab";
import { CollectionAddToBaseEnum, CollectionAuthTypeBaseEnum } from "../types/workspace/collection-base";
import { CollectionNavigationTabEnum, type State, type Auth } from "../types/workspace/collection-tab";

class InitCollectionTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Collection mongo id
   * @param _workspaceId - Workspace Id to which Collection belongs to
   */
  constructor(_id: string, _workspaceId: string) {
   
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
            auth: {
              bearerToken: "",
              basicAuth: {
                username: "",
                password: "",
              },
              apiKey: {
                authKey: "",
                authValue: "",
                addTo: CollectionAddToBaseEnum.HEADER,
              },
            },
            state : {
              collectionAuthNavigation: CollectionAuthTypeBaseEnum.NO_AUTH,
              collectionNavigation: CollectionNavigationTabEnum.OVERVIEW,
            }
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
  public updatePath(_path: Path) {
    this._tab.path = _path;
  }
  public updateActiveSync(_activeSync: boolean) {
    this._tab.activeSync = _activeSync;
  }

  public updateState(_state: Partial<State>) {
    if (this._tab?.property?.collection) {
      this._tab.property.collection.state = {
        ...this._tab.property.collection.state,
        ..._state,
      };
    }
  }
  public updateAuth(_auth: Auth) {
    if (_auth && this._tab.property.collection) {
      this._tab.property.collection.auth = _auth;
    }
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
}

export { InitCollectionTab };
