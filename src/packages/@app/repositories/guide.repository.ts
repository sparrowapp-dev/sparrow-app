import { addRxPlugin } from "rxdb";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDB } from "@app/database/database";

addRxPlugin(RxDBUpdatePlugin);

export class GuideRepository {
  static findOne: any;
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find event
   * @param data
   * @returns - found document
   */
  public insert = async (data) => {
    const document = await RxDB.getInstance().rxdb.guide.insert(data);
    return document;
  };

  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.guide.findOne({
        selector: query,
      })
      .exec();
  };
  public update = async (query, updateData) => {
    const rxCollection = RxDB.getInstance().rxdb.guide;
    const foundDocs = await rxCollection
      .findOne({
        selector: query,
      })
      .exec();

    await foundDocs.incrementalModify((value) => {
      return { ...value, ...updateData };
    });
  };
}
