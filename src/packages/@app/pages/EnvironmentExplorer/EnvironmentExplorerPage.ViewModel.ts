import { notifications } from "$lib/components/toast-notification/ToastNotification";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentService } from "$lib/services/environment.service";
import { Events } from "$lib/utils/enums";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { createDeepCopy } from "$lib/utils/helpers";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { BehaviorSubject, type Observable } from "rxjs";

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

  public updateName = async (_name: any) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.isSave = false;
    progressiveTab.name = _name;
    this.tab = progressiveTab;
    this.environmentTabRepository.updateEnvironmentTab(
      progressiveTab.id,
      progressiveTab,
    );
  };

  public updateVariables = async (_variable: any) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.isSave = false;
    progressiveTab.variable = _variable;
    this.tab = progressiveTab;
    this.environmentTabRepository.updateEnvironmentTab(
      progressiveTab.id,
      progressiveTab,
    );
  };

  public setEnvironmentTabProperty = async (_data) => {
    let progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.isSave = false;
    progressiveTab = {
      ...progressiveTab,
      ..._data,
    };
    this.tab = progressiveTab;
    this.environmentTabRepository.updateEnvironmentTab(
      progressiveTab.id,
      progressiveTab,
    );
  };

  public saveEnvironment = async () => {
    const currentEnvironment = this._tab.getValue();
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentEnvironment.workspaceId,
    );
    await this.setEnvironmentTabProperty({ isSaveInProgress: true });
    const response = await this.environmentService.updateEnvironment(
      activeWorkspace._id,
      currentEnvironment.id,
      {
        name: currentEnvironment.name,
        variable: currentEnvironment.variable,
      },
    );
    if (response.isSuccessful) {
      this.environmentRepository.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );
      await this.setEnvironmentTabProperty({
        isSaveInProgress: false,
        isSave: true,
      });
      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );
    } else {
      await this.setEnvironmentTabProperty({ isSaveInProgress: false });
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
  };
}
