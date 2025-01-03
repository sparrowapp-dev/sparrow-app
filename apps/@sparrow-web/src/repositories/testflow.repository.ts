import { RxDB } from "../database/database";
import type {
  TFRxDocumentType,
  TFRxHandlerType,
} from "../models/testflow.model";
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
      if (data?.nodes) value.nodes = data.nodes;
      if (data?.edges) value.edges = data.edges;
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

  /**
   * Refreshes the testflows by adding the `workspaceId` to each testflow and bulk upserting them to the database.
   *
   * @param data - Array of testflow data.
   * @param workspaceId - The ID of the workspace to be added to each testflow.
   * @returns A promise that resolves once the testflows are upserted.
   */
  public refreshTestflow = async (
    _testflows: TFRxDocumentType[],
  ): Promise<void> => {
    if ((_testflows?.length || 0) > 0) {
      await this.rxdb?.bulkUpsert(_testflows);
    }
    return;
  };

  /**
   * Deletes orphan testflows that doesn't exists on sparrow backend
   * @param _workspaceId - workspace id
   * @param _testflowIds - backend testflow Ids to find local orphan testflows
   */
  public deleteOrphanTestflows = async (
    _workspaceId: string,
    _testflowIds: string[],
  ): Promise<string[]> => {
    // delete left out testflows
    const testflows = await RxDB.getInstance()
      ?.rxdb?.testflow.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .exec();
    const testflowsJSON = testflows?.map((_testflow) => {
      return _testflow.toMutableJSON();
    });
    const selectedTestflowsToBeDeleted = testflowsJSON
      ?.filter((_testflow) => {
        for (let i = 0; i < _testflowIds.length; i++) {
          if (_testflowIds[i] === _testflow._id) {
            return false;
          }
        }
        return true;
      })
      .map((_testflow) => {
        return _testflow._id as string;
      }) as string[];
    if ((selectedTestflowsToBeDeleted?.length || 0) > 0) {
      await RxDB.getInstance()?.rxdb?.testflow?.bulkRemove(
        selectedTestflowsToBeDeleted as string[],
      );
    }
    return selectedTestflowsToBeDeleted;
  };

  /**
   * Reads a testflow document by its UUID from the database.
   *
   * @param uuid - The unique ID of the testflow document.
   * @returns A promise that resolves to the testflow document.
   */
  public readTestflow = async (uuid: string): Promise<any> => {
    return await this.rxdb
      ?.findOne({
        selector: {
          _id: uuid,
        },
      })
      .exec();
  };
}
