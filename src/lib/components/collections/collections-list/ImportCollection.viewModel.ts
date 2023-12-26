import { CollectionService } from "$lib/services/collection.service";
import type { ImportBodyUrl } from "$lib/utils/dto";

export class ImportCollectionViewModel {
  private collectionService = new CollectionService();
  constructor() {}

  public importCollectionData = async (
    workspaceId: string,
    url: ImportBodyUrl,
  ) => {
    return await this.collectionService.importCollection(workspaceId, url);
  };

  public importCollectionFile = async (workspaceId: string, file) => {
    return await this.collectionService.importCollectionFile(workspaceId, file);
  };

  public importCollectionFromJsonObject = async (
    workspaceId: string,
    jsonObject,
  ) => {
    return await this.collectionService.importCollectionFromJsonObject(
      workspaceId,
      jsonObject,
    );
  };
}
