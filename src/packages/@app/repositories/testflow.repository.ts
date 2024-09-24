import { RxDB } from "@app/database/database";
import type {
  TFRxDocumentType,
  TFRxHandlerType,
} from "@app/models/testflow.model";
import type { Observable } from "rxjs";

export class TestflowRepository {
  private rxdb = RxDB.getInstance()?.rxdb?.testflow;
  constructor() {}
  /**
   * Adds a new test flow document to the database.
   *
   * @param _testflow - The test flow document to be inserted into the database.
   * @returns  A promise that resolves when the test flow has been added.
   */
  public addTestflow = async (_testflow: TFRxDocumentType): Promise<void> => {
    await this.rxdb?.insert(_testflow);
  };

  /**
   * Retrieves an observable that emits the list of test flow documents from the database.
   *
   * @returns An observable that emits an array of test flow documents, sorted by their creation date in ascending order.
   */
  public getTestflowsObserver = ():
    | Observable<TFRxHandlerType[]>
    | undefined => {
    return this.rxdb?.find().sort({ createdAt: "asc" }).$;
  };

  /**
   * Updates a test flow with the provided data.
   *
   * @param uuid - The unique identifier of the test flow (reference to mongoId).
   * @param data - The data object containing updates to be applied to the test flow.
   * @returns A promise that resolves when the test flow is updated.
   */
  public updateTestflow = async (
    uuid: string,
    data: Partial<TFRxDocumentType>,
  ): Promise<void> => {
    const testflow = await this.rxdb
      ?.findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();
    testflow?.incrementalModify((value: TFRxDocumentType) => {
      if (data.name) value.name = data.name;
      if (data.workspaceId) value.workspaceId = data.workspaceId;
      if (data.updatedAt) value.updatedAt = data.updatedAt;
      if (data.updatedBy) value.updatedBy = data.updatedBy;
      if (data.createdBy) value.createdBy = data.createdBy;
      return value;
    });
  };

  /**
   * Removes a test flow document from the database by its ID.
   *
   * @param  _testflowId - The unique identifier of the test flow to be removed.
   * @returns A promise that resolves when the test flow has been successfully removed.
   */
  public removeTestflow = async (_testflowId: string): Promise<void> => {
    const testflow = await this.rxdb
      ?.findOne({
        selector: {
          _id: _testflowId,
        },
      })
      .exec();

    await testflow?.remove();
  };

  /**
   * Retrieves an array of test flow documents by their workspace ID.
   *
   * @param  _workspaceId - The unique identifier of the workspace to filter the test flows.
   * @returns A promise that resolves to an array of test flow documents associated with the given workspace ID.
   */
  public getTestflowByWorkspaceId = async (
    _workspaceId: string,
  ): Promise<TFRxDocumentType[] | undefined> => {
    return await this.rxdb
      ?.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();
  };


  public readTestFlow = async (uuid: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb?.testflow.findOne({
        selector: {
          id: uuid,
        },
      })
      .exec();
  };

  public refreshTestflow = async (data, workspaceId): Promise<void> => {
    const testflows = data.map((_testflow) => {
      _testflow["workspaceId"] = workspaceId;
      return _testflow;
    });
    await RxDB.getInstance().rxdb.testflow.bulkUpsert(testflows);
    return;
  };
}
