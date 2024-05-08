import { notifications } from "$lib/components/toast-notification/ToastNotification";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";
import { Events, UntrackedItems } from "$lib/utils/enums";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { createDeepCopy } from "$lib/utils/helpers";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { generateSampleEnvironment } from "$lib/utils/sample/environment.sample";
import { BehaviorSubject, type Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";

export class EnvironmentExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  private environmentService = new EnvironmentService();

  ///////////////////////////////////////////////////////////////////
  private _tab: BehaviorSubject<any> = new BehaviorSubject({});

  public constructor(doc) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        this.tab = t;
      }, 0);
    }
  }

  public get tab(): Observable<any> {
    return this._tab.asObservable();
  }

  private set tab(value: any) {
    this._tab.next(value);
  }

  public updateEnvironmentVariables = async (_variables: any) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.variable = _variable;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.environmentRepository.updateEnvironment2(
      progressiveTab.environmentId,
      progressiveTab,
    );
  };

  ////////////////////////////////////////////////////////////

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public getactiveEnvironmentTab = (workspaceId: string) => {
    return this.environmentTabRepository.getEnvironmentTab(workspaceId);
  };

  public getActiveWorkspace = () => {
    return this.workspaceRepository.getActiveWorkspace();
  };

  public createEnvironment = (environment) => {
    this.environmentRepository.addEnvironment(environment);
  };

  public updateEnvironment = (uuid, data) => {
    this.environmentRepository.updateEnvironment(uuid, data);
  };

  public deleteEnvironment = (id) => {
    this.environmentRepository.removeEnvironment(id);
  };

  public initActiveEnvironmentToWorkspace = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    this.workspaceRepository.updateWorkspace(workspaceId, { environmentId });
  };

  public createEnvironmentTab = async (tab, workspaceId: string) => {
    this.environmentTabRepository.createTab(tab, workspaceId);
  };

  public setEnvironmentTabProperty = async (data, route, environmentId) => {
    this.environmentTabRepository.setEnvironmentTabProperty(
      data,
      route,
      environmentId,
    );
  };

  public refreshEnvironment = async (workspaceId) => {
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
            const sampleEnvironment = generateSampleEnvironment(
              environment.id,
              workspaceId,
              new Date().toString(),
            );
            sampleEnvironment.name = environment.name;
            sampleEnvironment.isActive = true;
            sampleEnvironment.type = environmentType.GLOBAL;
            sampleEnvironment.variable = environment.variable;
            this.environmentTabRepository.createTab(
              sampleEnvironment,
              workspaceId,
            );
          }
        });
      }
    }
    return;
  };

  public deleteEnvironmentTab = async (environmentId) => {
    const flag =
      await this.environmentTabRepository.deleteEnvironmentTab(environmentId);
    if (flag[0]) {
      const globalEnvironment =
        await this.environmentRepository.getGlobalEnvironment(flag[1]);
      const sampleEnvironment = generateSampleEnvironment(
        globalEnvironment.id,
        globalEnvironment.workspaceId,
        new Date().toString(),
      );
      sampleEnvironment.name = globalEnvironment.name;
      sampleEnvironment.isActive = true;
      sampleEnvironment.type = environmentType.GLOBAL;
      sampleEnvironment.variable = globalEnvironment.variable;

      this.createEnvironmentTab(
        sampleEnvironment,
        sampleEnvironment.workspaceId,
      );
    }
  };

  // services -----------------------------------------------------------
  public getServerEnvironments = async (workspaceId: string) => {
    return await this.environmentService.fetchAllEnvironments(workspaceId);
  };

  public deleteServerEnvironment = (
    environmentId: string,
    workspaceId: string,
  ) => {
    return this.environmentService.deleteEnvironment(
      workspaceId,
      environmentId,
    );
  };

  public createServerEnvironment = async (
    environment: CreateEnvironmentPostBody,
  ) => {
    return await this.environmentService.addEnvironment(environment);
  };

  public updateServerEnvironment = async (
    workspaceId: string,
    environmentId: string,
    data,
  ) => {
    return this.environmentService.updateEnvironment(
      workspaceId,
      environmentId,
      data,
    );
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getNextEnvironment: (list: any[], name: string) => any = (list, name) => {
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

    this.createEnvironment(newEnvironment);
    const response = await this.createServerEnvironment({
      name: newEnvironment.name,
      workspaceId: currentWorkspace._id,
      variable: newEnvironment.variable,
    });
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      let sampleEnvironment = generateSampleEnvironment(
        res._id,
        currentWorkspace._id,
        new Date().toString(),
      );
      sampleEnvironment.name = res.name;
      sampleEnvironment.isActive = true;
      this.createEnvironmentTab(sampleEnvironment, currentWorkspace._id);
      this.deleteEnvironment(newEnvironment.id);

      this.createEnvironment({
        ...res,
        workspaceId: currentWorkspace._id,
        id: res._id,
      });
      notifications.success("New Environment Created!");
      MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
      return;
    } else {
      this.deleteEnvironment(newEnvironment.id);
      notifications.error("Failed to create environment. Please try again.");
    }
    MixpanelEvent(Events.CREATE_LOCAL_ENVIRONMENT);
    return;
  };

  public onOpenGlobalEnvironment = (environment) => {
    let sampleEnvironment = generateSampleEnvironment(
      environment?.id,
      environment.workspaceId,
      new Date().toString(),
    );
    sampleEnvironment.name = environment?.name;
    sampleEnvironment.isActive = true;
    sampleEnvironment.type = environmentType.GLOBAL;
    sampleEnvironment.variable = environment?.variable;
    this.createEnvironmentTab(sampleEnvironment, environment.workspaceId);
  };

  public onDeleteEnvironment = async (env) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    const response = await this.deleteServerEnvironment(
      env.id,
      currentWorkspace._id,
    );
    if (response.isSuccessful) {
      this.deleteEnvironment(env.id);
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

  public onUpdateEnvironment = async (env, newEnvironmentName) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    const response = await this.updateServerEnvironment(
      currentWorkspace._id,
      env.id,
      {
        name: newEnvironmentName,
      },
    );
    if (response.isSuccessful) {
      this.updateEnvironment(env.id, {
        name: newEnvironmentName,
      });
      this.setEnvironmentTabProperty(newEnvironmentName, "name", env.id);
    } else if (response.message === "Network Error") {
      notifications.error(response.message);
    } else {
      notifications.error("Failed to rename environment");
    }
  };

  public onOpenEnvironment = async (env) => {
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    let sampleEnvironment = generateSampleEnvironment(
      env.id,
      currentWorkspace._id,
      new Date().toString(),
    );
    sampleEnvironment.name = env.name;
    sampleEnvironment.isActive = true;
    sampleEnvironment.variable = env.variable;
    this.createEnvironmentTab(sampleEnvironment, currentWorkspace._id);
  };

  public onSelectEnvironment = async (env) => {
    // debugger;
    const currentWorkspace = await this.workspaceRepository.readWorkspace(
      env.workspaceId,
    );
    if (currentWorkspace?.environmentId === env.id) {
      this.initActiveEnvironmentToWorkspace(currentWorkspace._id, "none");
    } else {
      this.initActiveEnvironmentToWorkspace(currentWorkspace._id, env.id);
    }
  };
}
