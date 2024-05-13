import { notifications } from "$lib/components/toast-notification/ToastNotification";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import { Events, UntrackedItems } from "$lib/utils/enums";
import { environmentType } from "$lib/utils/enums/environment.enum";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { InitTab } from "@common/factory";
import { v4 as uuidv4 } from "uuid";

export class EnvironmentViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  private environmentService = new EnvironmentService();
  private initTab = new InitTab();

  constructor() {}

  /**
   * @description - fetches environment list
   */
  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  /**
   * @description - fetches active environment
   * @param workspaceId - workspace Id to which environment belongs
   * @returns
   */
  public getactiveEnvironmentTab = (workspaceId: string) => {
    return this.environmentTabRepository.getEnvironmentTab(workspaceId);
  };

  /**
   * @description - fetches active workspace
   * @returns
   */
  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  /**
   * @description - refreshes environment data with sync to mongo server
   * @param workspaceId - workspace Id to which environment belongs
   * @returns
   */
  public refreshEnvironment = async (workspaceId: string) => {
    const activeTab =
      await this.environmentTabRepository.getActiveEnvironmentTab(workspaceId);
    const response =
      await this.environmentService.fetchAllEnvironments(workspaceId);
    if (response.isSuccessful && response.data.data) {
      const environments = response.data.data;
      this.environmentRepository.refreshEnvironment(environments, workspaceId);
      if (!activeTab) {
        environments.forEach((environment) => {
          if (environment.type === environmentType.GLOBAL) {
            const initEnvironmentTab = this.initTab.environment(
              environment.id,
              workspaceId,
            );
            initEnvironmentTab
              .setName(environment.name)
              .setIsActive(true)
              .setType(environmentType.GLOBAL)
              .setVariable(environment.variable);

            this.environmentTabRepository.createTab(
              initEnvironmentTab.getValue(),
              workspaceId,
            );
          }
        });
      }
    }
    return;
  };

  /**
   * @description - deletes environment tab
   * @param environmentId - environment id needs to be deleted
   */
  private deleteEnvironmentTab = async (environmentId: string) => {
    const flag =
      await this.environmentTabRepository.deleteEnvironmentTab(environmentId);
    if (flag[0]) {
      const globalEnvironment =
        await this.environmentRepository.getGlobalEnvironment(flag[1]);

      const initEnvironmentTab = this.initTab.environment(
        globalEnvironment.id,
        globalEnvironment.workspaceId,
      );
      initEnvironmentTab
        .setName(globalEnvironment.name)
        .setIsActive(true)
        .setType(environmentType.GLOBAL)
        .setVariable(globalEnvironment.variable);

      this.environmentTabRepository.createTab(
        initEnvironmentTab.getValue(),
        initEnvironmentTab.getValue().workspaceId,
      );
    }
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
  public onCreateEnvironment = async (localEnvironment) => {
    const currentWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();
    const newEnvironment = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextEnvironment(localEnvironment, "New Environment"),
      variable: [
        {
          key: "",
          value: "",
          checked: true,
        },
      ],
      isActive: false,
      type: "LOCAL",
      workspaceId: currentWorkspace._id,
      createdAt: new Date().toISOString(),
    };

    this.environmentRepository.addEnvironment(newEnvironment);
    const response = await this.environmentService.addEnvironment({
      name: newEnvironment.name,
      workspaceId: currentWorkspace._id,
      variable: newEnvironment.variable,
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;

      const initEnvironmentTab = this.initTab.environment(
        res._id,
        currentWorkspace._id,
      );
      initEnvironmentTab.setName(res.name).setIsActive(true);
      this.environmentTabRepository.createTab(
        initEnvironmentTab.getValue(),
        currentWorkspace._id,
      );
      this.environmentRepository.removeEnvironment(newEnvironment.id);

      this.environmentRepository.addEnvironment({
        ...res,
        workspaceId: currentWorkspace._id,
        id: res._id,
      });
      notifications.success("New Environment Created!");
      MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
      return;
    } else {
      this.environmentRepository.removeEnvironment(newEnvironment.id);
      notifications.error("Failed to create environment. Please try again.");
    }
    MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
    return;
  };

  /**
   * @description - create a global environment tab
   * @param environment - environment data
   */
  public onOpenGlobalEnvironment = (environment) => {
    const initEnvironmentTab = this.initTab.environment(
      environment?.id,
      environment.workspaceId,
    );
    initEnvironmentTab
      .setName(environment?.name)
      .setIsActive(true)
      .setType(environmentType.GLOBAL)
      .setVariable(environment?.variable);
    this.environmentTabRepository.createTab(
      initEnvironmentTab.getValue(),
      environment.workspaceId,
    );
  };

  /**
   * @description - deletes environment from mongo server
   * @param env - environment needs to be deleted
   * @returns
   */
  public onDeleteEnvironment = async (env) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    const response = await this.environmentService.deleteEnvironment(
      currentWorkspace._id,
      env.id,
    );
    if (response.isSuccessful) {
      this.environmentRepository.removeEnvironment(env.id);
      this.deleteEnvironmentTab(env.id);
      notifications.success(
        `${env.name} environment is removed from ${currentWorkspace.name}.`,
      );
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error(
        `Failed to remove ${env.name} environment from ${currentWorkspace.name}.`,
      );
    }
    return response;
  };

  /**
   * @description - updates the environment
   * @param env  - environment that need to be updated
   * @param newEnvironmentName - new environment data
   */
  public onUpdateEnvironment = async (env, newEnvironmentName: string) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    const response = await this.environmentService.updateEnvironment(
      currentWorkspace._id,
      env.id,
      {
        name: newEnvironmentName,
      },
    );
    if (response.isSuccessful) {
      this.environmentRepository.updateEnvironment(env.id, {
        name: newEnvironmentName,
      });
      this.environmentTabRepository.updateEnvironmentTab(env.id, {
        name: newEnvironmentName,
      });
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error("Failed to rename environment");
    }
  };

  /**
   * @description - creates new local environment tab
   * @param env - environment that needs to be opened
   */
  public onOpenEnvironment = async (env) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );

    const initEnvironmentTab = this.initTab.environment(
      env.id,
      currentWorkspace._id,
    );
    initEnvironmentTab
      .setName(env.name)
      .setIsActive(true)
      .setVariable(env.variable);

    this.environmentTabRepository.createTab(
      initEnvironmentTab.getValue(),
      currentWorkspace._id,
    );
  };

  /**
   * @description - selects the environment
   * @param env  - environment that needs to be selected
   */
  public onSelectEnvironment = async (env) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    if (currentWorkspace?.environmentId === env.id) {
      this.workspaceRepository.updateWorkspace(currentWorkspace._id, {
        environmentId: "none",
      });
    } else {
      this.workspaceRepository.updateWorkspace(currentWorkspace._id, {
        environmentId: env.id,
      });
    }
  };
}
