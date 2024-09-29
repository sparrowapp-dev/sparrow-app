import { RxDB } from "../database/database";
import type { FeatureSwitchDocType } from "../models/feature-switch.model";

export class FeatureSwitchRepository {
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find document
   * @returns - found document
   */
  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.featureswitch.findOne({
        selector: query,
      })
      .exec();
  };

  /**
   * Sync | refresh Features in DB
   */
  public bulkInsertData = async (
    docs: FeatureSwitchDocType[],
  ): Promise<void> => {
    await RxDB.getInstance().rxdb.featureswitch.bulkUpsert(docs);
    return;
  };
}
