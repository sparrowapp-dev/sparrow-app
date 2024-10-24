import { notifications } from "@sparrow/library/ui";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
import { TabRepository } from "../../repositories/tab.repository";
import { TestflowRepository } from "../../repositories/testflow.repository";
import type { TFRxDocumentType } from "../../models/testflow.model";
import { TFDefaultEnum } from "@sparrow/common/types/workspace/testflow";
import { TestflowService } from "../../services/testflow.service";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import type { Tab } from "@sparrow/common/types/workspace";

import { createDeepCopy } from "@sparrow/common/utils";
import {
  currentStep,
  isFirstTimeInTestFlow,
  isTestFlowTourGuideOpen,
} from "@sparrow/workspaces/stores";

export class TestflowViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private tabRepository = new TabRepository();
  private initTab = new InitTab();
  private guestUserRepository = new GuestUserRepository();
  private testflowService = new TestflowService();

  constructor() {}

  /**
   * Retrieves an observable of the current Testflows from the repository.
   *
   * @returns An observable that provides the current list of Testflows.
   */
  public get testflows() {
    return this.testflowRepository.getTestflowsObserver();
  }

  /**
   * Generates the next available name for a new Testflow by checking the existing list
   * of Testflows and appending a number if necessary.
   *
   * @param list - The list of existing Testflow documents.
   * @param name - The base name for the new Testflow.
   * @returns The next available name for the new Testflow.
   */
  private getNextTestflow: (list: TFRxDocumentType[], name: string) => string =
    (list, name) => {
      const isNameAvailable: (proposedName: string) => boolean = (
        proposedName,
      ) => {
        return list.some((element) => {
          return element.name === proposedName;
        });
      };

      if (!isNameAvailable(name)) return name;

      for (let i = 2; i < list.length + 10; i++) {
        const proposedName: string = `${name} ${i}`;
        if (!isNameAvailable(proposedName)) return proposedName;
      }
      return "";
    };

  /**
   * Creates a new Testflow in the active workspace, initializes a tab for the new Testflow,
   * and displays a success notification.
   *
   * @returns A promise that resolves when the Testflow has been created, added to the repository,
   * and the corresponding tab has been initialized.
   */
  public handleCreateTestflow = async () => {
    const currentWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();
    const testflows = (await this.testflowRepository.getTestflowByWorkspaceId(
      currentWorkspace._id,
    )) as TFRxDocumentType[];
    const testFLowId = uuidv4();
    const newTestflow: TFRxDocumentType = {
      _id: testFLowId,
      name: this.getNextTestflow(testflows, `New ${TFDefaultEnum.NAME}`),
      nodes: [
        {
          id: "1",
          type: "startBlock",
          data: {
            collectionId: "",
            requestId: "",
            folderId: "",
            method: "",
            name: "",
          },
          position: { x: 100, y: 200 },
        },
      ],
      edges: [],

      workspaceId: currentWorkspace._id,
      createdAt: new Date().toISOString(),
      createdBy: "",
      updatedAt: "",
      updatedBy: "",
    };
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      await this.testflowRepository.addTestflow(newTestflow);
      const initTestflowTab = this.initTab.testflow(
        testFLowId,
        currentWorkspace._id,
      );
      initTestflowTab.updateName(newTestflow.name);
      this.tabRepository.createTab(initTestflowTab.getValue());
      notifications.success(`New ${TFDefaultEnum.NAME} Created!`);
      return;
    }
    const response = await this.testflowService.addTestflow({
      name: newTestflow.name,
      workspaceId: newTestflow.workspaceId,
      edges: [],
      nodes: [
        {
          id: "1",
          type: "startBlock",
          position: {
            x: 100,
            y: 200,
          },
          data: {
            requestId: "",
            collectionId: "",
            folderId: "",
          },
        },
      ],
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      const initTestflowTab = this.initTab.testflow(
        res._id,
        currentWorkspace._id,
      );
      initTestflowTab.setName(res.name);
      this.tabRepository.createTab(initTestflowTab.getValue());

      this.testflowRepository.addTestflow({
        ...res,
        workspaceId: currentWorkspace._id,
      });
      notifications.success("New Testflow created successfully.");
      // MixpanelEvent(Events.CREATE_TESTFLOW);
      let isFirstTimeUsingTestFlow = false;
      isFirstTimeInTestFlow.subscribe((value) => {
        isFirstTimeUsingTestFlow = value;
        console.log("isFirstTimeUsingTestFlow", isFirstTimeUsingTestFlow);
      });
      if (isFirstTimeUsingTestFlow) {
        currentStep.set(3);
        isTestFlowTourGuideOpen.set(true);
        isFirstTimeInTestFlow.set(false);
      }
      return;
    } else {
      notifications.error("Failed to create testflow. Please try again.");
    }
  };

  /**
   * Deletes the specified Testflow from the repository and removes the associated tab.
   * Displays a success notification upon completion.
   *
   * @param testflow - The Testflow document to be deleted.
   * @returns An object indicating whether the operation was successful.
   */
  public handleDeleteTestflow = async (testflow: TFRxDocumentType) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId as string,
    );
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      this.testflowRepository.removeTestflow(testflow._id);
      await this.tabRepository.removeTab(testflow._id);
      notifications.success(
        `${testflow.name} ${TFDefaultEnum.NAME} is removed from ${currentWorkspace.name}.`,
      );
      return {
        isSuccessful: true,
      };
    }

    const response = await this.testflowService.deleteTestflow(
      currentWorkspace._id,
      testflow._id,
    );
    if (response.isSuccessful) {
      this.testflowRepository.removeTestflow(testflow._id);
      this.tabRepository.removeTab(testflow._id);
      notifications.success(
        `${testflow.name} testflow is removed from ${currentWorkspace.name}.`,
      );
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error(
        `Failed to remove ${testflow.name} testflow from ${currentWorkspace.name}.`,
      );
    }
    return response;
  };

  /**
   * Updates the Testflow's name in the repository and reflects the change
   * in the corresponding tab if it exists.
   *
   * @param testflow - The Testflow document to be updated.
   * @param newTestflowName - The new name to update the Testflow with.
   * @returns A promise that resolves when the Testflow and tab (if present) have been updated.
   */
  public handleUpdateTestflow = async (
    testflow: TFRxDocumentType,
    newTestflowName: string,
  ): Promise<void> => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId,
    );
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      this.testflowRepository.updateTestflow(testflow._id, {
        name: newTestflowName,
      });
      const currentTab = await this.tabRepository.getTabById(testflow._id);
      if (currentTab) {
        await this.tabRepository.updateTab(currentTab?.tabId as string, {
          name: newTestflowName,
        });
      }
      return;
    }
    const response = await this.testflowService.updateTestflow(
      currentWorkspace._id,
      testflow._id,
      {
        name: newTestflowName,
      },
    );
    if (response.isSuccessful) {
      this.testflowRepository.updateTestflow(testflow._id, {
        name: newTestflowName,
      });
      const currentTab = await this.tabRepository.getTabById(testflow._id);
      if (currentTab) {
        await this.tabRepository.updateTab(currentTab.tabId as string, {
          name: newTestflowName,
        });
      }
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      // notifications.error("Failed to rename testflow");
    }
  };

  /**
   * Handles the opening of a Testflow by reading the associated workspace,
   * initializing a new Testflow tab, and creating the tab in the repository.
   *
   * @param _testflow - The Testflow document containing the workspace and flow data.
   * @returns - A promise that resolves when the Testflow has been opened and the tab created.
   */
  public handleOpenTestflow = async (
    _testflow: TFRxDocumentType,
  ): Promise<void> => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      _testflow.workspaceId,
    );

    const initTestflowTab = this.initTab.testflow(
      _testflow._id,
      currentWorkspace._id,
    );
    initTestflowTab.updateName(_testflow.name);
    initTestflowTab.setNodes(_testflow.nodes);
    initTestflowTab.setEdges(_testflow.edges);
    this.tabRepository.createTab(initTestflowTab.getValue());
  };

  /**
   * @description - refreshes testflow data with sync to mongo server
   * @param workspaceId - workspace Id to which testflow belongs
   * @returns
   */
  public refreshTestflow = async (
    workspaceId: string,
  ): Promise<{
    testflowTabsToBeDeleted?: string[];
  }> => {
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      return {};
    }
    const response = await this.testflowService.fetchAllTestflow(workspaceId);
    if (response?.isSuccessful && response?.data?.data) {
      const testflows = response.data.data;
      await this.testflowRepository.refreshTestflow(
        testflows?.map((_testflow: any) => {
          const testflow = createDeepCopy(_testflow);
          testflow["workspaceId"] = workspaceId;
          return testflow;
        }),
      );
      await this.testflowRepository.deleteOrphanTestflows(
        workspaceId,
        testflows?.map((_testflow: any) => {
          return _testflow._id;
        }),
      );
      const testflowTabsToBeDeleted =
        await this.tabRepository.getIdOfTabsThatDoesntExistAtTestflowLevel(
          workspaceId,
          testflows?.map((_testflow: any) => {
            return _testflow._id;
          }),
        );
      return {
        testflowTabsToBeDeleted,
      };
    }
    return {};
  };

  /**
   * @description - saves testflow to the mongo server
   */
  public saveTestflow = async (_tab: Tab) => {
    const currentTestflow = _tab;
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentTestflow?.path?.workspaceId as string,
    );
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      await this.testflowRepository.updateTestflow(
        currentTestflow?.id as string,
        {
          name: currentTestflow.name,
          nodes: currentTestflow?.property?.testflow?.nodes,
          edges: currentTestflow?.property?.testflow?.edges,
        },
      );
      notifications.success(
        `Changes saved for ${currentTestflow.name} testflow.`,
      );

      return true;
    }

    const response = await this.testflowService.updateTestflow(
      activeWorkspace._id,
      currentTestflow?.id as string,
      {
        name: currentTestflow.name,
        nodes: currentTestflow?.property?.testflow?.nodes,
        edges: currentTestflow?.property?.testflow?.edges,
      },
    );
    if (response.isSuccessful) {
      this.testflowRepository.updateTestflow(
        response.data.data._id,
        response.data.data,
      );

      notifications.success(
        `Changes saved for ${currentTestflow.name} testflow.`,
      );
      return true;
    } else {
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error(
          `Failed to save changes for ${currentTestflow.name} testflow.`,
        );
      }
      return false;
    }
  };
}
