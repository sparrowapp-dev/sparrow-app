import { RxDB, type TeamDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TeamRepository {
  constructor() {}
  /**
   * get all teams observable of user
   */
  public getTeams = (): Observable<TeamDocument[]> => {
    return RxDB.getInstance().rxdb.team.find().$;
  };

  /**
   * clear teams data
   */
  public clearTeams = async (): Promise<any> => {
    return RxDB.getInstance().rxdb.team.find().remove();
  };

  /**
   * sync / refresh teams data
   */
  public bulkInsertData = async (data: any): Promise<void> => {
    await this.clearTeams();
    await RxDB.getInstance().rxdb.team.bulkInsert(data);
    return;
  };
}
