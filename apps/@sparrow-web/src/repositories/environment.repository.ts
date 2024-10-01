/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentDocument } from "../database/database";
import { environmentType } from "@sparrow/common/enums/environment.enum";
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
      if (data.workspaceId) value.workspaceId = data.workspaceId;
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

  public getGlobalEnvironment = async (_workspaceId) => {
    return await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          workspaceId: _workspaceId,
          type: environmentType.GLOBAL,
        },
      })
      .exec();
  };

  public refreshEnvironment = async (data, workspaceId): Promise<void> => {
    const env = data.map((environment) => {
      environment["id"] = environment._id;
      environment["workspaceId"] = workspaceId;
      delete environment._id;
      return environment;
    });
    await RxDB.getInstance().rxdb.environment.bulkUpsert(env);
    return;
  };

  /**
   * remove environments by workspaceId
   */
  public removeEnvironments = async (_workspaceId: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb.environment.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .remove();
  };
}
