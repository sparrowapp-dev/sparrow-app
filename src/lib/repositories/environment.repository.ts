/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentDocument } from "$lib/database/app.database";
import type { EnvironmentDto } from "$lib/utils/dto";
import type { Observable } from "rxjs";

export class EnvironmentRepository {
  constructor() {}
  public getDocument = (elem: EnvironmentDocument) => {
    return elem.toMutableJSON();
  };
  /**
   * @description
   * Adds a new environment to workspace.
   */
  public addEnvironment = async (environment: any) => {
    const modifiedEnvironment = {
      ...environment,
      isAcive: true,
    };

    await RxDB.getInstance().rxdb.environment.insert(modifiedEnvironment);
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
      if (data._id) value.id = data._id;
      return value;
    });
    return;
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
    return RxDB.getInstance().rxdb.environment.find().sort({ updatedAt: "asc" })
      .$;
  };

  public getActiveEnvironment = (): Observable<EnvironmentDocument> => {
    return RxDB.getInstance().rxdb.environment.findOne({
      selector: {
        isActive: true,
      },
    }).$;
  };

  public getCurrentEnvironment = async (id: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb.environment.findOne({
        selector: {
          id: id,
        },
      })
      .exec();
  };

  public setActiveEnvironment = async (
    environmentId: string,
  ): Promise<void> => {
    const environments: EnvironmentDocument[] = await RxDB.getInstance()
      .rxdb.environment.find()
      .exec();
    const data = environments.map((elem: EnvironmentDocument) => {
      const res = this.getDocument(elem);
      if (res.type == "GLOBAL") res.isActive = true;
      if (res.id === environmentId) {
        res.isActive = !res.isActive;
      } else if (res.type !== "GLOBAL") {
        res.isActive = false;
      }
      return res;
    });
    await RxDB.getInstance().rxdb.environment.bulkUpsert(data);
    return;
  };

  public bulkInsertData = async (
    environment: EnvironmentDto[],
  ): Promise<void> => {
    // debugger;
    if (environment.length > 0) {
      const updatedEnvironments = environment.map((environmentObj) => {
        environmentObj["id"] = environmentObj._id;
        environmentObj["isActive"] = false;
        environmentObj["environmentId"] = environmentObj.createdAt;
        delete environmentObj._id;
        return environmentObj;
      });
      await RxDB.getInstance().rxdb.environment.bulkUpsert(updatedEnvironments);
    } else {
      await RxDB.getInstance().rxdb.environment.find().remove();
    }
  };
}
