import { RxDB, type TabDocument } from "@app/database/database";
import type { TabDocType } from "@app/models/tab.model";
import type { Tab } from "@common/types/workspace";
import { TaskQueue } from "@common/utils";
import type { Observable } from "rxjs";

export class TabRepository {
  constructor() {}
  private taskQueue = new TaskQueue();
  private db = RxDB?.getInstance()?.rxdb?.tab;

  /**
   * Finds a single tab based on the provided query.
   * @param query - The query to search for a tab.
   * @returns - The found tab document.
   */
  private findOne = async (query: unknown) => {
    return await this.db
      .findOne({
        selector: query,
      })
      .exec();
  };

  /**
   * Bulk upserts (updates or inserts) multiple tab documents.
   * @param data - The array of tab documents to upsert.
   */
  private bulkUpsert = async (data: TabDocType[]): Promise<void> => {
    await this.db.bulkUpsert(data);
  };

  /**
   * Inserts a new tab document.
   * @param data - The tab document to insert.
   */
  private insert = async (data: TabDocType): Promise<void> => {
    await this.db.insert(data);
  };

  /**
   * Retrieves sorted tab documents based on the provided query.
   * @param query - The query to sort the tabs.
   * @returns - The sorted array of tab documents.
   */
  private getSortedTabs = async (query: unknown) => {
    return await this.db.find().sort(query).exec();
  };

  /**
   * Creates a new tab and adds it to the tab bar.
   * @param tab - The tab document to create.
   */
  public createTab = async (tab: Tab): Promise<void> => {
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
      // inserting new tab
      tab.index = index;
      tab.isActive = true;
      await this.insert(tab);
    });
  };

  /**
   * Gets the ID of the next active tab.
   * @param doc - The array of tab documents.
   * @param id - The ID of the current tab.
   * @returns - The ID of the next active tab.
   */
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
   * Removes an existing tab from the tab bar.
   * @param id - The ID of the tab to be removed.
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
   * Activates an existing tab in the tab bar.
   * @param id - The ID of the tab to be activated.
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
   * reorder the tabs on drag and drop
   * @param startIndex - denotes index from which element removed
   * @param endIndex - denotes index at which element pushed
   */
  public reorderTabs = async (startIndex: number, endIndex: number) => {
    const tabDocuments = [...(await this.getSortedTabs({ index: "asc" }))];
    const element = tabDocuments.splice(startIndex, 1)[0]; // removes the elemnt
    tabDocuments.splice(endIndex, 0, element); // pushes the element
    const response = tabDocuments.map((tab, index) => {
      tab.patch({
        index: index, // fixing indexes
      });
      return tab;
    });
    await this.bulkUpsert(response);
  };

  /**
   * Extracts all data of the active tab.
   * @returns - An observable of the active tab document.
   */
  public getTab = (): Observable<TabDocument> => {
    return this.db.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  /**
   * Fetches all the tabs as an observable.
   * @returns - An observable array of tab documents.
   */
  public getTabList = (): Observable<TabDocument[]> => {
    return this.db.find().sort({ index: "asc" }).$;
  };

  /**
   * Clears all the tabs.
   */
  public clearTabs = async (): Promise<void> => {
    this.taskQueue.enqueue(async () => {
      this.db.find()?.remove();
    });
  };

  /**
   * Updates a tab document.
   * @param tabId - The ID of the tab to be updated.
   * @param tab - The new tab document data.
   */
  public updateTab = async (tabId: string, tab: TabDocType): Promise<void> => {
    const d = await this.findOne({
      tabId,
    });
    d?.incrementalModify((value: TabDocument) => {
      return { ...value, ...tab };
    });
  };
}
