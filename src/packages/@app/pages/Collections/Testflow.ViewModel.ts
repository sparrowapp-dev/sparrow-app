import { notifications } from "@library/ui/toast/Toast";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { InitTab } from "@common/factory";
import { v4 as uuidv4 } from "uuid";
import { TabRepository } from "@app/repositories/tab.repository";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import type { TFRxDocumentType } from "@app/models/testflow.model";
import { TFDefaultEnum } from "@common/types/workspace/testflow";
import { TestflowService } from "@app/services/testflow.service";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";

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
      notifications.success("New Testflow Created!");
      // MixpanelEvent(Events.CREATE_TESTFLOW);
      return;
    } else {
      notifications.error("Failed to create Testflow. Please try again.");
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
    this.testflowRepository.updateTestflow(testflow._id, {
      name: newTestflowName,
    });
    const currentTab = await this.tabRepository.getTabById(testflow._id);
    if (currentTab) {
      await this.tabRepository.updateTab(currentTab?.tabId as string, {
        name: newTestflowName,
      });
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
    this.tabRepository.createTab(initTestflowTab.getValue());
  };

  /**
   * @description - refreshes testflow data with sync to mongo server
   * @param workspaceId - workspace Id to which testflow belongs
   * @returns
   */
  public refreshTestflow = async (workspaceId: string) => {
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      return;
    }
    const response = await this.testflowService.fetchAllTestflow(workspaceId);
    if (response.isSuccessful && response.data.data) {
      const testflows = response.data.data;
      this.testflowRepository.refreshTestflow(testflows, workspaceId);
    }
    return;
  };
}
