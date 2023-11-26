import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
} from "$lib/utils/dto";

export class CollectionService {
  constructor() {}

  public apiUrl: string = constants.API_URL;

  public fetchCollection = async (workspaceId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/collection/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public addCollection = async (collection: CreateCollectionPostBody) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection`,
      {
        body: collection,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public addFolderInCollection = async (
    workspaceId: string,
    collectionId: string,
    folder: CreateDirectoryPostBody,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder`,
      {
        body: folder,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public addRequestInCollection = async (
    apiRequest: CreateApiRequestPostBody,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/request`,
      {
        body: apiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
