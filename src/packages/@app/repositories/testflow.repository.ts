/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentDocument } from "@app/database/database";
import { environmentType } from "$lib/utils/enums/environment.enum";
import type { Observable } from "rxjs";

export class TestflowRepository {
  constructor() {}
  /**
   * @description
   * Adds a new environment to workspace.
   */
  public addTestflow = async (_testflow) => {
    await RxDB.getInstance().rxdb.testflow.insert(_testflow);
    return;
  };

  public getTestflow = (): Observable<EnvironmentDocument[]> => {
    return RxDB.getInstance().rxdb.testflow.find().sort({ createdAt: "asc" }).$;
  };

  /**
   * @description
   * updates existing environment.
   */
  public updateTestflow = async (uuid: string, data) => {
    const testflow = await RxDB.getInstance()
      .rxdb.testflow.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
    testflow.incrementalModify((value) => {
      if (data._id) value.id = data._id;
      if (data.name) value.name = data.name;
      if (data.workspaceId) value.workspaceId = data.workspaceId;
      // if (data.nodes) value.type = data.type;
      // if (data.edges) value.variable = data.variable;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      return value;
    });
  };

  public removeTestflow = async (testflowId: string) => {
    const testflow = await RxDB.getInstance()
      .rxdb.testflow.findOne({
        selector: {
          id: testflowId,
        },
      })
      .exec();

    await testflow.remove();
  };
}
