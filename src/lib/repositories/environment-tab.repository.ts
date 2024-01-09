/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentTabDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class EnvironmentTabRepository {
  constructor() {}

  /**
   * Creates a new tab and adds it to the tab bar.
   */
  public createTab = async (environmentTab: any): Promise<void> => {
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
   * Extracts all data of the active tab.
   */
  public getEnvironmentTab = (): Observable<EnvironmentTabDocument> => {
    return RxDB.getInstance().rxdb.environmentTab.findOne({
      selector: {
        isActive: true,
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
