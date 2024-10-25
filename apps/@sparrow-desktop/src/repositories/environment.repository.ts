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

  public refreshEnvironment = async (_environments): Promise<void> => {
    if ((_environments?.length || 0) > 0) {
      await RxDB.getInstance()?.rxdb?.environment?.bulkUpsert(_environments);
    }
    return;
  };

  /**
   * Deletes orphan environments that doesn't exists on sparrow backend
   * @param _workspaceId - workspace id
   * @param _environmentIds - backend environments Ids to find local orphan environments
   */
  public deleteOrphanEnvironments = async (
    _workspaceId: string,
    _environmentIds: string[],
  ): Promise<string[]> => {
    // delete left out environments
    const environments = await RxDB.getInstance()
      ?.rxdb?.environment.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();
    const environmentsJSON = environments?.map((_environment) => {
      return _environment.toMutableJSON();
    });
    const selectedEnvironmentsToBeDeleted = environmentsJSON
      ?.filter((_environment) => {
        for (let i = 0; i < _environmentIds.length; i++) {
          if (_environmentIds[i] === _environment.id) {
            return false;
          }
        }
        return true;
      })
      .map((_environment) => {
        return _environment.id as string;
      }) as string[];
    if ((selectedEnvironmentsToBeDeleted?.length || 0) > 0) {
      await RxDB.getInstance()?.rxdb?.environment.bulkRemove(
        selectedEnvironmentsToBeDeleted as string[],
      );
    }
    return selectedEnvironmentsToBeDeleted;
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

  /**
   * Retrieves an environment by their workspace ID.
   *
   * @param  _workspaceId - The unique identifier of the workspace to filter the test flows.
   * @returns A promise that resolves to an array of environment documents associated with the given workspace ID.
   */
  public getEnvironmentByWorkspaceId = async (
    _workspaceId: string,
  ): Promise<any | undefined> => {
    return await RxDB.getInstance()
      .rxdb.environment?.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();
  };
}
