import {
  connectSocketIo,
  connectWebSocket,
  disconnectSocketIo,
  disconnectWebSocket,
  getAuthHeaders,
  makeRequest,
  sendMessage,
  sendSocketIoMessage,
} from "@app/containers/api/api.common";
import { CollectionRepository } from "../repositories/collection.repository";
import constants from "@app/constants/constants";
import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
  DeleteRequestName,
  ImportBodyUrl,
  UpdateCollectionName,
} from "@sparrow/common/dto";
import { ContentTypeEnum } from "@sparrow/common/enums/request.enum";
import type {
  HttpClientBackendResponseInterface,
  HttpClientResponseInterface,
} from "@app/types/http-client";
import {
  type CollectionDtoInterface,
  type CollectionItemDtoInterface,
} from "@sparrow/common/types/workspace/collection-dto";
import type {
  SocketIORequestCreateUpdateInCollectionPayloadDtoInterface,
  SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
  SocketIORequestDeletePayloadDtoInterface,
} from "@sparrow/common/types/workspace/socket-io-request-dto";
import type {
  GraphqlRequestAuthDtoInterface,
  GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface,
  GraphqlRequestCreateUpdateInFolderPayloadDtoInterface,
  GraphqlRequestDeletePayloadDtoInterface,
  GraphqlRequestKeyValueDtoInterface,
} from "@sparrow/common/types/workspace/graphql-request-dto";
import { CollectionItemTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
import type { GraphqlRequestAuthModeBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
import type {
  HttpRequestSavedCreateUpdatePayloadDtoInterface,
  HttpRequestSavedDeletePayloadDtoInterface,
  HttpRequestSavedUpdatePayloadDtoInterface,
} from "@sparrow/common/types/workspace/http-request-saved-dto";

export class CollectionService {
  constructor() {}

  private apiUrl: string = constants.API_URL;
  private collectionRepository = new CollectionRepository();

  public fetchCollection = async (workspaceId: string, baseUrl: string) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/collection/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchPublicCollection = async (
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/collection/public/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public addCollection = async (
    collection: CreateCollectionPostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest("POST", `${baseUrl}/api/collection`, {
      body: collection,
      headers: getAuthHeaders(),
    });
    return response;
  };

  public updateCollectionData = async (
    collectionId: string,
    workspaceId: string,
    name: UpdateCollectionName,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}`,
      { headers: getAuthHeaders() },
    );

    return response;
  };

  public addFolderInCollection = async (
    workspaceId: string,
    collectionId: string,
    folder: CreateDirectoryPostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder/${folderId}`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder/${folderId}`,
      {
        body,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public addRequestInCollection = async (
    apiRequest: CreateApiRequestPostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/request`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/request/${requestId}`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/request/${requestId}`,
      {
        body: deleteRequestBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public addSocketInCollection = async (apiRequest, baseUrl: string) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/websocket`,
      {
        body: apiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateSocketInCollection = async (
    requestId: string,
    requestBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/websocket/${requestId}`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/websocket/${requestId}`,
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

  public validateImportCollectionFileUpload = async (
    data: string = "",
    jsonXml = "",
  ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/validate/file`, {
      body: jsonXml,
      headers: {
        ...getAuthHeaders(),
        "x-oapi-url": data,
        "Content-type": ContentTypeEnum["application/json"],
      },
    });
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

  public importCollectionFromPostmanFile = async (
    workspaceId: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    const contentType: ContentTypeEnum = ContentTypeEnum["multipart/form-data"];
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/${workspaceId}/importPostmanCollection`,
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

  public parseOAPIJSONToCollection = async (
    json: string,
    contentType: ContentTypeEnum,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/parse-collection`,
      {
        body: json,
        headers: { ...getAuthHeaders(), "Content-type": contentType },
      },
    );
    return response;
  };

  public addSocketIoInCollection = async (
    _socketIo:
      | SocketIORequestCreateUpdateInCollectionPayloadDtoInterface
      | SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/socketio`,
      {
        body: _socketIo,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateSocketIoInCollection = async (
    _socketIoId: string,
    _socketIo:
      | SocketIORequestCreateUpdateInCollectionPayloadDtoInterface
      | SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/socketio/${_socketIoId}`,
      {
        body: _socketIo,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteSocketIoInCollection = async (
    _socketIoId: string,
    _socketIo: SocketIORequestDeletePayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/socketio/${_socketIoId}`,
      {
        body: _socketIo,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  // public connectSocketIo = async (
  //   _url: string,
  //   _tabId: string,
  //   _headers: string,
  // ) => {
  //   return connectSocketIo(_url, _tabId, _headers);
  // };
  // public disconnectSocketIo = async (_tabId: string) => {
  //   return disconnectSocketIo(_tabId);
  // };
  // public sendMessageSocketIo = async (
  //   _tabId: string,
  //   _message: string,
  //   _eventName: string,
  // ) => {
  //   return sendSocketIoMessage(_tabId, _message, _eventName);
  // };

  public addGraphqlInCollection = async (
    _graphql:
      | GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface
      | GraphqlRequestCreateUpdateInFolderPayloadDtoInterface,
    _baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${_baseUrl}/api/collection/graphql`,
      {
        body: _graphql,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateGraphqlInCollection = async (
    _graphqlId: string,
    _collectionId: string,
    _workspaceId: string,
    _graphql: {
      name: string;
      description: string;
      url: string;
      mutation?: string;
      query?: string;
      schema?: string;
      variables?: string;
      headers?: GraphqlRequestKeyValueDtoInterface[];
      auth?: GraphqlRequestAuthDtoInterface;
      selectedGraphqlAuthType: GraphqlRequestAuthModeBaseEnum;
    },
    _baseUrl: string,
    _folderId?: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    let graphqlBody:
      | GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface
      | GraphqlRequestCreateUpdateInFolderPayloadDtoInterface;

    if (_folderId) {
      graphqlBody = {
        collectionId: _collectionId,
        workspaceId: _workspaceId,
        folderId: _folderId,
        items: {
          id: _folderId,
          type: CollectionItemTypeBaseEnum.FOLDER,
          items: {
            id: _graphqlId,
            name: _graphql.name as string,
            description: _graphql?.description,
            type: CollectionItemTypeBaseEnum.GRAPHQL,
            graphql: {
              url: _graphql.url,
              query: _graphql.query,
              mutation: _graphql.mutation,
              schema: _graphql.schema,
              variables: _graphql.variables,
              headers: _graphql.headers,
              auth: _graphql.auth,
              selectedGraphqlAuthType: _graphql.selectedGraphqlAuthType,
            },
          },
        },
      };
    } else {
      graphqlBody = {
        collectionId: _collectionId,
        workspaceId: _workspaceId,
        items: {
          id: _graphqlId,
          name: _graphql?.name as string,
          description: _graphql?.description,
          type: CollectionItemTypeBaseEnum.GRAPHQL,
          graphql: {
            url: _graphql.url,
            query: _graphql.query,
            mutation: _graphql.mutation,
            schema: _graphql.schema,
            variables: _graphql.variables,
            headers: _graphql.headers,
            auth: _graphql.auth,
            selectedGraphqlAuthType: _graphql.selectedGraphqlAuthType,
          },
        },
      };
    }
    const response = await makeRequest(
      "PUT",
      `${_baseUrl}/api/collection/graphql/${_graphqlId}`,
      {
        body: graphqlBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public connectWebsocket = async (
    _url: string,
    _tabId: string,
    _headers: string,
  ) => {
    return connectWebSocket(_url, _tabId, _headers);
  };
  public disconnectWebsocket = async (_tabId: string) => {
    return disconnectWebSocket(_tabId);
  };
  public sendMessageWebsocket = async (_tabId: string, _message: string) => {
    return sendMessage(_tabId, _message);
  };

  public deleteGraphqlInCollection = async (
    _graphqlId: string,
    _graphql: GraphqlRequestDeletePayloadDtoInterface,
    _baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "DELETE",
      `${_baseUrl}/api/collection/graphql/${_graphqlId}`,
      {
        body: _graphql,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public connectSocketIo = async (
    _url: string,
    _tabId: string,
    _headers: string,
  ) => {
    return connectSocketIo(_url, _tabId, _headers);
  };
  public disconnectSocketIo = async (_tabId: string) => {
    return disconnectSocketIo(_tabId);
  };
  public sendMessageSocketIo = async (
    _tabId: string,
    _message: string,
    _eventName: string,
  ) => {
    return sendSocketIoMessage(_tabId, _message, _eventName);
  };

  public createSavedRequestInCollection = async (
    _savedRequest: HttpRequestSavedCreateUpdatePayloadDtoInterface,
    _baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${_baseUrl}/api/collection/response`,
      {
        body: _savedRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateSavedRequestInCollection = async (
    _savedRequestId: string,
    _savedRequest: HttpRequestSavedUpdatePayloadDtoInterface,
    _baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "PATCH",
      `${_baseUrl}/api/collection/response/${_savedRequestId}`,
      {
        body: _savedRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteSavedRequestInCollection = async (
    _savedRequestId: string,
    _savedRequest: HttpRequestSavedDeletePayloadDtoInterface,
    _baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${_baseUrl}/api/collection/response/${_savedRequestId}`,
      {
        body: _savedRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
