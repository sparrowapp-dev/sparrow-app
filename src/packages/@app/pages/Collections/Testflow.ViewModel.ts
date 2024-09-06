import { notifications } from "@library/ui/toast/Toast";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { InitTab } from "@common/factory";
import { v4 as uuidv4 } from "uuid";
import { TabRepository } from "@app/repositories/tab.repository";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import type { TFJSONDocType } from "@common/models/testflow";
import { TestflowDefault } from "@common/types/workspace/testflow";

export class TestflowViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private tabRepository = new TabRepository();
  private initTab = new InitTab();

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
  private getNextTestflow: (list: TFJSONDocType[], name: string) => string = (
    list,
    name,
  ) => {
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
    )) as TFJSONDocType[];
    const testFLowId = uuidv4();
    const newTestflow: TFJSONDocType = {
      _id: testFLowId,
      name: this.getNextTestflow(testflows, `New ${TestflowDefault.NAME}`),
      nodes: [
        {
          id: "1",
          type: "startBlock",
          data: {
            label: "Start",
          },
          position: { x: 100, y: 350 },
        },
      ],
      edges: [],

      workspaceId: currentWorkspace._id,
      createdAt: new Date().toISOString(),
      createdBy: "",
      updatedAt: "",
      updatedBy: "",
    };
    const initTestflowTab = this.initTab.testflow(
      testFLowId,
      currentWorkspace._id,
    );
    await this.testflowRepository.addTestflow(newTestflow);
    initTestflowTab.updateName(newTestflow.name);
    this.tabRepository.createTab(initTestflowTab.getValue());
    notifications.success(`New ${TestflowDefault.NAME} Created!`);
  };

  /**
   * Deletes the specified Testflow from the repository and removes the associated tab.
   * Displays a success notification upon completion.
   *
   * @param testflow - The Testflow document to be deleted.
   * @returns An object indicating whether the operation was successful.
   */
  public handleDeleteTestflow = async (testflow: TFJSONDocType) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId as string,
    );

    this.testflowRepository.removeTestflow(testflow._id);
    await this.tabRepository.removeTab(testflow._id);
    notifications.success(
      `${testflow.name} ${TestflowDefault.NAME} is removed from ${currentWorkspace.name}.`,
    );
    return {
      isSuccessful: true,
    };
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
    testflow: TFJSONDocType,
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
    _testflow: TFJSONDocType,
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
}
