import type {
  HttpRequestAuthDtoInterface,
  HttpRequestAuthModeDtoEnum,
  HttpRequestBodyDtoInterface,
  HttpRequestBodyModeDtoEnum,
  HttpRequestKeyValueDtoInterface,
  HttpRequestMethodsDtoInterface,
} from "./http-request-dto";
import type { RequestDataTypeEnum } from "./http-request-tab";
import type { Tab } from "./tab";

export interface HttpRequestUIStateDto {
  requestBodyLanguage: string;
  requestBodyNavigation: string;
  requestAuthNavigation: string;
  requestNavigation: string;
  responseNavigation: string;
  responseBodyLanguage: string;
  responseBodyFormatter: string;
  requestExtensionNavigation: string;
  requestLeftSplitterWidthPercentage: number;
  requestRightSplitterWidthPercentage: number;
  isExposeEditDescription: boolean;
  isSendRequestInProgress: boolean;
  isSaveDescriptionInProgress: boolean;
  isSaveRequestInProgress: boolean;
  isParameterBulkEditActive: boolean;
  isHeaderBulkEditActive: boolean;
  isChatbotActive: boolean;
  isChatbotSuggestionsActive: boolean;
  isChatbotGeneratingResponse: boolean;
  isDocGenerating: boolean;
  isDocAlreadyGenerated: boolean;
}

export interface HttpRequestAutoGeneratedHeaderDto {
  key: string;
  value: string;
  checked: boolean;
}

export interface HttpRequestMetaDataTestFlowDtoInterface {
  auth?: HttpRequestAuthDtoInterface;
  autoGeneratedHeaders?: HttpRequestAutoGeneratedHeaderDto[];
  body?: HttpRequestBodyDtoInterface;
  headers?: HttpRequestKeyValueDtoInterface[];
  method: HttpRequestMethodsDtoInterface;
  queryParams?: HttpRequestKeyValueDtoInterface[];
  selectedRequestAuthType?: HttpRequestAuthModeDtoEnum;
  selectedRequestBodyType?: HttpRequestBodyModeDtoEnum;
  state?: HttpRequestUIStateDto;
  url: string;
}

/**
 * TF (Test FLow) Default Type
 */
export interface TFNodeType {
  id: string;
  blockName: string;
  type: string;
  data: {
    requestId: string;
    folderId: string;
    collectionId: string;
    name: string;
    method: string;
    workspaceId: string;
    requestData: HttpRequestMetaDataTestFlowDtoInterface;
    isDeleted: boolean;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface TFDocumentType {
  _id: string;
  workspaceId: string;
  name: string;
  nodes: TFNodeType[];
  edges: TFEdgeType[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export enum TFDefaultEnum {
  FULL_NAME = "Test Flow",
  NAME = "Flow",
}

export interface TFAPIResponseType {
  body: string;
  headers: object;
  status: string;
}

export interface TFNodeHandlerType {
  id: string;
  type: string;
  data: {
    requestId: string;
    folderId: string;
    collectionId: string;
    blocks: any;
    connector: any;
    onClick: any;
    onCheckEdges: any;
    onUpdateSelectedAPI: any;
    name: string;
    method: string;
    collections: any;
    tabId: string;
  };
  selected: boolean;
  position: {
    x: number;
    y: number;
  };
  deletable: string;
  draggable: string;
}

export interface TFEdgeHandlerType {
  id: string;
  source: string;
  target: string;
}

export interface TFEdgeType {
  id: string;
  source: string;
  target: string;
}

export interface TFResponseStateType {
  responseBodyLanguage: string;
  responseBodyFormatter: string;
}

/**
 * TF (Test FLow) Tab TYPE
 */

export interface TFTabNodeType {
  id: string;
  blockName: string;
  type: string;
  data: {
    requestId: string;
    folderId: string;
    collectionId: string;
    name: string;
    method: string;
    workspaceId: string;
    requestData?: HttpRequestMetaDataTestFlowDtoInterface;
    isDeleted: boolean;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface TFTabNodesWrapperType {
  nodes: TFTabNodeType[];
}

export interface TFTabEdgeType {
  id: string;
  source: string;
  target: string;
}
export interface TFTabEdgesWrapperType {
  edges: TFTabEdgeType[];
}

export interface TFTabItemType
  extends TFTabNodesWrapperType,
    TFTabEdgesWrapperType {}

export interface TFTabItemWrapperType {
  testflow: TFTabItemType;
}

/**
 * TF (Test FLow) SVELTE STORE TYPE
 */
export type TFKeyValueStoreType = {
  key: string;
  value: string;
};

export type TFHistoryAPIResponseStoreType = {
  headers: TFKeyValueStoreType[];
  status: string;
  body: string;
  time: number;
  size: number;
  responseContentType?: RequestDataTypeEnum;
};
export type TFNodeStoreType = {
  id: string;
  response: TFHistoryAPIResponseStoreType;
  request: Tab;
};

export type TFAPIStoreType = {
  method: string;
  name: string;
  status: string;
  time: string;
};

export type TFHistoryStoreType = {
  status: "pass" | "fail";
  successRequests: string;
  failedRequests: string;
  totalTime: string;
  timestamp: string;
  requests: TFAPIStoreType[];
  expand: boolean;
};

export type TFDataStoreType = {
  abortController: AbortController;
  nodes: TFNodeStoreType[];
  history: TFHistoryStoreType[];
  isRunHistoryEnable: boolean;
  isTestFlowRunning: boolean;
  isTestFlowSaveInProgress: boolean;
};
