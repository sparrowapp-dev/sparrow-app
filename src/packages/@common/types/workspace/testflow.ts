export interface TFNodeType {
  id: string;
  type: string;
  data: {
    requestId: string;
    folderId: string;
    collectionId: string;
    name: string;
    method: string;
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

export interface TFTabNodesWrapperType {
  nodes: {
    id: string;
    type: string;
    data: {
      requestId: string;
      folderId: string;
      collectionId: string;
      name: string;
      method: string;
    };
    position: {
      x: number;
      y: number;
    };
  }[];
}

export interface TFTabEdgesWrapperType {
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}

export interface TFTabItemType
  extends TFTabNodesWrapperType,
    TFTabEdgesWrapperType {}

export enum TFDefaultEnum {
  FULL_NAME = "Test Flow",
  NAME = "Flow",
}

export interface TFTabItemWrapperType {
  testflow: TFTabItemType;
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
