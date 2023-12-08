/* eslint-disable @typescript-eslint/no-explicit-any */

import { CollectionService } from "$lib/services/collection.service";
import type { CreateApiRequestPostBody } from "$lib/utils/dto";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
import { notifications } from "$lib/utils/notifications";

export class MyCollectionViewModel {
  private collectionService = new CollectionService();
  constructor() {}

  /**
   * @param collectionsMethods - Methods object coming from Collection View Model
   */

  public addRequest = async (requestData: CreateApiRequestPostBody) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };

  public addRequestInFolderInCollection = async (
    requestData: CreateApiRequestPostBody,
  ) => {
    return await this.collectionService.addRequestInCollection(requestData);
  };

  public modifyCollection = async (
    componentData,
    newCollectionName: string,
    collectionsMethods: CollectionsMethods,
    tabName: string,
  ) => {
    if (newCollectionName) {
      const updateCollectionElement =
        await this.collectionService.updateCollectionData(
          componentData.path.collectionId,
          componentData.path.workspaceId,
          { name: newCollectionName },
        );

      tabName = updateCollectionElement.data.data.name;

      collectionsMethods.updateCollection(
        componentData.path.collectionId,
        updateCollectionElement.data.data,
      );

      collectionsMethods.updateTab(
        tabName,
        "name",
        componentData.path.collectionId,
      );
      collectionsMethods.updateTab(
        true,
        "save",
        componentData.path.collectionId,
      );

      Promise.resolve().then(() => {
        moveNavigation("right");
      });
    }

    if (newCollectionName === "") {
      notifications.error("Please enter text before save");
    }
  };
}
