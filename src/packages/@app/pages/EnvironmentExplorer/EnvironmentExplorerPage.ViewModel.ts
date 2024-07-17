import { notifications } from "@library/ui/toast/Toast";
import { EnvironmentTabRepository } from "@app/repositories/environment-tab.repository";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { EnvironmentService } from "@app/services/environment.service";
import { Events } from "$lib/utils/enums";
import { environmentType } from "$lib/utils/enums/environment.enum";
import { createDeepCopy } from "$lib/utils/helpers";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { BehaviorSubject, type Observable } from "rxjs";
import { GuideRepository } from "@app/repositories/guide.repository";
import { GuestUserRepository } from "@app/repositories/guest-user.repository";

export class EnvironmentExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  private environmentService = new EnvironmentService();
  private guideRepository = new GuideRepository();
  private guestUserRepository = new GuestUserRepository();
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

  /**
   * @description - updates environment tab name
   * @param _name - new environment name
   */
  public updateNameWithEnvironmentList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (progressiveTab?.name && _name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   * @description - updates environment tab name
   * @param _name - new environment name
   */
  public updateName = async (_name: any, event = "") => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (event === "blur" && _name === "") {
      const data = await this.environmentRepository.readEnvironment(
        progressiveTab.id,
      );
      progressiveTab.name = data.name;
    } else if (event === "") {
      progressiveTab.isSave = false;
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
    this.environmentTabRepository.updateEnvironmentTab(
      progressiveTab.id,
      progressiveTab,
    );
  };

  /**
   * @description - updates environment tab variables
   * @param _variable - new environment variables
   */
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

  /**
   * @description - updates environment properties
   * @param _data - new environment properties
   */
  public setEnvironmentTabProperty = async (_data) => {
    let progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.isSave = false;
    progressiveTab = {
      ...progressiveTab,
      ..._data,
    };
    this.tab = progressiveTab;
    await this.environmentTabRepository.updateEnvironmentTab(
      progressiveTab.id,
      progressiveTab,
    );
  };

  /**
   * @description - saves environment to the mongo server
   */
  public saveEnvironment = async () => {
    const currentEnvironment = this._tab.getValue();
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentEnvironment.workspaceId,
    );
    await this.setEnvironmentTabProperty({ isSaveInProgress: true });
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      await this.environmentRepository.updateEnvironment(
        currentEnvironment.id,
        {
          name: currentEnvironment.name,
          variable: currentEnvironment.variable,
        },
      );
      await this.setEnvironmentTabProperty({
        isSaveInProgress: false,
        isSave: true,
      });
      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );

      return;
    }

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
  /**
   * Fetches an environment guide based on the provided query.
   *
   * @param query - The query object used to find the environment guide.
   * @returns - A promise that resolves to the environment guide found by the query.
   */
  public fetchEnvironmentGuide = async (query) => {
    return this.guideRepository.findOne(query);
  };

  /**
   * Updates the environment guide to set its active status.
   *
   * @param query - The query object used to find the environment guide to update.
   * @param isActive - The new active status to set for the environment guide.
   * @returns - A promise that resolves when the update operation is complete.
   */
  public updateEnvironmentGuide = async (query, isActive) => {
    await this.guideRepository.update(query, {
      isActive: isActive,
    });
  };
}
