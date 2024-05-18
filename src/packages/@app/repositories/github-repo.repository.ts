import { RxDB } from "@app/database/database";

export class GithubRepoReposistory {
  constructor() {}

  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.githubrepo.findOne({
        selector: query,
      })
      .exec();
  };

  public insert = async (data) => {
    const document = await RxDB.getInstance().rxdb.githubrepo.insert(data);
    return document;
  };

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
