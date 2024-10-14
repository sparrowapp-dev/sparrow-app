import { RxDB } from "../database/database";
import type { FeatureSwitchDocType } from "../models/feature-switch.model";
import type { UpdatesDocType } from "../models/updates.model";
import type { Observable } from "rxjs";

export class UpdatesRepository {
  constructor() {}

  /**
   * @description - fetches single document
   * @param query - query to find document
   * @returns - found document
   */
  public findOne = async (query) => {
    return await RxDB.getInstance().rxdb.updates.findOne({
      selector: query,
    }).$;
  };

  /**
   * Adds updates.
   * @params - Update data to be inserted
   */
  public insert = async (updates: any) => {
    await RxDB.getInstance().rxdb.updates.insert(updates);
    return;
  };

  /**
   * Inserts or updates updates data for a specified workspace in the local database.
   * Depending on conditions:
   * - Updates an existing document if it exists and the page number is less than 2.
   * - Creates a new document if no existing document is found.
   * - Appends updates to existing updates if the page number is greater than 1 and updates are available.
   *
   * @param updatesResponse - Object containing pageNumber and updates to be inserted.
   * @param workspaceId - The ID of the workspace to which updates belong.
   * @returns A promise that resolves when the updates have been inserted or updated in the database.
   *
   * @example
   * // Example usage:
   * const updatesResponse = {
   *   pageNumber: 1,
   *   updates: [
   *     {
   *       id: 'update123',
   *       type: 'announcement',
   *       message: 'New announcement for workspace A',
   *       workspaceId: 'workspaceA'
   *     },
   *     {
   *       id: 'update124',
   *       type: 'task',
   *       message: 'Task completed for workspace A',
   *       workspaceId: 'workspaceA'
   *     }
   *   ]
   * };
   * const workspaceId = 'workspaceA';
   * await insertUpdates(updatesResponse, workspaceId);
   */
  public async insertUpdates(
    updatesResponse: {
      pageNumber: number;
      updates: UpdatesDocType[];
    },
    workspaceId: string,
  ) {
    const { pageNumber, updates } = updatesResponse;

    // Find existing document for the workspace
    const existingDoc = await RxDB.getInstance()
      .rxdb.updates.findOne({
        selector: { workspaceId: updates[0]?.workspaceId },
      })
      .exec();
    if (
      existingDoc &&
      existingDoc.workspaceId === workspaceId &&
      pageNumber < 2
    ) {
      // If document exists, update the existing updates and page number
      await existingDoc.update({
        $set: {
          pageNumber: pageNumber.toString(),
          updates: updates,
        },
      });
    } else if (updates.length > 0 && !existingDoc) {
      // If no document exists, create a new one
      await RxDB.getInstance().rxdb.updates.insert({
        workspaceId: updates[0].workspaceId,
        pageNumber: pageNumber.toString(),
        updates,
      });
    } else if (existingDoc && pageNumber > 1 && updates.length > 0) {
      const modifiedUpdates = existingDoc.updates;
      modifiedUpdates.push(...updates);
      await existingDoc.update({
        $set: {
          pageNumber: pageNumber.toString(),
          updates: modifiedUpdates,
        },
      });
    }
  }

  /**
   * Retrieves updates data for a specified workspace as an observable stream.
   * Subscribing to this observable provides real-time updates whenever data changes.
   *
   * @param workspaceId - The ID of the workspace to retrieve updates for.
   * @returns An observable stream of updates data (`UpdatesDocType[]`).
   *
   * @example
   * // Example usage:
   * const workspaceId = 'workspaceA';
   * const updatesObservable = getUpdatesObservable(workspaceId);
   * updatesObservable.subscribe((updates) => {
   *   console.log('Received updates:', updates);
   * });
   */
  public getUpdatesObservable(
    workspaceId: string,
  ): Observable<UpdatesDocType[]> {
    return RxDB.getInstance().rxdb.updates.find({ selector: { workspaceId } })
      .$;
  }

  /**
   * Retrieves updates data synchronously for a specified workspace.
   * This method returns an array of updates data (`UpdatesDocType[]`).
   *
   * @param workspaceId - The ID of the workspace to retrieve updates for.
   * @returns An array of updates data (`UpdatesDocType[]`).
   *
   * @example
   * // Example usage:
   * const workspaceId = 'workspaceA';
   * const updates = getUpdatesObservableDocs(workspaceId);
   * console.log('Updates:', updates);
   */
  public getUpdatesObservableDocs(workspaceId: string): UpdatesDocType[] {
    return RxDB.getInstance()
      .rxdb.updates.find({ selector: { workspaceId } })
      .exec();
  }
}
