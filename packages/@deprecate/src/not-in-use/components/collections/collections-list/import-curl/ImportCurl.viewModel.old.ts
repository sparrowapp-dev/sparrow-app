import { CollectionService } from "@app/services/collection.service";

export class ImportCurlViewModel {
  private collectionService = new CollectionService();

  public importCollectionFromCurl = async (curl: string) => {
    const response =
      await this.collectionService.importCollectionFromCurl(curl);
    return response;
  };
}
