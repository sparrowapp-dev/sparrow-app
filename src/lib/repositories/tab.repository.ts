/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type TabCollection,
  type TabDocument,
} from "$lib/database/app.database";
import type { Observable } from "rxjs";

// static ORM-method for the RxDocument
export type TabDocMethods = {
  getDocument: () => any;
};

// static ORM-method for the RxCollection
export type TabCollectionMethods = {
  createTab: (tab: any) => Promise<void>;
  removeTab: (id: string) => Promise<void>;
  activeTab: (id: string) => Promise<void>;
  getDocuments: () => Promise<TabDocument[]>;
  getTab: () => Observable<TabDocument>;
  setRequestProperty: (data: any, route: string) => Promise<void>;
  setRequestState: (data: any, route: string) => Promise<void>;
  setRequestAuth: (data: any, route: string) => Promise<void>;
  setRequestBody: (data: any, route: string) => Promise<void>;
  setRequestBodyFormData: (data: any, route: string) => Promise<void>;
  setTabProperty: (data: any, route: string) => Promise<void>;
};

const tabDocMethods: TabDocMethods = {
  /**
   * Returns all the properties of this RxDocument.
   */
  getDocument: function (this: TabDocument) {
    return {
      name: this.name,
    };
  },
};

const tabCollectionMethods: TabCollectionMethods = {
  /**
   * Return all the RxDocument refers to this collection.
   */
  getDocuments: async function (): Promise<TabDocument[]> {
    return await this.find().sort({ createdAt: "asc" }).exec();
  },

  /**
   * Creates new tab to the tab bar.
   */
  createTab: async function (this: TabCollection, tab: any): Promise<void> {
    const activeTab = await this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    if (activeTab) {
      activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    await this.insert(tab);
    return;
  },

  /**
   * Removes existing tab from the tab bar.
   */
  removeTab: async function (this: TabCollection, id: string): Promise<void> {
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
    const selectedTab = await this.findOne({
      selector: {
        id,
      },
    }).exec();
    if (selectedTab) {
      await selectedTab.incrementalRemove();
    }
    return;
  },

  /**
   * Actives existing tab to the tab bar.
   */
  activeTab: async function (this: TabCollection, id: string): Promise<void> {
    const deselectedTab = await this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    if (deselectedTab && deselectedTab.get("id") === id) return;
    if (deselectedTab) {
      await deselectedTab.incrementalUpdate({ $set: { isActive: false } });
    }
    const selectedTab = await this.findOne({
      selector: {
        id,
      },
    }).exec();
    if (selectedTab) {
      await selectedTab.incrementalUpdate({ $set: { isActive: true } });
    }
    return;
  },
  getTab: function (this: TabCollection): Observable<TabDocument> {
    return this.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  },

  setRequestProperty: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value.property.request[route] = data;
      return value;
    });
    return;
  },

  setRequestState: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value.property.request.state[route] = data;
      return value;
    });
    return;
  },
  setRequestAuth: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value.property.request.auth[route] = data;
      return value;
    });
    return;
  },

  setRequestBody: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value.property.request.body[route] = data;
      return value;
    });
    return;
  },

  setRequestBodyFormData: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value.property.request.body.formdata[route] = data;
      return value;
    });
    return;
  },

  /**
   * Responsible to change tab property like :
   * id, name, description, save.
   */
  setTabProperty: async function (
    this: TabCollection,
    data: any,
    route: string,
  ): Promise<void> {
    const query = this.findOne({
      selector: {
        isActive: true,
      },
    }).exec();
    (await query).incrementalModify((value) => {
      value[route] = data;
      return value;
    });
    return;
  },
};

export { tabCollectionMethods, tabDocMethods };
