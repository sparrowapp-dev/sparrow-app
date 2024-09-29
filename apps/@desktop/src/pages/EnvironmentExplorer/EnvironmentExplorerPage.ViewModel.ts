import { notifications } from "@sparrow/library/ui";
import { EnvironmentRepository } from "../../repositories/environment.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";
import { EnvironmentService } from "../../services/environment.service";
import { Events } from "@deprecate/utils/enums";
import { environmentType } from "@deprecate/utils/enums/environment.enum";
import { createDeepCopy } from "@deprecate/utils/helpers";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { BehaviorSubject, type Observable } from "rxjs";
import { GuideRepository } from "../../repositories/guide.repository";
import { GuestUserRepository } from "../../repositories/guest-user.repository";
import { TabRepository } from "../../repositories/tab.repository";
import { Debounce, CompareArray } from "@sparrow/common/utils";

export class EnvironmentExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private environmentService = new EnvironmentService();
  private guideRepository = new GuideRepository();
  private guestUserRepository = new GuestUserRepository();
  private _tab: BehaviorSubject<any> = new BehaviorSubject({});
  private tabRepository = new TabRepository();
  private compareArray = new CompareArray();

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
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   * @description - updates environment tab variables
   * @param _variable - new environment variables
   */
  public updateVariables = async (_variable: any) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.environment.variable = _variable;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   * Compares the current environment tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareEnvironmentWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    let environmentServer = await this.environmentRepository.readEnvironment(
      progressiveTab.id,
    );

    if (!environmentServer) {
      result = false;
    }
    // // description
    // else if (environmentServer.description !== progressiveTab.description) {
    //   result = false;
    // }
    // name
    else if (environmentServer.name !== progressiveTab.name) {
      result = false;
    }

    // variable
    else if (
      !this.compareArray.init(
        environmentServer.variable,
        progressiveTab.property.environment.variable,
      )
    ) {
      result = false;
    }
    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareEnvironmentWithServerDebounced,
    1000,
  );

  /**
   *
   * @param _state - request state
   */
  public updateEnvironmentState = async (_state) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.environment.state = {
      ...progressiveTab.property.environment.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * @description - saves environment to the mongo server
   */
  public saveEnvironment = async () => {
    const currentEnvironment = this._tab.getValue();
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentEnvironment.path.workspaceId,
    );
    await this.updateEnvironmentState({ isSaveInProgress: true });
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
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      await this.updateEnvironmentState({
        isSaveInProgress: false,
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
        variable: currentEnvironment?.property?.environment?.variable,
      },
    );
    if (response.isSuccessful) {
      this.environmentRepository.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      await this.updateEnvironmentState({
        isSaveInProgress: false,
      });
      notifications.success(
        `Changes saved for ${currentEnvironment.name} environment.`,
      );
    } else {
      await this.updateEnvironmentState({ isSaveInProgress: false });
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

  /**
   * Get workspace data of active workspace
   * @returns - workspace document
   */
  public getWorkspace = async () => {
    return await this.workspaceRepository.getActiveWorkspaceDoc();
  };
}
