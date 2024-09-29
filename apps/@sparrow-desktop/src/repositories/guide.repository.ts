import { addRxPlugin } from "rxdb";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDB } from "../database/database";

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

  /**
   * Finds a single document that matches the query.
   *
   * @param query - The query object used to find the document.
   * @returns - A promise that resolves to the found document.
   */
  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.guide.findOne({
        selector: query,
      })
      .exec();
  };

  /**
   * @param  query - The query object used to find the document.
   * @param  updateData - The data to update the found document with.
   * @returns - A promise that resolves when the update is complete.
   */
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
