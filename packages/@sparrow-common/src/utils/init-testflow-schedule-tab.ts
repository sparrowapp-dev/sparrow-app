import {
  TabTypeEnum,
  type Tab,
  type Path,
  TabPersistenceTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";

class InitTestflowScheduleTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Request mongo id
   * @param _workspaceId - Workspace Id to which Request belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      label: "",
      tabId: uuidv4(),
      name: "New " + "Scheduler",
      type: TabTypeEnum.TESTFLOW_SCHEDULE,
      persistence: TabPersistenceTypeEnum.TEMPORARY,
      description: "[]",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        testflowSchedule: {
          scheduleId: "",
          state: {}
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
  public updatePath(_path: Path) {
    this._tab.path = _path;
  }
  public updateTestflowScheduleId(_id: string) {
    if (_id && this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.scheduleId = _id;
    }
  }
    public updateState(_state: any) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.state = {
        ...this._tab.property.testflowSchedule.state,
        ..._state,
      };
    }
  }
}

export { InitTestflowScheduleTab };
