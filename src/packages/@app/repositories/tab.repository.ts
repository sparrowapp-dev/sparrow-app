import { RxDB, type TabDocument } from "@app/database/database";
import type { TabDocType } from "@app/models/tab.model";
import { TaskQueue } from "@common/utils";
import type { Observable } from "rxjs";

export class TabRepository {
  constructor() {}
  private taskQueue = new TaskQueue();
  private db = RxDB?.getInstance()?.rxdb?.tab;

  private findOne = async (query: unknown) => {
    return await this.db
      .findOne({
        selector: query,
      })
      .exec();
  };

  private bulkUpsert = async (data: TabDocType[]): Promise<void> => {
    await this.db.bulkUpsert(data);
  };

  private insert = async (data: TabDocType) => {
    await this.db.insert(data);
  };

  private getSortedTabs = async (query: unknown) => {
    return await this.db.find().sort(query).exec();
  };
  /**
   * Creates a new tab and adds it to the tab bar.
   */
  public createTab = async (tab: TabDocType): Promise<void> => {
    this.taskQueue.enqueue(async () => {
      // checks if tab already exists with same id
      const _tab = await this.findOne({
        id: tab.id,
      });
      if (_tab) {
        await this.activeTab(tab.id);
        return;
      }

      // recalculate the index of existing tabs
      const allTabs = await this.getSortedTabs({ index: "asc" });
      let index = 0;
      const response = allTabs.map((elem: TabDocument) => {
        const res = elem.toMutableJSON();
        res.index = index;
        res.isActive = false;
        index = index + 1;
        return res;
      });
      await this.bulkUpsert(response);
      // inseting new tab
      tab.index = index;
      tab.isActive = true;
      await this.insert(tab);
    });
  };

  private getNextActiveTabId = (doc: TabDocument[], id: string): string => {
    let nextActiveTabId: string = "";
    for (let i = 0; i < doc.length; i++) {
      if (doc[i].get("id") === id) {
        if (doc[i + 1]) {
          nextActiveTabId = doc[i + 1].get("id");
        } else if (doc[i - 1]) {
          nextActiveTabId = doc[i - 1].get("id");
        }
      }
    }
    return nextActiveTabId;
  };

  /**
   * @description Removes an existing tab from the tab bar.
   * @param id tab id to be removed
   */
  public removeTab = async (id: string): Promise<void> => {
    this.taskQueue.enqueue(async () => {
      const doc = await this.getSortedTabs({ index: "asc" });
      // electing the next active tab before removing the existing one
      const nextActiveTabId = this.getNextActiveTabId(doc, id);
      // removes the requested tab
      const selectedTab = await this.findOne({
        id,
      });
      await selectedTab?.incrementalRemove();

      // recalculate index of rest of the tabs
      let index: number = 0;
      const response = doc
        .filter((elem: TabDocument) => {
          const res = elem.toJSON();
          if (res.id === id) return false;
          return true;
        })
        .map((elem: TabDocument) => {
          const res = elem.toMutableJSON();
          res.isActive = false;
          res.index = index;
          index = index + 1;
          return res;
        });
      await this.bulkUpsert(response);

      // activating the next elected tab
      const d = await this.findOne({
        id: nextActiveTabId,
      });
      d?.incrementalModify((value: TabDocument) => {
        return { ...value, isActive: true };
      });
    });
  };

  /**
   * @description Activates an existing tab in the tab bar.
   * @param id
   */
  public activeTab = async (id: string): Promise<void> => {
    this.taskQueue.enqueue(async () => {
      // checks if tab is already active or not
      const deselectedTab = await this.findOne({
        isActive: true,
      });
      if (deselectedTab?.id === id) return;

      // marking all the tabs as inactive
      const allTabs = await this.db.find().exec();
      const response = allTabs.map((elem: TabDocument) => {
        const res = elem.toMutableJSON();
        res.isActive = false;
        return res;
      });
      await this.bulkUpsert(response);

      // activating the next elected tab
      const d = await this.findOne({
        id,
      });
      d?.incrementalModify((value: TabDocument) => {
        return { ...value, isActive: true };
      });
    });
  };

  /**
   * Extracts all data of the active tab.
   */
  public getTab = (): Observable<TabDocument> => {
    return this.db.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  /**
   * @description fetches all the tabs as an observable.
   */
  public getTabList = (): Observable<TabDocument[]> => {
    return this.db.find().sort({ index: "asc" }).$;
  };

  /**
   * @description Clear all the  tabs
   */
  public clearTabs = async (): Promise<void> => {
    this.taskQueue.enqueue(async () => {
      this.db.find()?.remove();
    });
  };

  /**
   * @description updates tab document
   * @param tabId tab id to be updated
   * @param tab new tab document
   */
  public updateTab = async (tabId: string, tab: TabDocType) => {
    const d = await this.findOne({
      tabId,
    });
    d?.incrementalModify((value: TabDocument) => {
      return { ...value, ...tab };
    });
  };
}
