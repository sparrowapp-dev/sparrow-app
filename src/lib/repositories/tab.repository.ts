/* eslint-disable @typescript-eslint/no-explicit-any */
import { rxdb, type TabDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class TabRepository {
  constructor() {}
  /**
   * Return all the RxDocument refers to this collection.
   */
  public getDocuments = async (): Promise<TabDocument[]> => {
    return await rxdb.tab.find().sort({ createdAt: "asc" }).exec();
  };

  /**
   * Creates new tab to the tab bar.
   */
  public createTab = async (tab: any): Promise<void> => {
    const activeTab = await rxdb.tab
      .findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    if (activeTab) {
      activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    await rxdb.tab.insert(tab);
    return;
  };

  /**
   * Removes existing tab from the tab bar.
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
    const selectedTab = await rxdb.tab
      .findOne({
        selector: {
          id,
        },
      })
      .exec();
    if (selectedTab) {
      await selectedTab.incrementalRemove();
    }
    return;
  };

  /**
   * Actives existing tab to the tab bar.
   */
  public activeTab = async (id: string): Promise<void> => {
    const deselectedTab = await rxdb.tab
      .findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
    if (deselectedTab && deselectedTab.get("id") === id) return;
    if (deselectedTab) {
      await deselectedTab.incrementalUpdate({ $set: { isActive: false } });
    }
    const selectedTab = await rxdb.tab
      .findOne({
        selector: {
          id,
        },
      })
      .exec();
    if (selectedTab) {
      await selectedTab.incrementalUpdate({ $set: { isActive: true } });
    }
  };

  public getTab = (): Observable<TabDocument> => {
    return rxdb.tab.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  public setRequestProperty = async (
    data: any,
    route: string,
  ): Promise<void> => {
    const query = rxdb.tab
      .findOne({
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

  public setRequestState = async (data: any, route: string): Promise<void> => {
    const query = rxdb.tab
      .findOne({
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

  public setRequestAuth = async (data: any, route: string): Promise<void> => {
    const query = rxdb.tab
      .findOne({
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

  public setRequestBody = async (data: any, route: string): Promise<void> => {
    const query = rxdb.tab
      .findOne({
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

  public setRequestBodyFormData = async (
    data: any,
    route: string,
  ): Promise<void> => {
    const query = rxdb.tab
      .findOne({
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
    const query = rxdb.tab
      .findOne({
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
}
