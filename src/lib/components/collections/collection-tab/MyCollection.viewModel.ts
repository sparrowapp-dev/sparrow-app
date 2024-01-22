/* eslint-disable @typescript-eslint/no-explicit-any */

import { CollectionService } from "$lib/services/collection.service";
import type { CreateApiRequestPostBody } from "$lib/utils/dto";
import { UntrackedItems } from "$lib/utils/enums/item-type.enum";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

import { generateSampleRequest } from "$lib/utils/sample/request.sample";
import { v4 as uuidv4 } from "uuid";

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
  };

  public createApiRequest = async (
    componentData,
    collectionsMethods: CollectionsMethods,
  ) => {
    const request = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );
    const requestObj = {
      collectionId: componentData.path.collectionId,
      workspaceId: componentData.path.workspaceId,
      items: {
        name: request.name,
        type: request.type,
        request: {
          method: request.property.request.method,
        },
      },
    };
    collectionsMethods.addRequestOrFolderInCollection(
      componentData.path.collectionId,
      {
        ...requestObj.items,
        id: request.id,
      },
    );
    const response = await this.addRequest(requestObj);

    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      collectionsMethods.updateRequestOrFolderInCollection(
        componentData.path.collectionId,
        request.id,
        res,
      );
      request.id = res.id;
      request.path.workspaceId = componentData.path.workspaceId;
      request.path.collectionId = componentData.path.collectionId;
      collectionsMethods.handleCreateTab(request);

      moveNavigation("right");
      return response;
    }
  };
}
