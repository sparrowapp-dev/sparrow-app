/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type TabDocument } from "../database/database";
import type { Tab } from "@sparrow/common/types/workspace";
import type { Observable } from "rxjs";

export class TabRepository {
  private rxdb = RxDB?.getInstance()?.rxdb?.tab;
  constructor() {}

  /**
   * Creates a new tab document in the RxDB database.
   *
   * This function checks if a tab with the provided `id` already exists in the database.
   * If the tab exists, it activates that tab. If not, it deactivates the currently active tab
   * (if any) and inserts the new tab into the database with an incremented index.
   *
   * @param tab - The tab object to be created in the database.
   *
   * @returns {Promise<void>} - A promise that resolves when the tab has been successfully created.
   *
   * @example
   * // Example usage:
   * const newTab = {
   *   id: 'tab1',
   *   name: 'Tab 1',
   *   isActive: true,
   *   // Other tab properties...
   * };
   * await createTab(newTab);
   */
  public createTab = async (tab: any, wsId = ""): Promise<void> => {
    let workspaceId;
    if (wsId) {
      workspaceId = wsId;
    } else {
      const activeWorkspace = await RxDB.getInstance()
        .rxdb.workspace.findOne({
          selector: {
            isActiveWorkspace: true,
          },
        })
        .exec();

      workspaceId = activeWorkspace.toMutableJSON()._id;
    }

    const _tab = await this.rxdb
      ?.findOne({
        selector: {
          "path.workspaceId": workspaceId,
          id: tab.id,
        },
      })
      .exec();
    if (_tab) {
      await this.activeTab(tab.id, workspaceId);
      return;
    }
    const activeTab = await this.rxdb
      ?.findOne({
        selector: {
          "path.workspaceId": workspaceId,
          isActive: true,
        },
      })
      .exec();
    if (activeTab) {
      await activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    const lastIndex = (
      await this.rxdb
        ?.find({
          selector: {
            "path.workspaceId": workspaceId,
          },
        })
        .exec()
    )?.length;
    tab.index = lastIndex;
    await this.rxdb?.insert(tab);
  };

  /**
   * Removes an existing tab from the tab bar.
   *
   * This function removes the tab identified by the provided `id` from the tab bar.
   * If the removed tab is active, it activates the next tab if available; otherwise,
   * it activates the previous tab. It also adjusts the indexes of remaining tabs accordingly.
   *
   * @param {string} id - The ID of the tab to be removed.
   *
   * @returns {Promise<void>} - A promise that resolves when the tab has been successfully removed.
   *
   * @example
   * // Example usage:
   * const tabIdToRemove = 'tab2';
   * await removeTab(tabIdToRemove);
   */
  public removeTab = async (id: string): Promise<void> => {
    const activeWorkspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          isActiveWorkspace: true,
        },
      })
      .exec();
    const workspaceId = activeWorkspace.toMutableJSON()._id;
    const doc = await this.rxdb
      ?.find({
        selector: {
          "path.workspaceId": workspaceId,
        },
      })
      .sort({ index: "asc" })
      .exec();
    for (let i = 0; i < doc.length; i++) {
      if (doc[i].get("id") === id) {
        if (doc[i + 1]) {
          await this.activeTab(doc[i + 1].get("id"));
        } else if (doc[i - 1]) {
          await this.activeTab(doc[i - 1].get("id"));
        }
      }
    }
    const selectedTab = await this.rxdb
      ?.findOne({
        selector: {
          "path.workspaceId": workspaceId,
          id,
        },
      })
      .exec();
    if (selectedTab) {
      doc.forEach(async (tab) => {
        if ((tab?.index as number) > selectedTab.index) {
          await tab.incrementalPatch({
            index: (tab?.index as number) - 1,
          });
        }
      });
      await selectedTab.incrementalRemove();
    }
  };

  /**
   * Activates a specific tab by setting it as active and deactivating any currently active tab.
   *
   * This function finds the currently active tab and deactivates it. Then, it activates
   * the tab identified by the provided `id` by setting its `isActive` property to true.
   *
   * @param {string} id - The ID of the tab to be activated.
   *
   * @returns {Promise<void>} - A promise that resolves when the tab has been successfully activated.
   *
   * @example
   * // Example usage:
   * const tabIdToActivate = 'tab3';
   * await activeTab(tabIdToActivate);
   */
  public activeTab = async (id: string, wsId = ""): Promise<void> => {
    let workspaceId: string;
    if (wsId) {
      workspaceId = wsId;
    } else {
      const activeWorkspace = await RxDB.getInstance()
        .rxdb.workspace.findOne({
          selector: {
            isActiveWorkspace: true,
          },
        })
        .exec();
      workspaceId = activeWorkspace.toMutableJSON()._id;
    }
    const deselectedTab = await this.rxdb
      ?.findOne({
        selector: {
          "path.workspaceId": workspaceId,
          isActive: true,
        },
      })
      .exec();
    if (deselectedTab) {
      if (deselectedTab.id === id) return;
      await deselectedTab.incrementalUpdate({ $set: { isActive: false } });
    }
    const selectedTab = await this.rxdb
      ?.findOne({
        selector: {
          "path.workspaceId": workspaceId,
          id,
        },
      })
      .exec();
    if (selectedTab) {
      await selectedTab.incrementalUpdate({ $set: { isActive: true } });
    }
  };

  /**
   * Retrieves the currently active tab as an observable.
   *
   * This function retrieves the tab document that is currently active, returning it as
   * an observable. It listens for changes to the active tab document in the RxDB database.
   *
   * @returns {Observable<TabDocument>} - An observable that emits the currently active tab document.
   *
   * @example
   * // Example usage:
   * const activeTab = getTab();
   * activeTab.subscribe((tab) => {
   *   console.log('Active tab:', tab);
   * });
   */
  public getTab = (): Observable<TabDocument> => {
    return this.rxdb?.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  public getTabWithWorkspaceId = (
    workspaceId: string,
  ): Observable<TabDocument> | undefined => {
    return this.rxdb?.findOne({
      selector: {
        "path.workspaceId": workspaceId,
        isActive: true,
      },
    }).$;
  };

  /**
   * reorder the tabs on drag and drop
   * @param startIndex - denotes index from which element removed
   * @param endIndex - denotes index at which element pushed
   */
  public rearrangeTab = async (startIndex: number, endIndex: number) => {
    const activeWorkspace = await RxDB.getInstance()
      .rxdb.workspace.findOne({
        selector: {
          isActiveWorkspace: true,
        },
      })
      .exec();
    const workspaceId = activeWorkspace.toMutableJSON()._id;

    const tabDocuments = await this.rxdb
      ?.find({
        selector: {
          "path.workspaceId": workspaceId,
        },
      })
      .sort({ index: "asc" })
      .exec();
    // removes the element
    const element = tabDocuments.splice(startIndex, 1)[0];
    // pushes the element
    tabDocuments.splice(endIndex, 0, element);
    const response = tabDocuments.map((tab: TabDocument, index: number) => {
      const res = tab.toMutableJSON();
      // refreshing indexes
      res.index = index;
      return res;
    });
    await this.rxdb.bulkUpsert(response);
  };

  /**
   * Retrieves a list of all tab documents as an observable, sorted in ascending order by index.
   *
   * This function retrieves all tab documents from the RxDB database and returns them as an observable.
   * The documents are sorted in ascending order based on their `index` property.
   *
   * @returns {Observable<TabDocument[]>} - An observable that emits an array of all tab documents.
   *
   * @example
   * // Example usage:
   * const tabList = getTabList();
   * tabList.subscribe((tabs) => {
   *   console.log('Tab list:', tabs);
   * });
   */
  public getTabList = (): Observable<TabDocument[]> => {
    return this.rxdb?.find().sort({ index: "asc" }).$;
  };

  /**
   * Retrieves a list of all tab documents as an observable by workspaceId, sorted in ascending order by index.
   * @param workspaceId - workspaceId
   */
  public getTabListWithWorkspaceId = (
    workspaceId: string,
  ): Observable<TabDocument[]> => {
    this.rxdb
      ?.find({
        selector: {
          "path.workspaceId": workspaceId,
        },
      })
      .exec()
      .then((tabs: Tab[]) => {
        // elects a new active tab if no tabs is active
        if (tabs?.length > 0) {
          let activeTabsCount = 0;
          let nextElectedTabId = "";
          tabs.forEach((tab: Tab, index: number) => {
            if (!index) {
              nextElectedTabId = tab.tabId;
            }
            if (tab.isActive) activeTabsCount++;
          });
          if (!activeTabsCount) {
            this.updateTab(nextElectedTabId, { isActive: true });
          }
        }
      });

    return this.rxdb
      ?.find({
        selector: {
          "path.workspaceId": workspaceId,
        },
      })
      .sort({ index: "asc" }).$;
  };

  /**
   * Retrieves a sorted list of all tab documents synchronously.
   *
   * This function retrieves all tab documents from the RxDB database synchronously
   * and returns them as a sorted array based on their `index` property in ascending order.
   *
   * @returns {TabDocument[]} - An array of all tab documents sorted in ascending order by index.
   *
   * @example
   * // Example usage:
   * const tabs = getTabLs();
   * console.log('Tabs:', tabs);
   */
  public getTabLs = async (): Promise<TabDocument[]> => {
    return await this.rxdb?.find().sort({ index: "asc" }).exec();
  };

  /**
   * Configures the request properties such as URL, method, body, query parameters, headers, authentication, and response handling for the active tab.
   *
   * This function retrieves the currently active tab and modifies its request properties based on the provided `route` and `data`.
   * It then updates the tab document in the RxDB database.
   *
   * @param {any} data - The data to be set for the specified request property.
   * @param {string} route - The route or property name within the request object where the data should be set.
   *
   * @returns {Promise<void>} - A promise that resolves when the request property has been successfully configured.
   *
   * @example
   * // Example usage:
   * const requestData = { url: 'https://api.example.com', method: 'GET' };
   * await setRequestProperty(requestData, 'url');
   */
  // public setRequestProperty = async (
  //   data: any,
  //   route: string,
  // ): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value.property.request[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Sets a specific property of the request state for the active tab in the RxDB database such as raw, dataset, auth, section.
   *
   * This function finds the active tab document in the RxDB database and updates a specific
   * property of the request state with the provided data. The specific request state property
   * to be updated is specified by the `route` parameter.
   *
   * @param {any} data - The data to set for the specified request state property.
   * @param {string} route - The request state property to be updated.
   *
   * @returns {Promise<void>} - A promise that resolves when the request state property has been updated.
   *
   * @example
   * // Example usage:
   * const requestStateData = { requestBodyLanguage: 'json' };
   * const requestStateRoute = 'requestBodyLanguage'; // Updating the 'requestBodyLanguage' property of the request state
   * await setRequestState(requestStateData, requestStateRoute);
   */
  // public setRequestState = async (data: any, route: string): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value.property.request.state[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Sets a specific property of the request authentication for the active tab in the RxDB database like API key, bearer token, basic auth.
   *
   * This function finds the active tab document in the RxDB database and updates a specific
   * property of the request authentication with the provided data. The specific request
   * authentication property to be updated is specified by the `route` parameter.
   *
   * @param {any} data - The data to set for the specified request authentication property.
   * @param {string} route - The request authentication property to be updated.
   *
   * @returns {Promise<void>} - A promise that resolves when the request authentication property has been updated.
   *
   * @example
   * // Example usage:
   * const requestAuthData = { bearerToken: 'token123' };
   * const requestAuthRoute = 'bearerToken'; // Updating the 'bearerToken' property of the request authentication
   * await setRequestAuth(requestAuthData, requestAuthRoute);
   */
  // public setRequestAuth = async (data: any, route: string): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value.property.request.auth[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Sets a specific property of the request body for the active tab in the RxDB database such as form data, url encoded, raw.
   *
   * This function finds the active tab document in the RxDB database and updates a specific
   * property of the request body with the provided data. The specific request body property
   * to be updated is specified by the `route` parameter.
   *
   * @param {any} data - The data to set for the specified request body property.
   * @param {string} route - The request body property to be updated.
   *
   * @returns {Promise<void>} - A promise that resolves when the request body property has been updated.
   *
   * @example
   * // Example usage:
   * const requestBodyData = { key: 'value' };
   * const requestBodyRoute = 'raw'; // Assuming updating the 'raw' property of the request body
   * await setRequestBody(requestBodyData, requestBodyRoute);
   */
  // public setRequestBody = async (data: any, route: string): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value.property.request.body[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Sets the form data of the request body for the active tab in the RxDB database.
   *
   * This function finds the active tab document in the RxDB database and updates the form data
   * of the request body with the provided data. The specific form data property to be updated
   * is specified by the `route` parameter.
   *
   * @param {any} data - The data to set for the specified form data property of the request body.
   * @param {string} route - The form data property of the request body to be updated.
   *
   * @returns {Promise<void>} - A promise that resolves when the form data has been updated.
   *
   * @example
   * // Example usage:
   * const formData = { key: 'value' };
   * const formDataRoute = '0'; // Assuming updating the first item in the form data array
   * await setRequestBodyFormData(formData, formDataRoute);
   */
  // public setRequestBodyFormData = async (
  //   data: any,
  //   route: string,
  // ): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value.property.request.body.formdata[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Sets a specific property of the active tab in the RxDB database.
   *
   * This function finds the active tab document in the RxDB database and updates a specific
   * property of the tab with the provided data. The property to be updated is specified by
   * the `route` parameter.
   *
   * @param {any} data - The data to set for the specified property of the active tab.
   * @param {string} route - The property of the tab to be updated.
   *
   * @returns {Promise<void>} - A promise that resolves when the property has been updated.
   *
   * @example
   * // Example usage:
   * const propertyData = { key: 'value' };
   * const propertyRoute = 'property.subProperty';
   * await setTabProperty(propertyData, propertyRoute);
   */
  // public setTabProperty = async (data: any, route: string): Promise<void> => {
  //   const query = this.rxdb?.findOne({
  //       selector: {
  //         isActive: true,
  //       },
  //     })
  //     .exec();
  //   (await query).incrementalModify((value) => {
  //     value[route] = data;
  //     return value;
  //   });
  // };

  /**
   * Clears all tab documents from the RxDB database.
   *
   * This function removes all tab documents from the RxDB database, effectively clearing
   * the entire collection of tabs.
   *
   * @returns {Promise<any>} - A promise that resolves when all tabs have been removed.
   *
   * @example
   * // Example usage:
   * await clearTabs();
   */
  public clearTabs = async (): Promise<any> => {
    return this.rxdb?.find().remove();
  };

  /**
   * Synchronizes the tabs in the RxDB database with the provided data store.
   *
   * This function clears the existing tabs in the database and then subscribes to the
   * provided data store. Whenever the data store emits new documents, it upserts them
   * into the database.
   *
   * @param {Observable<TabDocument[]>} data - An observable that emits an array of tab documents to be synchronized.
   *
   * @returns {Promise<void>} - A promise that resolves when the initial sync operation is complete.
   *
   * @example
   * // Example usage:
   * const tabData$ = getTabDataObservable(); // An observable emitting tab documents
   * await syncTabsWithStore(tabData$);
   */
  // public syncTabsWithStore = async (data) => {
  //   await this.clearTabs();
  //   const sub = data.subscribe((docs) => {
  //     this.rxdb?.bulkUpsert(docs);
  //   });
  //   sub();
  // };

  /**
   * Updates a tab document in the RxDB database.
   *
   * This function finds a tab document by its `tabId` and updates it with the new properties
   * provided in the `tab` parameter. It merges the existing properties with the new ones and
   * updates the document in the database.
   *
   * @param {string} tabId - The ID of the tab to be updated.
   * @param {Partial<TabDocument>} tab - An object containing the properties to be updated.
   *                                     This object is merged with the existing properties of the tab.
   *
   * @returns {Promise<void>} - A promise that resolves when the tab has been updated.
   *
   * @example
   * // Example usage:
   * const tabId = 'tab123';
   * const updatedProperties = {
   *   name: 'Updated Tab Name',
   *   isActive: false
   * };
   * await updateTab(tabId, updatedProperties);
   */
  public updateTab = async (
    tabId: string,
    tab: Partial<Tab>,
  ): Promise<void> => {
    const query = await this.rxdb
      ?.findOne({
        selector: {
          tabId,
        },
      })
      .exec();
    await query?.incrementalModify((value: Tab) => {
      return { ...value, ...tab };
    });
  };

  public updateTabByMongoId = async (
    _mongoId: string,
    tab: Partial<Tab>,
  ): Promise<void> => {
    const query = await this.rxdb
      ?.findOne({
        selector: {
          id: _mongoId,
        },
      })
      .exec();
    await query?.incrementalModify((value: Tab) => {
      return { ...value, ...tab };
    });
  };

  /**
   * Retrieves a tab by its unique identifier.
   *
   * This function searches for a tab within the provided array of tabs based on the given `tabId`.
   * If a tab with the matching ID is found, it is returned; otherwise, the function returns `undefined`.
   *
   * @param {Array<{ id: string, [key: string]: any }>} tabs - An array of tab objects, where each tab contains at least an `id` property.
   * @param {string} tabId - The unique identifier of the tab to retrieve.
   * @returns {{ id: string, [key: string]: any } | undefined} - The tab object with the matching `tabId`.
   */

  public getTabById = async (id: string): Promise<TabDocument> => {
    return await this.rxdb
      ?.findOne({
        selector: {
          id,
        },
      })
      .exec();
  };

  /**
   * Removes tabs from the RxDB database that match the given query.
   *
   * This function allows for flexible removal of tabs by specifying a query
   * that determines which tabs to remove. The query parameter should be
   * structured according to the RxDB query syntax.
   *
   * @param {any} query - The query object that specifies the conditions for selecting the tabs to be removed.
   *                      Example query:
   *                      {
   *                        selector: {
   *                          'path.workspaceId': 'yourWorkspaceId'
   *                        }
   *                      }
   *
   * @returns {Promise<void>} - A promise that resolves when the tabs have been removed.
   *
   * @example
   * // Example usage:
   * const query = {
   *   selector: {
   *     'path.workspaceId': 'workspace123'
   *   }
   * };
   * await removeTabsByQuery(query);
   * // This will remove all tabs with the workspaceId 'workspace123'.
   */
  public removeTabsByQuery = async (query: any): Promise<void> => {
    await this.rxdb?.find(query).remove();
    return;
  };

  /**
   * Activates the initial tab in the RxDB database.
   *
   * This function finds the first tab document in the RxDB database, marks it as active,
   * and updates the database accordingly. If no tab is found, it returns an empty string.
   *
   * @returns {Promise<string>} - A promise that resolves to the ID of the activated tab.
   *                              If no tab is found, it resolves to an empty string.
   *
   * @example
   * // Example usage:
   * const activatedTabId = await activateInitialTab();
   * if (activatedTabId) {
   *   console.log(`Activated tab with ID: ${activatedTabId}`);
   * }
   */
  public activateInitialTab = async (): Promise<string> => {
    const tab: TabDocument = await this.rxdb?.findOne().exec();
    if (tab) {
      const rxDoc = tab.toMutableJSON();
      rxDoc.isActive = true;
      await this.rxdb?.upsert(rxDoc);
      return tab.id;
    } else {
      return "";
    }
  };

  /**
   * Retrieves the active tab document from the RxDB database.
   *
   * This function queries the RxDB database to find a tab document where the `isActive`
   * property is set to `true`. It returns a promise that resolves to the active tab document.
   *
   * @returns {Promise<TabDocument>} - A promise that resolves to the active tab document.
   *                                   If no active tab is found, the promise resolves to `null`.
   *
   * @example
   * // Example usage:
   * const activeTab = await getTabDocs();
   * if (activeTab) {
   *   console.log('Active tab:', activeTab);
   * }
   */
  public getTabDocs = (): Promise<TabDocument> => {
    return this.rxdb
      ?.findOne({
        selector: {
          isActive: true,
        },
      })
      .exec();
  };
}
