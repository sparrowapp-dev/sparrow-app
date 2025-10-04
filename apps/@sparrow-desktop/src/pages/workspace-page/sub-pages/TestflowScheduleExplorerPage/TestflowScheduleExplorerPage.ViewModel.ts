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
import { createDeepCopy, Debounce, scrollToTab } from "@sparrow/common/utils";

import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import {
  FolderTabAdapter,
  TestflowScheduleRunViewTabAdapter,
  TestflowTabAdapter,
} from "@app/adapter";
import constants from "@app/constants/constants";
import { notifications } from "@sparrow/library/ui";
import { getSelfhostUrls } from "@app/utils/jwt";
import type { TestflowScheduleStateDto } from "@sparrow/common/types/workspace/testflow-schedule-tab";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { TestflowService } from "@app/services/testflow.service";
import {
  testflowSchedules,
  updateTestflowSchedules,
} from "@sparrow/common/store";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
// import { InitRequestTab } from "@sparrow/common/utils";

class MockHistoryExplorerPage {
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private testflowService = new TestflowService();
  private initTab = new InitTab();
  private environmentRepository = new EnvironmentRepository();

  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});
  private testflowScheduleStore;
  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    t.persistence = TabPersistenceTypeEnum.PERMANENT;
    testflowSchedules.subscribe((_testflowScheduleStoreMap) => {
      if (_testflowScheduleStoreMap) {
        const testflowStore = _testflowScheduleStoreMap?.get(
          t?.path?.testflowId,
        );
        this.testflowScheduleStore = testflowStore?.find((s) => s.id === t?.id);
      }
    });

    this.tab = t;
    this.getTestflow();
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  /**
   * Compares the current schedule tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  /**
   * Compares the current schedule tab with the stored server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of comparisons.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareScheduleWithServerDebounced = async () => {
    try {
      let result = true;
      const progressiveTab = createDeepCopy(this._tab.getValue());

      if (
        !progressiveTab?.property?.testflowSchedule ||
        !this.testflowScheduleStore
      ) {
        // If we don't have both pieces of data, we can't compare
        return;
      }

      // Compare name
      if (this.testflowScheduleStore.name !== progressiveTab.name) {
        result = false;
      }

      // Compare environment ID
      if (
        this.testflowScheduleStore.environmentId !==
        progressiveTab.property.testflowSchedule.environmentId
      ) {
        result = false;
      }

      // Compare run configuration
      const tabRunConfig =
        progressiveTab.property.testflowSchedule.runConfiguration;
      const serverRunConfig = this.testflowScheduleStore.runConfiguration;

      if (!this.deepEqual(tabRunConfig, serverRunConfig)) {
        result = false;
      }

      // Compare notification settings
      const tabNotification =
        progressiveTab.property.testflowSchedule.notification;
      const serverNotification = this.testflowScheduleStore.notification;

      if (!this.deepEqual(tabNotification, serverNotification)) {
        result = false;
      }

      // Update the isSaved property based on comparison result
      if (result) {
        progressiveTab.isSaved = true;
        this.tab = progressiveTab;
        await this.tabRepository.updateTab(progressiveTab.tabId, {
          isSaved: true,
        });
      } else {
        progressiveTab.isSaved = false;
        progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
        this.tab = progressiveTab;
        await this.tabRepository.updateTab(progressiveTab.tabId, {
          isSaved: false,
        });
      }
    } catch (error) {
      console.error("Error comparing schedule with server:", error);
    }
  };
  /**
   * Debounced method to compare the current schedule tab with the server version.
   */
  private compareScheduleWithServer = new Debounce().debounce(
    this.compareScheduleWithServerDebounced,
    500,
  );

  /**
   * Deep comparison utility for comparing objects
   */
  private deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((item, index) => this.deepEqual(item, obj2[index]));
    }

    if (typeof obj1 === "object" && typeof obj2 === "object") {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      return keys1.every(
        (key) => keys2.includes(key) && this.deepEqual(obj1[key], obj2[key]),
      );
    }

    return obj1 === obj2;
  }

  /**
   * Return active workspace of the user
   */
  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
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

  public refreshTestflowSchedule = async () => {
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

  public deleteTestflowScheduleHistory = async (_scheduleHistoryId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const baseUrl = await this.constructBaseUrl(
      progressiveTab.path.workspaceId,
    );
    const response = await this.testflowService.deleteScheduleRunHistory(
      progressiveTab.path.workspaceId,
      progressiveTab.path.testflowId,
      progressiveTab.id,
      _scheduleHistoryId,
      baseUrl,
    );
    if (response?.isSuccessful) {
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(
        progressiveTab?.path?.testflowId as string,
        schedules,
      );
      this.tabRepository.removeTab(_scheduleHistoryId);
    }
  };

  /**
   * Updates the testflow schedule configuration and persists to database
   * @param updatedSchedule - The updated schedule configuration data
   * @returns Promise with operation result
   */
  public updateTestflowSchedule = async (updatedSchedule: any = {}) => {
    try {
      const progressiveTab = createDeepCopy(this._tab.getValue());
      const baseUrl = await this.constructBaseUrl(
        progressiveTab.path.workspaceId,
      );
      // Prepare payload for API
      const payload = {
        name: progressiveTab.name,
        environmentId: progressiveTab.property.testflowSchedule.environmentId,
        runConfiguration:
          progressiveTab.property.testflowSchedule.runConfiguration,
        notification: progressiveTab.property.testflowSchedule.notification,
      };

      // Send to server
      const response = await this.testflowService.updateTestflowSchedule(
        progressiveTab.path.workspaceId,
        progressiveTab.path.testflowId,
        progressiveTab.id,
        payload,
        baseUrl,
      );

      if (response?.isSuccessful) {
        const schedules = response.data.data.schedules;
        updateTestflowSchedules(
          progressiveTab?.path?.testflowId as string,
          schedules,
        );
        // Mark tab as saved after successful save
        progressiveTab.isSaved = true;
        this.tab = progressiveTab;
        await this.tabRepository.updateTab(progressiveTab.tabId, {
          isSaved: true,
        });
        notifications.success(
          `'${progressiveTab.name}' schedule saved successfully.`,
        );
        return { success: true };
      } else {
        notifications.error("Failed to save schedule. Please try again.");
        return {
          success: false,
          error: response?.data?.message || "Failed to save schedule",
        };
      }
    } catch (error) {
      notifications.error("Failed to save schedule. Please try again.");
      console.error("Error saving schedule:", error);
      return {
        success: false,
        error: "An unexpected error occurred while saving the schedule",
      };
    }
  };

  public handleCreateTestflowSingleScheduleTab = (
    _scheduleResult: any,
    schedule: any,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const x = new TestflowScheduleRunViewTabAdapter().adapt(
      progressiveTab.path.workspaceId,
      _scheduleResult,
      schedule.name,
      progressiveTab.id,
      progressiveTab.path.testflowId
    );

    this.tabRepository.createTab(x);
  };

  /**
   * Updates the testflow schedule tab data with the provided configuration
   * This only updates the local tab data and doesn't save to the server
   * @param updatedSchedule - The updated schedule configuration
   */
  public updateScheduleTab = async (updatedSchedule) => {
    // Get current tab state
    const progressiveTab = createDeepCopy(this._tab.getValue());

    // Update tab name if provided
    if (updatedSchedule.name) {
      progressiveTab.name = updatedSchedule.name;
    }

    // Update environment ID if provided
    if (updatedSchedule.environmentId !== undefined) {
      if (progressiveTab.property.testflowSchedule) {
        progressiveTab.property.testflowSchedule.environmentId =
          updatedSchedule.environmentId;
      }
    }

    // Update run configuration if provided
    if (updatedSchedule.runConfiguration) {
      if (progressiveTab.property.testflowSchedule) {
        progressiveTab.property.testflowSchedule.runConfiguration = {
          ...progressiveTab.property.testflowSchedule.runConfiguration,
          ...updatedSchedule.runConfiguration,
        };
      }
    }

    // Update notification settings if provided
    if (updatedSchedule.notification) {
      if (progressiveTab.property.testflowSchedule) {
        progressiveTab.property.testflowSchedule.notification = {
          ...progressiveTab.property.testflowSchedule.notification,
          ...updatedSchedule.notification,
        };
      }
    }

    // Update the tab in memory
    this.tab = progressiveTab;

    // Update the tab in the repository
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // Compare with server to update isSaved state
    this.compareScheduleWithServer();

    return { success: true };
  };
  public editTestflowSchedule = async (isActive: boolean) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const baseUrl = await this.constructBaseUrl(
      progressiveTab.path.workspaceId,
    );
    let payload = {
      isActive: isActive,
    };

    const response = await this.testflowService.updateTestflowSchedule(
      progressiveTab.path.workspaceId,
      progressiveTab.path.testflowId,
      progressiveTab.id,
      payload,
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

  /**
   * Handles the opening of a Testflow by reading the associated workspace,
   * initializing a new Testflow tab, and creating the tab in the repository.
   *
   * @param _testflow - The Testflow document containing the workspace and flow data.
   * @returns - A promise that resolves when the Testflow has been opened and the tab created.
   */
  public handleOpenTestflow = async (_id: string): Promise<void> => {
    const testflowRxDoc = await this.testflowRepository.readTestflow(_id);
    const testflowJSON = testflowRxDoc.toMutableJSON();
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflowJSON.workspaceId,
    );
    const testflowTab = new TestflowTabAdapter().adapt(
      currentWorkspace._id,
      testflowJSON,
    );
    this.tabRepository.createTab(testflowTab);
    scrollToTab(testflowTab.id);
  };

  /**
   * @description - creates new local environment tab
   * @param env - environment that needs to be opened
   */
  public handleOpenEnvironment = async (_id: string) => {
    const environmentRxDoc =
      await this.environmentRepository.readEnvironment(_id);
    const environmentJSON = environmentRxDoc.toMutableJSON();
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      environmentJSON.workspaceId,
    );

    const initEnvironmentTab = this.initTab.environment(
      environmentJSON.id,
      currentWorkspace._id,
    );
    initEnvironmentTab
      .setName(environmentJSON.name)
      .setVariable(environmentJSON.variable);
    initEnvironmentTab.setTabType(TabPersistenceTypeEnum.TEMPORARY);

    this.tabRepository.createTab(initEnvironmentTab.getValue());
    scrollToTab(initEnvironmentTab.getValue().id);
  };
}

export default MockHistoryExplorerPage;
