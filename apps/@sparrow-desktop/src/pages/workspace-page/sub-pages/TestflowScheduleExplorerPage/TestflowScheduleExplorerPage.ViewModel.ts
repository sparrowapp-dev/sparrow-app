// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  // CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Utils
import { createDeepCopy, Debounce } from "@sparrow/common/utils";

import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import {
  FolderTabAdapter,
  TestflowScheduleRunViewTabAdapter,
} from "@app/adapter";
import constants from "@app/constants/constants";
import { notifications } from "@sparrow/library/ui";
import { getSelfhostUrls } from "@app/utils/jwt";
import type { TestflowScheduleStateDto } from "@sparrow/common/types/workspace/testflow-schedule-tab";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { TestflowService } from "@app/services/testflow.service";
import { updateTestflowSchedules } from "@sparrow/common/store";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
// import { InitRequestTab } from "@sparrow/common/utils";

class MockHistoryExplorerPage {
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private testflowService = new TestflowService();
  private initTab = new InitTab();
  private environmentRepository = new EnvironmentRepository();

  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    t.persistence = TabPersistenceTypeEnum.PERMANENT;
    this.tab = t;
    this.getTestflow();
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

  public getTestflowObserver = (_testflowId: string) => {
    return this.testflowRepository.getTestflowObserver(_testflowId);
  };

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
      return selfhostBackendUrl;
    }

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getTestflow = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const response = await this.testflowService?.fetchTestflow(
      progressiveTab.path.testflowId,
    );
    if (response?.isSuccessful) {
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(
        progressiveTab?.path?.testflowId as string,
        schedules,
      );
    }
  };

  /**
   *
   * @param _state - request state
   */
  public updateScheduleState = async (_state: TestflowScheduleStateDto) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.testflowSchedule.state = {
      ...progressiveTab.property.testflowSchedule.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public runTestflowSchedule = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const baseUrl = await this.constructBaseUrl(
      progressiveTab.path.workspaceId,
    );
    const response = await this.testflowService.runTestflowSchedule(
      progressiveTab.path.workspaceId,
      progressiveTab.path.testflowId,
      progressiveTab.id,
      baseUrl,
    );
    if (response?.isSuccessful) {
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(
        progressiveTab?.path?.testflowId as string,
        schedules,
      );
    }
  };

  public deleteTestflowScheduleHistory = async(_scheduleHistoryId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
     const baseUrl = await this.constructBaseUrl(
        progressiveTab.path.workspaceId,
      );
    const response = await this.testflowService.deleteScheduleRunHistory(progressiveTab.path.workspaceId, progressiveTab.path.testflowId, progressiveTab.id, _scheduleHistoryId, baseUrl);
    if(response?.isSuccessful){
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(progressiveTab?.path?.testflowId as string, schedules);
    }
  }

    public updateTestflowSchedule = async() => {
      const progressiveTab = createDeepCopy(this._tab.getValue());
       const baseUrl = await this.constructBaseUrl(
          progressiveTab.path.workspaceId,
        );
      let payload={
        isActive: true
      }

      const response = await this.testflowService.updateTestflowSchedule(progressiveTab.path.workspaceId, progressiveTab.path.testflowId, progressiveTab.id, payload, baseUrl);
      if(response?.isSuccessful){
        const schedules = response.data.data.schedules;
        updateTestflowSchedules(progressiveTab?.id as string, schedules);
      }
    }
  public handleCreateTestflowSingleScheduleTab = (_scheduleResult) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const x = new TestflowScheduleRunViewTabAdapter().adapt(
      progressiveTab.path.workspaceId,
      _scheduleResult,
    );

    // const initTestflowScheduleRunViewTab = this.initTab.testflowScheduleRunView(
    //   _scheduleResult.id,
    //   progressiveTab.path.workspaceId,
    // );
    // initTestflowScheduleRunViewTab.updateName(
    //   `Result - ${progressiveTab.name}`,
    // );
    // initTestflowScheduleRunViewTab.setNodes(_scheduleResult.nodes);
    // initTestflowScheduleRunViewTab.setEdges(_scheduleResult.edges);
    // // initTestflowScheduleRunViewTab.setResult(result);
    // initTestflowScheduleRunViewTab.updatePath({
    //   workspaceId: progressiveTab.path.workspaceId,
    //   testflowId: progressiveTab.path.testflowId,
    // });
    this.tabRepository.createTab(x);
  };

  /**
   * Return active workspace of the user
   */
  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }
}

export default MockHistoryExplorerPage;
