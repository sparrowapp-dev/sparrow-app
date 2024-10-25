import { RxDB } from "../database/database";

export class GithubRepoReposistory {
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find document
   * @returns - found document
   */
  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.githubrepo.findOne({
        selector: query,
      })
      .exec();
  };

  /**
   * @description - inserts document to the database
   * @param data - document to be inserted
   * @returns - inserted data
   */
  public insert = async (data) => {
    const document = await RxDB.getInstance().rxdb.githubrepo.insert(data);
    return document;
  };

  /**
   * @description - updates the existing document to the database
   * @param query - query to find document that needs to be updated
   * @param data - updated document to override
   * @returns - updated document
   */
  public update = async (query, data) => {
    const document = await RxDB.getInstance()
      .rxdb.githubrepo.findOne({
        selector: query,
      })
      .exec();

    const res = await document.incrementalPatch(data);
    return res;
  };
}
