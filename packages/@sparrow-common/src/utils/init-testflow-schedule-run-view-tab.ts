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
import type { TestFlowScheduleRunResult } from "../types/workspace/testflow-schedule-run-view-tab";

class InitTestflowScheduleRunViewTab {
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
      type: TabTypeEnum.TESTFLOW_SCHEDULE_RUN_VIEW,
      persistence: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      activeSync: false,
      property: {
        testflowScheduleRunView: {
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
          result: {
            failedRequests: 0,
            successRequests: 0,
            totalTime: "0ms",
            status: "IDLE",
            requests: [],
            response: [],
          },
          isScheduled:false,
          scheduleName:"",
          lastestExecuted:"",
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
        testflowId: "",
        testflowScheduleId: ""
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
    this._tab.path = {
      ...this._tab.path,
      ..._path,
    };
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

  public setScheduleName(_scheduleName:string){
    if (this._tab?.property?.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.scheduleName = _scheduleName;
    }
  }

  public setIsScheduled(_isScheduled:boolean){
    if (this._tab?.property?.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.isScheduled = _isScheduled;
    }
  }

  public setLastestTime(_lastedExecuted:string){
    if (this._tab?.property?.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.lastestExecuted = _lastedExecuted;
    }
  }

  public setNodes(_nodes: TFTabNodeType[]) {
    if (this._tab?.property?.testflowScheduleRunView?.nodes) {
      this._tab.property.testflowScheduleRunView.nodes = _nodes;
    }
  }
  public setEdges(_edges: TFTabEdgeType[]) {
    if (this._tab?.property?.testflowScheduleRunView?.edges) {
      this._tab.property.testflowScheduleRunView.edges = _edges;
    }
  }
  public setResult(_result:TestFlowScheduleRunResult){
    if (this._tab?.property?.testflowScheduleRunView?.edges) {
      this._tab.property.testflowScheduleRunView.result = _result;
    }
  }
}



export { InitTestflowScheduleRunViewTab };
