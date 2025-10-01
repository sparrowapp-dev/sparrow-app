import {
  TabTypeEnum,
  type Tab,
  type Path,
  TabPersistenceTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import { TestflowScheduleNavigatorEnum } from "../types/workspace/testflow-schedule-tab";
import type { TFTabEdgeType, TFTabNodeType } from "../types/workspace/testflow-tab";
import type { TestFlowScheduleRunResult } from "../types/workspace/testflow-schedule-run-view-tab";

class InitTestflowScheduleRunViewTab {
  private _tab: Tab;

  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      label: "",
      tabId: uuidv4(),
      name: "Result - New Scheduler",
      type: TabTypeEnum.TESTFLOW_SCHEDULE_RUN_VIEW,
      persistence: TabPersistenceTypeEnum.TEMPORARY,
      description: "[]",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        testflowScheduleRunView: {
          nodes: [],
          edges: [],
          result: {
            failedRequests: 0,
            successRequests: 0,
            totalTime: "0ms",
            status: "IDLE",
            requests: [],
            response: [],
          },
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
        testflowId: "",
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
    return this;
  }

  public updateTabType(type: TabPersistenceTypeEnum) {
    this._tab.persistence = type;
    return this;
  }

  public updateTestflowId(_testflowId: string) {
    this._tab.path.testflowId = _testflowId;
    return this;
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
    this._tab.path = {
      ...this._tab.path,
      ..._path,
    };
    return this;
  }

  // 🔹 Helpers for testflowScheduleRunView
  public setNodes(nodes: TFTabNodeType[]) {
    if (this._tab.property.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.nodes = nodes;
    }
    return this;
  }

  public setEdges(edges: TFTabEdgeType[]) {
    if (this._tab.property.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.edges = edges;
    }
    return this;
  }

  public setResult(result: TestFlowScheduleRunResult) {
    if (this._tab.property.testflowScheduleRunView) {
      this._tab.property.testflowScheduleRunView.result = result;
    }
    return this;
  }
}

export { InitTestflowScheduleRunViewTab };
