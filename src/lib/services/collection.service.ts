import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
  DeleteRequestName,
  ImportBodyUrl,
  UpdateCollectionName,
} from "$lib/utils/dto";
import { ContentTypeEnum } from "$lib/utils/enums/request.enum";

export class CollectionService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

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

  public updateCollectionData = async (
    collectionId: string,
    workspaceId: string,
    name: UpdateCollectionName,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}`,
      {
        body: name,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteCollection = async (
    workspaceId: string,
    collectionId: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}`,
      { headers: getAuthHeaders() },
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

  public updateFolderInCollection = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    folder: CreateDirectoryPostBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder/${folderId}`,
      {
        body: folder,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteFolderInCollection = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder/${folderId}`,
      {
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

  public updateRequestInCollection = async (
    requestId: string,
    requestBody: CreateApiRequestPostBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/request/${requestId}`,
      {
        body: requestBody,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteRequestInCollection = async (
    requestId: string,
    deleteRequestBody: DeleteRequestName,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/request/${requestId}`,
      {
        body: deleteRequestBody,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public importCollection = async (
    workspaceId: string,
    url: ImportBodyUrl,
    activeSync: boolean = false,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/importUrl/collection`,
      {
        body: { ...url, activeSync },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public importCollectionFile = async (workspaceId: string, file) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/importFile/collection`,
      {
        body: file,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public importCollectionFromJsonObject = async (
    workspaceId: string,
    jsonObject: string,
    contentType: ContentTypeEnum,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/importJson/collection`,
      {
        body: jsonObject,
        headers: { ...getAuthHeaders(), "Content-type": contentType },
      },
    );
    return response;
  };
  public importCollectionFromFile = async (workspaceId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const contentType: ContentTypeEnum = ContentTypeEnum["multipart/form-data"];
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/importFile/collection`,
      {
        body: formData,
        headers: { ...getAuthHeaders(), "Content-type": contentType },
      },
    );
    return response;
  };

  public importCollectionFromCurl = async (curl: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/curl`, {
      body: curl,
      headers: {
        ...getAuthHeaders(),
        "Content-type": ContentTypeEnum["application/json"],
      },
    });
    return response;
  };
}
