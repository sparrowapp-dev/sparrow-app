import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import { CollectionRepository } from "../repositories/collection.repository";
import constants from "@app/constants/constants";
import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
  DeleteRequestName,
  ImportBodyUrl,
  UpdateCollectionName,
} from "@deprecate/utils/dto";
import { ContentTypeEnum } from "@deprecate/utils/enums/request.enum";
import { createApiRequest } from "./rest-api.service";

export class CollectionService {
  constructor() {}

  private apiUrl: string = constants.API_URL;
  private collectionRepository = new CollectionRepository();

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
    body,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder/${folderId}`,
      {
        body,
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

  public addSocketInCollection = async (apiRequest) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/websocket`,
      {
        body: apiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateSocketInCollection = async (requestId: string, requestBody) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/websocket/${requestId}`,
      {
        body: requestBody,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteSocketInCollection = async (
    requestId: string,
    deleteRequestBody,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/websocket/${requestId}`,
      {
        body: deleteRequestBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public validateImportCollectionInput = async (
    data: string = "",
    jsonXml = "",
  ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/validate/oapi`, {
      body: jsonXml,
      headers: {
        ...getAuthHeaders(),
        "x-oapi-url": data,
        "Content-type": ContentTypeEnum["application/json"],
      },
    });
    return response;
  };

  public validateImportCollectionURL = async (url = "") => {
    return createApiRequest(
      [
        url,
        `GET`,
        `Accept[SPARROW_EQUALS]*/*[SPARROW_AMPERSAND]Connection[SPARROW_EQUALS]keep-alive`,
        ``,
        `TEXT`,
      ],
      ``,
    );
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

  public switchCollectionBranch = async (
    collectionId: string,
    branchName: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/${collectionId}/branch`,
      {
        body: {
          branchName,
        },
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
      body: {
        curl: curl,
      },
      headers: {
        ...getAuthHeaders(),
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };
}
