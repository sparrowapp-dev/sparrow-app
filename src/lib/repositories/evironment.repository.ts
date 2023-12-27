/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB } from "$lib/database/app.database";

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
   * updates existing environment to workspace.
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
      if (data.name) value.name = data.name;
      if (data.variable) value.variable = data.variable;
      if (data.type) value.type = data.type;
      if (data._id) value.id = value._id;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdAt) value.createdAt = data.createdAt;
      if (data.createdBy) value.createdBy = data.createdBy;
      return value;
    });
    return;
  };

  public readEnvironment = async (uuid: string): Promise<unknown> => {
    return await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
  };

  public bulkInsertData = async (environment: any[]): Promise<void> => {
    if (environment.length > 0) {
      const updatedEnvironments = environment.map((environmentObj) => {
        environmentObj["id"] = environmentObj._id;
        delete environmentObj._id;
        return environmentObj;
      });
      await RxDB.getInstance().rxdb.environment.find().remove();
      await RxDB.getInstance().rxdb.environment.bulkInsert(updatedEnvironments);
    } else {
      await RxDB.getInstance().rxdb.environment.find().remove();
    }
  };
}
