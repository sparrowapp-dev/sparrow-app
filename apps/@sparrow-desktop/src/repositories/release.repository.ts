import { RxDB } from "../database/database";

export class ReleaseRepository {
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find document
   * @returns - found document
   */
  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.releaseupdate.findOne({
        selector: query,
      })
      .exec();
  };

  /**
   * @description - fetches all documents matching the query
   * @param query - query to find documents
   * @returns - array of found documents
   */
  public findAll = async () => {
    const data = await RxDB.getInstance().rxdb.releaseupdate.find().exec();
    return data;
  };

  /**
   * @description - inserts document to the database
   * @param data - document to be inserted
   * @returns - inserted data
   */

  public bulkInsertData = async (data: any): Promise<void> => {
    await RxDB.getInstance().rxdb.releaseupdate.bulkUpsert(data);
    return;
  };

  /**
   * @description - updates the existing document in the database
   * @param query - query to find document that needs to be updated
   * @param data - updated document to override
   * @returns - updated document
   */
  public update = async (query, data) => {
    const document = await RxDB.getInstance()
      .rxdb.releaseupdate.findOne({
        selector: query,
      })
      .exec();

    if (document) {
      const res = await document.incrementalPatch(data);
      return res;
    } else {
      console.error("Document not found");
    }
  };
}
