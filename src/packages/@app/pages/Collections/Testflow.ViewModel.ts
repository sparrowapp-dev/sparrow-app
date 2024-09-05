import { notifications } from "@library/ui/toast/Toast";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { EnvironmentService } from "@app/services/environment.service";
import { InitTab } from "@common/factory";
import { v4 as uuidv4 } from "uuid";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { TestflowRepository } from "@app/repositories/testflow.repository";

export class TestflowViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private testflowRepository = new TestflowRepository();
  private environmentService = new EnvironmentService();
  private guestUserRepository = new GuestUserRepository();
  private tabRepository = new TabRepository();
  private initTab = new InitTab();

  constructor() {}

  /**
   * @description - fetches environment list
   */
  public get testflows() {
    return this.testflowRepository.getTestflow();
  }

  /**
   * @description - refreshes environment data with sync to mongo server
   * @param workspaceId - workspace Id to which environment belongs
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
    const response =
      await this.environmentService.fetchAllEnvironments(workspaceId);
    if (response.isSuccessful && response.data.data) {
      const environments = response.data.data;
      this.environmentRepository.refreshEnvironment(environments, workspaceId);
    }
    return;
  };

  /**
   * @description - finds next environment name to be created
   * @param list - previous environment list
   * @param name - sample environment name
   * @returns
   */
  private getNextEnvironment: (list: any[], name: string) => any = (
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
    return null;
  };

  /**
   * @description - creates new environment
   * @param localEnvironment - new environment data
   * @returns
   */
  public handleCreateTestflow = async () => {
    const currentWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();
    const newTestflow = {
      id: uuidv4(),
      // name: this.getNextEnvironment(localEnvironment, "New Environment"),
      name: "New Flow",
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
    };

    // const guestUser = await this.guestUserRepository.findOne({
    //   name: "guestUser",
    // });
    // const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    // if (isGuestUser) {
    // newEnvironme.id = uuidv4();
    await this.testflowRepository.addTestflow(newTestflow);
    const initTestflowTab = this.initTab.testflow(
      newTestflow.id,
      currentWorkspace._id,
    );
    initTestflowTab.updateName(newTestflow.name);
    this.tabRepository.createTab(initTestflowTab.getValue());
    notifications.success("New Testflow Created!");
    return;
    // }
    // this.environmentRepository.addEnvironment(newEnvironment);
    // const response = await this.environmentService.addEnvironment({
    //   name: newEnvironment.name,
    //   workspaceId: currentWorkspace._id,
    //   variable: newEnvironment.variable,
    // });
    // if (response.isSuccessful && response.data.data) {
    //   const res = response.data.data;

    //   const initEnvironmentTab = this.initTab.environment(
    //     res._id,
    //     currentWorkspace._id,
    //   );
    //   initEnvironmentTab.setName(res.name);
    //   this.tabRepository.createTab(initEnvironmentTab.getValue());
    //   this.environmentRepository.removeEnvironment(newEnvironment.id);

    //   this.environmentRepository.addEnvironment({
    //     ...res,
    //     workspaceId: currentWorkspace._id,
    //     id: res._id,
    //   });
    //   notifications.success("New Environment Created!");
    //   MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
    //   return;
    // } else {
    //   this.environmentRepository.removeEnvironment(newEnvironment.id);
    //   notifications.error("Failed to create environment. Please try again.");
    // }

    // MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
    // return;
  };

  /**
   * @description - deletes environment from mongo server
   * @param env - environment needs to be deleted
   * @returns
   */
  public handleDeleteTestflow = async (testflow) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId,
    );

    // const guestUser = await this.guestUserRepository.findOne({
    //   name: "guestUser",
    // });
    // const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    // if (isGuestUser) {
    this.testflowRepository.removeTestflow(testflow.id);
    await this.tabRepository.removeTab(testflow.id);
    notifications.success(
      `${testflow.name} testflow is removed from ${currentWorkspace.name}.`,
    );
    return {
      isSuccessful: true,
    };
    // }
    // const response = await this.environmentService.deleteEnvironment(
    //   currentWorkspace._id,
    //   testflow.id,
    // );
    // if (response.isSuccessful) {
    //   this.environmentRepository.removeEnvironment(testflow.id);
    //   this.workspaceRepository.updateWorkspace(currentWorkspace._id, {
    //     environmentId: "none",
    //   });
    //   await this.tabRepository.removeTab(testflow.id);
    //   notifications.success(
    //     `${testflow.name} environment is removed from ${currentWorkspace.name}.`,
    //   );
    // } else if (response.message === "Network Error") {
    //   notifications.error(response.message);
    // } else {
    //   notifications.error(
    //     `Failed to remove ${env.name} environment from ${currentWorkspace.name}.`,
    //   );
    // }
    // return response;
  };

  /**
   * @description - updates the environment
   * @param env  - environment that need to be updated
   * @param newEnvironmentName - new environment data
   */
  public handleUpdateTestflow = async (testflow, newTestflowName: string) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId,
    );
    // const guestUser = await this.guestUserRepository.findOne({
    //   name: "guestUser",
    // });
    // const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    // if (isGuestUser) {
    this.testflowRepository.updateTestflow(testflow.id, {
      name: newTestflowName,
    });
    let currentTab = await this.tabRepository.getTabById(testflow.id);
    if (currentTab) {
      await this.tabRepository.updateTab(currentTab?.tabId as string, {
        name: newTestflowName,
      });
    }
    return;
    // }
    // const response = await this.environmentService.updateEnvironment(
    //   currentWorkspace._id,
    //   testflow.id,
    //   {
    //     name: newTestflowName,
    //   },
    // );
    // if (response.isSuccessful) {
    //   this.environmentRepository.updateEnvironment(testflow.id, {
    //     name: newTestflowName,
    //   });
    //   let currentTab = await this.tabRepository.getTabById(testflow.id);
    //   if (currentTab) {
    //     await this.tabRepository.updateTab(currentTab.tabId as string, {
    //       name: newTestflowName,
    //     });
    //   }
    // } else if (response.message === "Network Error") {
    //   notifications.error(response.message);
    // } else {
    //   notifications.error("Failed to rename environment");
    // }
  };

  /**
   * @description - creates new local environment tab
   * @param env - environment that needs to be opened
   */
  public handleOpenTestflow = async (testflow) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      testflow.workspaceId,
    );

    const initTestflowTab = this.initTab.testflow(
      testflow.id,
      currentWorkspace._id,
    );
    initTestflowTab.updateName(testflow.name);
    // .setVariable(env.variable);

    this.tabRepository.createTab(initTestflowTab.getValue());
  };
}
