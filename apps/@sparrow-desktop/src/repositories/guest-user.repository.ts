import { RxDB } from "../database/database";
import type { GuestUserDocType } from "../models/guest-user.model";
export class GuestUserRepository {
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find document
   * @returns - found document
   */
  public findOne = async (query) => {
    return await RxDB.getInstance()
      .rxdb.guestuser.findOne({
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
    const document = await RxDB.getInstance().rxdb.guestuser.insert(data);
    return document;
  };

  /**
   * Sync | refresh Features in DB
   */
  public bulkInsertData = async (docs: GuestUserDocType[]): Promise<void> => {
    await RxDB.getInstance().rxdb.guestuser.bulkUpsert(docs);
    return;
  };

  /**
   * Clear tabs
   */
  public clearTabs = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.guestuser.find().remove();
  };

  /**
   * Update guest user state
   */
  public updateGuestUserState = async (query, updatedData): Promise<any> => {
    const doc = await RxDB.getInstance()
      .rxdb.guestuser.findOne({
        selector: query,
      })
      .exec();
    if (doc) {
      // Update the isBannerActive field
      await doc.update({
        $set: updatedData,
      });
    }
  };
}
