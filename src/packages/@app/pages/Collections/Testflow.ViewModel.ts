import { notifications } from "@library/ui/toast/Toast";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { InitTab } from "@common/factory";
import { v4 as uuidv4 } from "uuid";
import { TabRepository } from "@app/repositories/tab.repository";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import type { TFJSONDocType } from "@common/models/testflow";

export class TestflowViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private tabRepository = new TabRepository();
  private initTab = new InitTab();

  constructor() {}

  /**
   * @description - fetches environment list
   */
  public get testflows() {
    return this.testflowRepository.getTestflowsObserver();
  }

  /**
   * @description - finds next environment name to be created
   * @param list - previous environment list
   * @param name - sample environment name
   * @returns
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
   * @description - creates new environment
   * @param localEnvironment - new environment data
   * @returns
   */
  public handleCreateTestflow = async () => {
    const currentWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();
    const testflows = (await this.testflowRepository.getTestflowByWorkspaceId(
      currentWorkspace._id,
    )) as TFJSONDocType[];
    const newTestflow: TFJSONDocType = {
      _id: uuidv4(),
      name: this.getNextTestflow(testflows, "New Flow"),
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
    await this.testflowRepository.addTestflow(newTestflow);
    const initTestflowTab = this.initTab.testflow(
      newTestflow._id,
      currentWorkspace._id,
    );
    initTestflowTab.updateName(newTestflow.name);
    this.tabRepository.createTab(initTestflowTab.getValue());
    notifications.success("New Testflow Created!");
    return;
  };

  /**
   * @description - deletes environment from mongo server
   * @param env - environment needs to be deleted
   * @returns
   */
  public handleDeleteTestflow = async (testflow: TFJSONDocType) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId as string,
    );

    this.testflowRepository.removeTestflow(testflow._id);
    await this.tabRepository.removeTab(testflow._id);
    notifications.success(
      `${testflow.name} testflow is removed from ${currentWorkspace.name}.`,
    );
    return {
      isSuccessful: true,
    };
  };

  /**
   * @description - updates the environment
   * @param env  - environment that need to be updated
   * @param newEnvironmentName - new environment data
   */
  public handleUpdateTestflow = async (
    testflow: TFJSONDocType,
    newTestflowName: string,
  ) => {
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
  };

  /**
   * @description - creates new local environment tab
   * @param env - environment that needs to be opened
   */
  public handleOpenTestflow = async (testflow: TFJSONDocType) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId,
    );

    const initTestflowTab = this.initTab.testflow(
      testflow._id,
      currentWorkspace._id,
    );
    initTestflowTab.updateName(testflow.name);
    // .setVariable(env.variable);

    this.tabRepository.createTab(initTestflowTab.getValue());
  };
}
