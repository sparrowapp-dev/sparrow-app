import { v4 as uuidv4 } from "uuid";
import {
  TabPersistenceTypeEnum,
  TabTypeEnum,
  type Tab,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import {
  TestflowScheduleRunNavigatorEnum,
  TFScheduleRunDefaultEnum,
  type TestflowSchedularHistoryRequest,
  type TestFlowScheduleRunResult,
  type TestFlowScheduleRunResultItem,
} from "../types/workspace/testflow-schedule-run-tab";

class InitTestflowScheduleRun {
  private _tab: Tab;

  /**
   *
   * @param _id - Test Flow mongo id
   * @param _workspaceId - Workspace Id to which Collection belongs
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      label: "",
      tabId: uuidv4(),
      name: TFScheduleRunDefaultEnum.NAME,
      type: TabTypeEnum.TESTFLOW_SCHEDULE_RUN,
      persistence: TabPersistenceTypeEnum.PERMANENT,
      description: "",
      source: "USER",
      activeSync: false,
      property: {
        testflowScheduleRun: {
          scheduleId: "",
          scheduleName: "",
          testflowId: "",
          state: {
            scheduleNavigator: TestflowScheduleRunNavigatorEnum.TEST_RESULTS,
          },
          testresult: [],
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
  public setScheduleId(scheduleId: string): void {
    if (this._tab?.property?.testflowScheduleRun) {
      this._tab.property.testflowScheduleRun.scheduleId = scheduleId;
    }
  }

  public setScheduleName(scheduleName: string): void {
    if (this._tab?.property?.testflowScheduleRun) {
      this._tab.property.testflowScheduleRun.scheduleName = scheduleName;
    }
  }

  public setScheduleTestflowId(testflowId: string): void {
    if (this._tab?.property?.testflowScheduleRun) {
      this._tab.property.testflowScheduleRun.testflowId = testflowId;
    }
  }
  public setScheduleTestResult(
    testresult: TestFlowScheduleRunResultItem[],
  ): void {
    if (this._tab?.property?.testflowScheduleRun) {
      this._tab.property.testflowScheduleRun.testresult = testresult;
    }
  }
  
  public updateState(_state: any) {
    if (this._tab.property.testflowScheduleRun) {
      this._tab.property.testflowScheduleRun.state = {
        ...this._tab.property.testflowScheduleRun.state,
        ..._state,
      };
    }
    return this;
  }
}

export { InitTestflowScheduleRun };
