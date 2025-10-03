import {
  TabTypeEnum,
  type Tab,
  type Path,
  TabPersistenceTypeEnum,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import { TestflowScheduleNavigatorEnum } from "../types/workspace/testflow-schedule-tab";
import {
  type RunConfigurationDTO,
  type NotificationDTO,
  type RunCycle,
} from "@sparrow/common/types/workspace/testflow-dto";

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
          environmentId: "",
          runConfiguration: {
            runCycle: "once",
            executeAt: "",
            time: "",
            intervalHours: 1,
            days: [],
          },
          notification: {
            emails: [],
            receiveNotifications: "failure",
          },
          state: {
            scheduleNavigator: TestflowScheduleNavigatorEnum.TEST_RESULTS,
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
  public updateState(_state: any) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.state = {
        ...this._tab.property.testflowSchedule.state,
        ..._state,
      };
    }
    return this;
  }
  public updateEnvironmentId(_environmentId: string) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.environmentId = _environmentId;
    }
    return this;
  }

  public updateRunConfiguration(
    _runConfiguration: Partial<RunConfigurationDTO>,
  ) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.runConfiguration = {
        ...this._tab.property.testflowSchedule.runConfiguration,
        ..._runConfiguration,
      };
    }
    return this;
  }

  public updateNotification(_notification: Partial<NotificationDTO>) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.notification = {
        ...this._tab.property.testflowSchedule.notification,
        ..._notification,
      };
    }
    return this;
  }

  public updateRunCycle(_runCycle: RunCycle) {
    if (this._tab.property.testflowSchedule) {
      this._tab.property.testflowSchedule.runConfiguration = {
        ...this._tab.property.testflowSchedule.runConfiguration,
        runCycle: _runCycle,
      };
    }
    return this;
  }

  public updateNotificationEmails(_emails: string[]) {
    if (this._tab.property.testflowSchedule?.notification) {
      this._tab.property.testflowSchedule.notification.emails = _emails;
    }
    return this;
  }
}

export { InitTestflowScheduleTab };
