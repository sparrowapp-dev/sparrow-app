/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type TabDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class TabRepository {
  constructor() {}

  /**
   * Return all the RxDocument refers to this collection in ascending order with respect to createdAt.
   */
  public getDocuments = async (): Promise<TabDocument[]> => {
    return await RxDB.getInstance()
      .rxdb.tab.find()
      .sort({ createdAt: "asc" })
      .exec();
  };

  /**
   * Creates a new tab and adds it to the tab bar.
   */
  public createTab = async (tab: any): Promise<void> => {
    const activeTab = await RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    if (activeTab) {
      activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    await RxDB.getInstance().rxdb.tab.insert(tab);
  };

  /**
   * Removes an existing tab from the tab bar.
   */
  public removeTab = async (id: string): Promise<void> => {
    const doc = await this.getDocuments();
    for (let i = 0; i < doc.length; i++) {
      if (doc[i].get("id") === id) {
        if (doc[i + 1]) {
          await this.activeTab(doc[i + 1].get("id"));
        } else if (doc[i - 1]) {
          await this.activeTab(doc[i - 1].get("id"));
        }
      }
    }
    const selectedTab = await RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          id,
        },
      })
      .exec();
    if (selectedTab) {
      await selectedTab.incrementalRemove();
    }
  };

  /**
   * Activates an existing tab in the tab bar.
   */
  public activeTab = async (id: string): Promise<void> => {
    const deselectedTab = await RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    if (deselectedTab && deselectedTab.get("id") === id) return;
    if (deselectedTab) {
      await deselectedTab.incrementalUpdate({ $set: { isActive: false } });
    }
    const selectedTab = await RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          id,
        },
      })
      .exec();
    if (selectedTab) {
      await selectedTab.incrementalUpdate({ $set: { isActive: true } });
    }
  };

  /**
   * Extracts all data of the active tab.
   */
  public getTab = (): Observable<TabDocument> => {
    return RxDB.getInstance().rxdb.tab.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  /**
   * Return all the RxDocument observable refers to this collection in ascending order with respect to createdAt.
   */
  public getTabList = (): Observable<TabDocument[]> => {
    return RxDB.getInstance().rxdb.tab.find().sort({ createdAt: "asc" }).$;
  };
  /**
   * Configures the request with properties such as URL, method, body, query parameters, headers, authentication, and response handling.
   */
  public setRequestProperty = async (
    data: any,
    route: string,
  ): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value.property.request[route] = data;
      return value;
    });
  };

  /**
   * Configures the request with state such as raw, dataset, auth, section.
   */
  public setRequestState = async (data: any, route: string): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value.property.request.state[route] = data;
      return value;
    });
  };
  /**
   * Configures the request with Auth such as API key, bearer token, basic auth.
   */
  public setRequestAuth = async (data: any, route: string): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value.property.request.auth[route] = data;
      return value;
    });
  };
  /**
   * Configures the request body such as form data, url encoded, raw.
   */
  public setRequestBody = async (data: any, route: string): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value.property.request.body[route] = data;
      return value;
    });
  };
  /**
   * Configures the request body form data such as text and file.
   */
  public setRequestBodyFormData = async (
    data: any,
    route: string,
  ): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value.property.request.body.formdata[route] = data;
      return value;
    });
  };

  /**
   * Responsible to change tab property like :
   * id, name, description, save.
   */
  public setTabProperty = async (data: any, route: string): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.tab.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value[route] = data;
      return value;
    });
  };

  /**
   * Clear tabs
   */
  public clearTabs = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.tab.find().remove();
  };

  public syncTabsWithStore = async (data) => {
    await this.clearTabs();
    const sub = data.subscribe((docs) => {
      RxDB.getInstance().rxdb.tab.bulkUpsert(docs);
    });
    sub();
  };
}
