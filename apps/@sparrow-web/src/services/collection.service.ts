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
import { createApiRequest } from "./rest-api.service";
import type {
  HttpClientBackendResponseInterface,
  HttpClientResponseInterface,
} from "@app/types/http-client";
import {
  CollectionItemTypeDtoEnum,
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
import type { HttpRequestAuthModeBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";

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

  public addSocketIoInCollection = async (
    _socketIo:
      | SocketIORequestCreateUpdateInCollectionPayloadDtoInterface
      | SocketIORequestCreateUpdateInFolderPayloadDtoInterface,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/socketio`,
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
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/socketio/${_socketIoId}`,
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
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/socketio/${_socketIoId}`,
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
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/collection/graphql`,
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
      query?: string;
      schema?: string;
      headers?: GraphqlRequestKeyValueDtoInterface[];
      auth?: GraphqlRequestAuthDtoInterface;
      selectedGraphqlAuthType: HttpRequestAuthModeBaseEnum;
    },
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
              schema: _graphql.schema,
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
            schema: _graphql.schema,
            headers: _graphql.headers,
            auth: _graphql.auth,
            selectedGraphqlAuthType: _graphql.selectedGraphqlAuthType,
          },
        },
      };
    }
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/collection/graphql/${_graphqlId}`,
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
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/collection/graphql/${_graphqlId}`,
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
}
