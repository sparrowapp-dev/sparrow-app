import { notifications } from "@sparrow/library/ui";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { EnvironmentService } from "../../../../services/environment.service";
import { Events } from "@sparrow/common/enums";
import { environmentType } from "@sparrow/common/enums/environment.enum";
import { createDeepCopy, Sleep } from "@sparrow/common/utils";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { BehaviorSubject, type Observable } from "rxjs";
import { GuideRepository } from "../../../../repositories/guide.repository";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { TabRepository } from "../../../../repositories/tab.repository";
import { Debounce, CompareArray } from "@sparrow/common/utils";
import { TabPersistenceTypeEnum } from "@sparrow/common/types/workspace/tab";
import constants from "src/constants/constants";

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
        this.getGenerateVariables();
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

    // Trim the name to handle cases with only spaces
    const trimmedName = _name.trim();

    if (event === "blur" && trimmedName === "") {
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
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = true;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = false;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareEnvironmentWithServerDebounced,
    0,
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

  private constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };


    public updateVariableSelection = async (type?: string, index?: number) => {
    if (type === "regenerate") {
      await this.reGenerateVariables();
      return;
    }
    if (type === "accept" && typeof index === "number") {
      try {
        const progressiveTab = createDeepCopy(this._tab.getValue());
       progressiveTab
        const foundIndex = progressiveTab.property.environment.aiVariable.findIndex((_, i) => i === index);
        if (foundIndex !== -1) {
          const foundObject = progressiveTab.property.environment.aiVariable[foundIndex];
          const currentPairs =
            progressiveTab.property?.environment?.variable || [];
          const updatedPairs = [...currentPairs];
          if (updatedPairs.length > 0) {
            updatedPairs.splice(updatedPairs.length - 1, 0, foundObject);
          } else {
            updatedPairs.push(foundObject);
          }
          const remainingGeneratedVariables = progressiveTab.property.environment.aiVariable.filter(
            (_, i) => i !== foundIndex,
          );
          this.updateGeneratedVariables(remainingGeneratedVariables);
          this.updateVariables(updatedPairs);
          // console.log()
          if(!remainingGeneratedVariables?.length){
          await  this.updateEnvironmentAiVariableGenerationStatus("accepted");
          }

        }
      } catch (error) {
        console.error("Error accepting generated variable:", error);
      }
    }
    else if (type === "reject" && typeof index === "number") {
        const progressiveTab = createDeepCopy(this._tab.getValue());
          const remainingGeneratedVariables = progressiveTab.property.environment.aiVariable;
          if(!remainingGeneratedVariables?.length){
          await  this.updateEnvironmentAiVariableGenerationStatus("rejected");
        }
    } else if (type === "accept-all") {
        const progressiveTab = createDeepCopy(this._tab.getValue());
        await this.updateVariables([...progressiveTab.property.environment.variable, ...progressiveTab.property.environment.aiVariable, {
          key: "",
          value: "",
          checked: true,
        } ]);
        await this.updateEnvironmentAiVariableGenerationStatus("accepted");
        await this.updateGeneratedVariables([]);
    }
  };

  public updateGeneratedVariables = async (
    aiVariables?: any,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.environment.aiVariable = aiVariables;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    return;
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
          updatedAt: new Date().toISOString(),
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
    const baseUrl = await this.constructBaseUrl(activeWorkspace._id);
    const response = await this.environmentService.updateEnvironment(
      activeWorkspace._id,
      currentEnvironment.id,
      {
        name: currentEnvironment.name,
        variable: currentEnvironment?.property?.environment?.variable,
      },
      baseUrl,
    );
    if (response.isSuccessful) {
      this.environmentRepository.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      progressiveTab.generateVariable = false;
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


  public updateEnvironmentAiVariableGenerationStatus = async (_status) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.aiGenerationStatus = _status;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };



  /**
   * Handle create generative variables for a collection.
   * @param collectionId :CollectionId - the collection in which new request is going to be created
   * @returns :void
   */
  public getGenerateVariables = async (
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if(progressiveTab.generateVariable && progressiveTab.aiGenerationStatus === "") {
      this.updateEnvironmentAiVariableGenerationStatus("generating"); 
      const response = [
            {
              key: "name",
              value: "world",
              checked: false,
            },
            {
              key: "sample-my-one", 
              value: "test",
              checked: false,
            },
            {
              key: "sample-1",
              value: "test-1",
              checked: false,
            },
            {
              key: "sample-2",
              value: "test-2",
              checked: false,
            },
              {
              key: "name",
              value: "world",
              checked: false,
            },
            {
              key: "sample-my-one", 
              value: "test",
              checked: false,
            },
            {
              key: "sample-1",
              value: "test-1",
              checked: false,
            },
            {
              key: "sample-2",
              value: "test-2",
              checked: false,
            },
              {
              key: "name",
              value: "world",
              checked: false,
            },
            {
              key: "sample-my-one", 
              value: "test",
              checked: false,
            },
            {
              key: "sample-1",
              value: "test-1",
              checked: false,
            },
            {
              key: "sample-2",
              value: "test-2",
              checked: false,
            },
              {
              key: "name",
              value: "world",
              checked: false,
            },
            {
              key: "sample-my-one", 
              value: "test",
              checked: false,
            },
            {
              key: "sample-1",
              value: "test-1",
              checked: false,
            },
            {
              key: "sample-2",
              value: "test-2",
              checked: false,
            },
          ];
          
          await new Sleep().setTime(2000).exec();
        await this.updateEnvironmentAiVariableGenerationStatus("generated");
          await this.updateGeneratedVariables(response);
    }
    };

     /**
   * Handle create generative variables for a collection.
   * @param collectionId :CollectionId - the collection in which new request is going to be created
   * @returns :void
   */
  public reGenerateVariables = async (
  ) => {
    this.updateEnvironmentAiVariableGenerationStatus("generating"); 
      const response = [
            {
              key: "name",
              value: "world",
              checked: false,
            },
            {
              key: "sample-my-one", 
              value: "test",
              checked: false,
            },
            {
              key: "sample-1",
              value: "test-1",
              checked: false,
            },
            {
              key: "sample-2",
              value: "test-2",
              checked: false,
            },
          ];
          
          await new Sleep().setTime(2000).exec();
        await this.updateEnvironmentAiVariableGenerationStatus("generated");
          await this.updateGeneratedVariables(response);
    
    };
}
