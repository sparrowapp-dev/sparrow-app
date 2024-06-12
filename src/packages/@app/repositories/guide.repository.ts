import { RxDB } from "@app/database/database";

export class GuideRepository {
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
        return await RxDB.getInstance().rxdb.guide.findOne({
            selector: query,
          })
          .exec();
      };
}