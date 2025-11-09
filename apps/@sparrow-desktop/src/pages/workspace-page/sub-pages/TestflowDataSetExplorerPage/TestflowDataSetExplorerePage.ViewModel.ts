import type { TabDocument } from "@app/database/database";
import { CompareArray, createDeepCopy, Debounce } from "@sparrow/common/utils";
import { Observable, BehaviorSubject } from "rxjs";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { TabRepository } from "@app/repositories/tab.repository";

export enum TabPersistenceTypeEnum {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
}

export class TestflowDataSetExplorerPageViewModel {
  private _tab = new BehaviorSubject<Partial<Tab>>({});
  private testflowRepository = new TestflowRepository();
  private tabRepository = new TabRepository();
  private compareArray = new CompareArray();

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

  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

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

  public updateName = async (_name: any, event = "") => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const trimmedName = _name.trim();

    if (event === "blur" && trimmedName === "") {
      const data = await this.testflowRepository.readTestflow(
        progressiveTab.path.testflowId,
      );
      const matching = data._data?.datasets?.find(
        (d: any) => d.id === progressiveTab.id,
      );
      progressiveTab.name = matching?.name || progressiveTab.name;
    } else if (event === "") {
      progressiveTab.name = _name;
    }

    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (event === "") {
      this.compareRequestWithServer();
    }
  };

  private compareEnvironmentWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    const testFlowServer = await this.testflowRepository.readTestflow(
      progressiveTab.path.testflowId,
    );

    if (!testFlowServer) {
      result = false;
    } else {
      const serverDataset = testFlowServer._data?.datasets?.find(
        (ds: any) => ds.id === progressiveTab.id,
      );

      if (!serverDataset || serverDataset.name !== progressiveTab.name) {
        result = false;
      }
    }

    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = true;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = false;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
    }

    this.tab = progressiveTab;
  };
  private compareRequestWithServer = new Debounce().debounce(
    this.compareEnvironmentWithServerDebounced,
    0,
  );
}
