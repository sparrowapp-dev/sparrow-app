import { RxDB, type PlanDocument } from "../database/database";

export class PlanRepository {
  constructor() {}

  /**
   * Adds a new Plan to the User.
   * @params - Plan data to be inserted
   */
  public insert = async (plan: any) => {
    await RxDB.getInstance().rxdb.plan.insert(plan);
    return;
  };

  /**
   * Get plan document by id (not observable)
   */
  public getPlan = async (planId: string): Promise<PlanDocument> => {
    return RxDB.getInstance()
      .rxdb.plan.findOne({
        selector: {
          planId: planId,
        },
      })
      .exec();
  };

  /**
   * Remove Plan
   */
  public removePlan = async (planId: string) => {
    const plan = await RxDB.getInstance()
      .rxdb.plan.findOne({
        selector: {
          planId: planId,
        },
      })
      .exec();

    return await plan.remove();
  };
}
