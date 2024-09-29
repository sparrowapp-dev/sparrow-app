import { notifications } from "@sparrow/library/ui";
import { EnvironmentRepository } from "../../repositories/environment.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { EnvironmentService } from "../../services/environment.service";
import { Events, UntrackedItems } from "@deprecate/utils/enums";
import { environmentType } from "@deprecate/utils/enums/environment.enum";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
import { GuideRepository } from "../../repositories/guide.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { TabRepository } from "../../repositories/tab.repository";

export class EnvironmentViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private guestUserRepository = new GuestUserRepository();
  private tabRepository = new TabRepository();
  private initTab = new InitTab();

  constructor() {}

  /**
   * @description - fetches environment list
   */
  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

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
   * @description - deletes environment tab
   * @param environmentId - environment id needs to be deleted
   */
  private deleteEnvironmentTab = async (environmentId: string) => {
    await this.tabRepository.removeTab(environmentId);
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

    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      newEnvironment.id = uuidv4();
      await this.environmentRepository.addEnvironment(newEnvironment);
      const initEnvironmentTab = this.initTab.environment(
        newEnvironment.id,
        currentWorkspace._id,
      );
      initEnvironmentTab.setName(newEnvironment.name);
      this.tabRepository.createTab(initEnvironmentTab.getValue());
      notifications.success("New Environment Created!");
      return;
    }
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
      initEnvironmentTab.setName(res.name);
      this.tabRepository.createTab(initEnvironmentTab.getValue());
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
      .setType(environmentType.GLOBAL)
      .setVariable(environment?.variable);
    this.tabRepository.createTab(initEnvironmentTab.getValue());
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

    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      this.environmentRepository.removeEnvironment(env.id);
      this.workspaceRepository.updateWorkspace(currentWorkspace._id, {
        environmentId: "none",
      });
      this.deleteEnvironmentTab(env.id);
      notifications.success(
        `${env.name} environment is removed from ${currentWorkspace.name}.`,
      );
      return {
        isSuccessful: true,
      };
    }
    const response = await this.environmentService.deleteEnvironment(
      currentWorkspace._id,
      env.id,
    );
    if (response.isSuccessful) {
      this.environmentRepository.removeEnvironment(env.id);
      this.workspaceRepository.updateWorkspace(currentWorkspace._id, {
        environmentId: "none",
      });
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
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      this.environmentRepository.updateEnvironment(env.id, {
        name: newEnvironmentName,
      });
      let currentTab = await this.tabRepository.getTabById(env.id);
      if (currentTab) {
        await this.tabRepository.updateTab(currentTab?.tabId as string, {
          name: newEnvironmentName,
        });
      }
      return;
    }
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
      let currentTab = await this.tabRepository.getTabById(env.id);
      if (currentTab) {
        await this.tabRepository.updateTab(currentTab.tabId as string, {
          name: newEnvironmentName,
        });
      }
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
    initEnvironmentTab.setName(env.name).setVariable(env.variable);

    this.tabRepository.createTab(initEnvironmentTab.getValue());
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

  /**
   * @description - saves environment to the mongo server
   */
  public saveEnvironment = async (_tab) => {
    const currentEnvironment = _tab;
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentEnvironment.path.workspaceId,
    );
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      await this.environmentRepository.updateEnvironment(
        currentEnvironment.id,
        {
          name: currentEnvironment.name,
          variable: currentEnvironment?.property?.environment?.variable,
        },
      );
      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );

      return true;
    }

    const response = await this.environmentService.updateEnvironment(
      activeWorkspace._id,
      currentEnvironment.id,
      {
        name: currentEnvironment.name,
        variable: currentEnvironment?.property?.environment?.variable,
      },
    );
    if (response.isSuccessful) {
      this.environmentRepository.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );

      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );
      return true;
    } else {
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error(
          `Failed to save changes for ${currentEnvironment.name} environment.`,
        );
      }
    }
    if (currentEnvironment.type === environmentType.GLOBAL) {
      MixpanelEvent(Events.SAVE_GLOBAL_ENVIRONMENT_VARIABLES, {
        environmentName: currentEnvironment.name,
        environmanetId: currentEnvironment.id,
      });
    } else {
      MixpanelEvent(Events.SAVE_LOCAL_ENVIRONMENT_VARIABLES, {
        environmentName: currentEnvironment.name,
        environmanetId: currentEnvironment.id,
      });
    }

    return false;
  };
}
