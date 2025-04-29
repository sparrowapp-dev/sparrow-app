import { v4 as uuidv4 } from "uuid";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { TabTypeEnum, type Path } from "@sparrow/common/types/workspace/tab";
import {
  TFDefaultEnum,
  type TFTabEdgeType,
  type TFTabNodeType,
} from "@sparrow/common/types/workspace/testflow";
import { CollectionItemTypeDtoEnum } from "../types/workspace/collection-dto";

class InitTestflowTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Test Flow mongo id
   * @param _workspaceId - Workspace Id to which Collection belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: TFDefaultEnum.NAME,
      type: TabTypeEnum.TESTFLOW,
      persistence: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      activeSync: false,
      property: {
        testflow: {
          nodes: [
            {
              id: "1",
              type: "startBlock",
              data: {
                blockName: "startBlock",
                collectionId: "",
                folderId: "",
                requestId: "",
                workspaceId: "",
                isDeleted: false,
                requestData: null,
              },
              position: { x: 100, y: 200 },
            },
          ],
          edges: [],
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
      console.error("invalid id or workspace id on create new tab test flow!");
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
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
  public setName(_name: string) {
    this._tab.name = _name;
  }

  public setNodes(_nodes: TFTabNodeType[]) {
    if (this._tab?.property?.testflow?.nodes) {
      this._tab.property.testflow.nodes = _nodes;
    }
  }
  public setEdges(_edges: TFTabEdgeType[]) {
    if (this._tab?.property?.testflow?.edges) {
      this._tab.property.testflow.edges = _edges;
    }
  }
}

export { InitTestflowTab };
