import { CollectionService } from "@app/services/collection.service";
import type { ImportBodyUrl } from "$lib/utils/dto";
import { ContentTypeEnum } from "$lib/utils/enums/request.enum";
import yaml from "js-yaml";

export class ImportCollectionViewModel {
  private collectionService = new CollectionService();
  constructor() {}

  public importCollectionData = async (
    workspaceId: string,
    url: ImportBodyUrl,
    activeSync: boolean,
  ) => {
    return await this.collectionService.importCollection(
      workspaceId,
      url,
      activeSync,
    );
  };

  public importCollectionFile = async (workspaceId: string, file) => {
    return await this.collectionService.importCollectionFile(workspaceId, file);
  };

  public importCollectionFromJsonObject = async (
    workspaceId: string,
    jsonObject: string,
    contentType: ContentTypeEnum,
  ) => {
    return await this.collectionService.importCollectionFromJsonObject(
      workspaceId,
      jsonObject,
      contentType,
    );
  };
  public importCollectionFromFile = async (workspaceId: string, file: File) => {
    return await this.collectionService.importCollectionFromFile(
      workspaceId,
      file,
    );
  };

  public validateImportBody = (data: string): ContentTypeEnum => {
    let contentType: ContentTypeEnum;
    try {
      JSON.parse(data);
      return (contentType = ContentTypeEnum["application/json"]);
    } catch (jsonError) {
      if (jsonError instanceof SyntaxError) {
        try {
          yaml.load(data);
          return (contentType = ContentTypeEnum["text/plain"]);
        } catch (yamlError) {
          return contentType;
        }
      } else {
        return contentType;
      }
    }
  };
}
