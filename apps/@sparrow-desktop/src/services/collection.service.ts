import {
  connectSocketIo,
  disconnectSocketIo,
  getAuthHeaders,
  makeHttpRequestV2,
  makeRequest,
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
  AiRequestCreateUpdateInCollectionPayloadDtoInterface,
  AiRequestCreateUpdateInFolderPayloadDtoInterface,
  AiRequestDeletePayloadDtoInterface,
} from "@sparrow/common/types/workspace/ai-request-dto";
import type {
  GraphqlRequestAuthDtoInterface,
  GraphqlRequestCreateUpdateInCollectionPayloadDtoInterface,
  GraphqlRequestCreateUpdateInFolderPayloadDtoInterface,
  GraphqlRequestDeletePayloadDtoInterface,
  GraphqlRequestKeyValueDtoInterface,
} from "@sparrow/common/types/workspace/graphql-request-dto";
import {
  CollectionItemTypeBaseEnum,
  type CollectionAuthProifleBaseInterface,
} from "@sparrow/common/types/workspace/collection-base";
import type { GraphqlRequestAuthModeBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
import type {
  HttpRequestSavedCreateUpdateInFolderPayloadDtoInterface,
  HttpRequestSavedCreateUpdatePayloadDtoInterface,
  HttpRequestSavedDeletePayloadDtoInterface,
  HttpRequestSavedUpdatePayloadDtoInterface,
} from "@sparrow/common/types/workspace/http-request-saved-dto";
import type {
  HttpRequestMockCreateUpdatePayloadDtoInterface,
  HttpRequestMockDeletePayloadDtoInterface,
} from "@sparrow/common/types/workspace/http-request-mock-dto";

import type {
  HttpResponseMockCreateUpdatePayloadDtoInterface,
  HttpResponseMockDeletePayloadDtoInterface,
  HttpResponseMockUpdatePayloadDtoInterface,
  HttpResponseRatiosMockUpdatePayloadDtoInterface,
} from "@sparrow/common/types/workspace/http-response-mock-dto";
import type { GeneratedVariable } from "@sparrow/common/dto";

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

  public addMockRequestInCollection = async (
    apiRequest: HttpRequestMockCreateUpdatePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/mock-request`,
      {
        body: apiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateMockRequestInCollection = async (
    requestId: string,
    requestBody: HttpRequestMockCreateUpdatePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/mock-request/${requestId}`,
      {
        body: requestBody,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteMockRequestInCollection = async (
    requestId: string,
    deleteRequestBody: HttpRequestMockDeletePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/mock-request/${requestId}`,
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

  public validateImportCollectionURL = async (url = "") => {
    return makeHttpRequestV2(
      url,
      "GET",
      '[{"key":"Accept-Encoding","value":"gzip, br","checked":true},{"key":"User-Agent","value":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36","checked":true},{"key":"Connection","value":"keep-alive","checked":true},{"key":"Accept","value":"*/*","checked":true}]',
      "",
      "text/plain",
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

  public addAiRequestInCollection = async (
    _aiRequest:
      | AiRequestCreateUpdateInCollectionPayloadDtoInterface
      | AiRequestCreateUpdateInFolderPayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/ai-request`,
      {
        body: _aiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateAiRequestInCollection = async (
    _aiRequestId: string,
    _aiRequest:
      | AiRequestCreateUpdateInCollectionPayloadDtoInterface
      | AiRequestCreateUpdateInFolderPayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionItemDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/collection/ai-request/${_aiRequestId}`,
      {
        body: _aiRequest,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteAiRequestInCollection = async (
    _aiRequestId: string,
    _aiRequest: AiRequestDeletePayloadDtoInterface,
    baseUrl: string,
  ): Promise<
    HttpClientResponseInterface<
      HttpClientBackendResponseInterface<CollectionDtoInterface>
    >
  > => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/ai-request/${_aiRequestId}`,
      {
        body: _aiRequest,
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

  public updateMockCollectionRunningStatus = async (
    collectionId: string,
    workspaceId: string,
    requestBody: any,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}/mock-status`,
      {
        body: requestBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public geCollectionByIdAndWorkspace = async (
    collectionId: string,
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createMockCollectionFromExisting = async (
    collectionId: string,
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/${collectionId}/workspace/${workspaceId}/create-mock`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createMockResponseInCollection = async (
    mockResponse: HttpResponseMockCreateUpdatePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/mock-response`,
      {
        body: mockResponse,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateMockResponseInCollection = async (
    responseId: string,
    updateMockResponse: HttpResponseMockUpdatePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${baseUrl}/api/collection/mock-response/${responseId}`,
      {
        body: updateMockResponse,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteMockResponseInCollection = async (
    responseId: string,
    deleteResponseBody: HttpResponseMockDeletePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/collection/mock-response/${responseId}`,
      {
        body: deleteResponseBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateMockResponseRatios = async (
    payload: HttpResponseRatiosMockUpdatePayloadDtoInterface,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${baseUrl}/api/collection/mock-response/ratios`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public addAuthProfile = async (
    baseUrl: string,
    updatedPayload: CollectionAuthProifleBaseInterface & {
      collectionId: string;
      workspaceId: string;
    },
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/auth-profiles`,
      {
        body: updatedPayload,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public updateAuthProfile = async (
    _baseUrl: string,
    authProfileId: string,
    _updateedAuthProfilePayload: CollectionAuthProifleBaseInterface & {
      collectionId: string;
      workspaceId: string;
    },
  ) => {
    const response = await makeRequest(
      "PUT",
      `${_baseUrl}/api/collection/auth-profiles`,
      {
        body: _updateedAuthProfilePayload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteAuthProfile = async (
    _baseUrl: string,
    _authProfileId: string,
    _authProfileDeletionPayload: {
      collectionId: string;
      workspaceId: string;
      authId: string;
    },
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${_baseUrl}/api/collection/auth-profiles`,
      {
        body: _authProfileDeletionPayload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public generateVariables = async (
    workspaceId: string,
    collectionId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/generate-variables/${collectionId}`,
      {
        body: {
          workspaceId: `${workspaceId}`,
        },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public insertGeneratedVariables = async (
    workspaceId: string,
    collectionId: string,
    generatedeVariables: GeneratedVariable[],
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/collection/generate-variables/insert`,
      {
        body: {
          collectionId: `${collectionId}`,
          workspaceId: `${workspaceId}`,
          generatedeVariables: generatedeVariables,
        },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
