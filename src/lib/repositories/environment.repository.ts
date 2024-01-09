/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class EnvironmentRepository {
  constructor() {}
  /**
   * @description
   * Adds a new environment to workspace.
   */
  public addEnvironment = async (environment: any) => {
    await RxDB.getInstance().rxdb.environment.insert(environment);
    return;
  };

  /**
   * @description
   * updates existing environment.
   */
  public updateEnvironment = async (uuid: string, data) => {
    const environment = await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
    environment.incrementalModify((value) => {
      if (data._id) value.id = data._id;
      if (data.name) value.name = data.name;
      if (data.type) value.type = data.type;
      if (data.variable) value.variable = data.variable;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      return value;
    });
  };

  public removeEnvironment = async (environentId: string) => {
    const environment = await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          id: environentId,
        },
      })
      .exec();
    if (environment.isActive) {
      const globalEnvironment = await RxDB.getInstance()
        .rxdb.environment.findOne({
          selector: {
            type: "GLOBAL",
          },
        })
        .exec();

      globalEnvironment.incrementalModify((value) => {
        value.isActive = true;
        return value;
      });
    }
    environment.remove();
  };

  public readEnvironment = async (uuid: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
  };

  public getEnvironment = (): Observable<EnvironmentDocument[]> => {
    return RxDB.getInstance().rxdb.environment.find().sort({ createdAt: "asc" })
      .$;
  };

  public refreshEnvironment = async (data): Promise<void> => {
    const env = data.map((environment) => {
      environment["id"] = environment._id;
      delete environment._id;
      return environment;
    });
    await RxDB.getInstance().rxdb.environment.find().remove();
    await RxDB.getInstance().rxdb.environment.bulkUpsert(env);
    return;
  };
}
