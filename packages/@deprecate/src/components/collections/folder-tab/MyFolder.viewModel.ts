/* eslint-disable @typescript-eslint/no-explicit-any */

import { CollectionService } from "@app/services/collection.service";
import type { CreateApiRequestPostBody } from "$lib/utils/dto";
import { ItemType, UntrackedItems } from "$lib/utils/enums/item-type.enum";
import { moveNavigation } from "$lib/utils/helpers/navigation";
import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

import { generateSampleRequest } from "$lib/utils/sample/request.sample";
import { v4 as uuidv4 } from "uuid";

export class MyFolderViewModel {
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

  public modifyFolder = async (
    componentData,
    property: string,
    value: string,
    collectionsMethods: CollectionsMethods,
    currentCollection,
  ) => {
    const updateObj = {};
    updateObj[property] = value;
    let userSource = {};
    if (componentData?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: currentCollection?.currentBranch,
        source: "USER",
      };
    }
    const updateFolderElement =
      await this.collectionService.updateFolderInCollection(
        componentData.path.workspaceId,
        componentData.path.collectionId,
        componentData.path.folderId,
        { ...updateObj, ...userSource },
      );
    await collectionsMethods.updateRequestOrFolderInCollection(
      componentData.path.collectionId,
      componentData.path.folderId,
      updateFolderElement.data.data,
    );

    collectionsMethods.updateTab(value, property, componentData.path.folderId);
    collectionsMethods.updateTab(true, "save", componentData.path.folderId);
    Promise.resolve().then(() => {
      moveNavigation("right");
    });
  };

  public createApiRequest = async (
    componentData,
    collectionsMethods: CollectionsMethods,
    currentCollection,
  ) => {
    const sampleRequest = generateSampleRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      new Date().toString(),
    );

    let userSource = {};
    if (componentData?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: currentCollection?.currentBranch,
        source: "USER",
      };
    }

    const requestObj: CreateApiRequestPostBody = {
      collectionId: componentData.path.collectionId,
      workspaceId: componentData.path.workspaceId,
      folderId: componentData.path.folderId,
      ...userSource,
      items: {
        name: componentData.name,
        type: ItemType.FOLDER,
        items: {
          name: sampleRequest.name,
          type: sampleRequest.type,
          description: "",
          request: {
            method: sampleRequest.property.request.method,
          },
        },
      },
    };

    collectionsMethods.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,

      {
        ...requestObj.items.items,
        id: sampleRequest.id,
      },
    );
    const response = await this.addRequestInFolderInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      collectionsMethods.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        sampleRequest.id,
        request,
      );

      sampleRequest.id = request.id;
      sampleRequest.path = componentData.path;

      collectionsMethods.handleCreateTab(sampleRequest);
      moveNavigation("right");
      return response;
    }
  };
}
