import type { TabDocument } from "src/database/database";
import { CompareArray, createDeepCopy, Debounce } from "@sparrow/common/utils";
import { Observable } from "rxjs";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject } from "rxjs";
import { TestflowRepository } from "src/repositories/testflow.repository";
import { TabRepository } from "src/repositories/tab.repository";
import { TestflowService } from "src/services/testflow.service";
import { updateTestflowDataSets } from "@sparrow/common/store";
import { WorkspaceRepository } from "src/repositories/workspace.repository";

export enum TabPersistenceTypeEnum {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
}
export class TestflowDataSetExplorerPageViewModel {
  private _tab = new BehaviorSubject<Partial<Tab>>({});
  private testflowRepository = new TestflowRepository();
  private workspaceRepository = new WorkspaceRepository();
  private tabRepository = new TabRepository();
  private compareArray = new CompareArray();
  private testflowService = new TestflowService();
  /**
   * Constructor to initialize the TestflowExplorerPageViewModel class
   * @param doc - TabDocument that contains information about the active tab
   */
  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        this.tab = t;
      }, 0);
    }
  }

  /**
   * Returns an observable that emits the current state of the tab
   */
  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  /**
   * Sets the value of the tab and updates the observable
   * @param value - the updated tab value
   */
  private set tab(value: Tab) {
    this._tab.next(value);
  }

  public saveDataset = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());

    // Mark as saved
    progressiveTab.isSaved = true;
    progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;

    this.tab = progressiveTab;

    // Update tab in database with saved state
    await this.tabRepository.updateTab(progressiveTab.tabId, {
      isSaved: true,
      persistence: TabPersistenceTypeEnum.PERMANENT,
    });
  };

  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public updateName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const trimmedName = _name.trim();

    if (trimmedName === "") {
      const data = await this.getTestflowDataSetsById(
        progressiveTab.path.testflowId,
      );
      const matching = data._data?.datasets?.find(
        (d: any) => d.id === progressiveTab.id,
      );
      progressiveTab.name = matching?.name || progressiveTab.name;
    } else {
      progressiveTab.name = trimmedName;
    }

    if (progressiveTab.name === this._tab.getValue().name) {
      return;
    }

    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareDatasetWithServer();
  };

  /**
   * Get datasets for a specific testflow/tab by ID
   *
   * @param id - The testflow ID, workspace ID, or tab ID
   * @returns Array of datasets for the given ID, or empty array if not found
   *
   * @example
   * const datasets = getTestflowDataSetsById(progressiveTab.id);
   */
  private getTestflowDataSetsById = async (id: string | number): any => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const testflowDataSetStore = await this.testflowRepository.readTestflow(
      progressiveTab.path.testflowId,
    );
    const datasets = testflowDataSetStore.get(id);
    return datasets || {};
  };

  private compareDatasetWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const currentItem = this.getTestflowDataSetsById(progressiveTab.id);
    if (!currentItem) result = false;
    // name
    else if (currentItem.name != progressiveTab?.property?.name) {
      result = false;
    } else if (
      currentItem.item !== progressiveTab?.property?.testflowDataSet?.item
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

  private compareDatasetWithServer = new Debounce().debounce(
    this.compareDatasetWithServerDebounced,
    0,
  );

  public renameTestDataSet = async (
    testflowDataSetId: string,
    updatedDataSetName: string,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const response = await this.testflowService.renameTestDataSet(
      progressiveTab.path.testflowId as string,
      testflowDataSetId,
      updatedDataSetName,
      progressiveTab?.path?.workspaceId,
    );
    if (response?.isSuccessful) {
      const datasets = response.data?.data.result;
      updateTestflowDataSets(progressiveTab.id as string, datasets || []);
      progressiveTab.name = updatedDataSetName;
      progressiveTab.isSaved = true;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      this.tab = progressiveTab;
    }
    return response;
  };
}
