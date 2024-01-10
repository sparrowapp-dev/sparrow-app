/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentTabDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class EnvironmentTabRepository {
  constructor() {}

  /**
   * Creates a new tab and adds it to the tab bar.
   */
  public createTab = async (
    environmentTab: any,
    workspaceId: string,
  ): Promise<void> => {
    console.log(environmentTab);
    const existedTab = await RxDB.getInstance()
      .rxdb.environmentTab.findOne({
        selector: {
          id: environmentTab.id,
        },
      })
      .exec();
    const activeTab = await RxDB.getInstance()
      .rxdb.environmentTab.findOne({
        selector: {
          isActive: true,
          workspaceId,
        },
      })
      .exec();
    if (activeTab) {
      await activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    if (existedTab) {
      await existedTab.incrementalUpdate({ $set: { isActive: true } });
    } else {
      await RxDB.getInstance().rxdb.environmentTab.insert(environmentTab);
    }
  };

  /**
   * Creates a new tab and adds it to the tab bar.
   */
  public deleteEnvironmentTab = async (
    environmentId: string,
  ): Promise<boolean> => {
    const existedTab = await RxDB.getInstance()
      .rxdb.environmentTab.findOne({
        selector: {
          id: environmentId,
        },
      })
      .exec();
    const del = existedTab;
    if (existedTab) {
      await existedTab.remove();
    }
    return del?.get("isActive");
  };

  /**
   * Extracts all data of the active tab.
   */
  public getEnvironmentTab = (
    workspaceId,
  ): Observable<EnvironmentTabDocument> => {
    return RxDB.getInstance().rxdb.environmentTab.findOne({
      selector: {
        isActive: true,
        workspaceId,
      },
    }).$;
  };

  /**
   * Responsible to change tab property like :
   * id, name, description, save.
   */
  public setEnvironmentTabProperty = async (
    data: any,
    route: string,
    id,
  ): Promise<void> => {
    const query = RxDB.getInstance()
      .rxdb.environmentTab.findOne({
        selector: {
          id,
        },
      })
      .exec();
    (await query).incrementalModify((value) => {
      value[route] = data;
      return value;
    });
  };
}
