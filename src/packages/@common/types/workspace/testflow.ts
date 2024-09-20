import type { HttpCResponseType } from "../http-client/client";

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

export interface NodesWrapper {
  nodes: {
    id: string;
    type: string;
    data: {
      requestId: string;
      folderId: string;
      collectionId: string;
    };
    position: {
      x: number;
      y: number;
    };
  }[];
}

export interface EdgesWrapper {
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}

export interface Testflow extends NodesWrapper, EdgesWrapper {}

export enum TestflowDefault {
  FULL_NAME = "Test Flow",
  NAME = "Flow",
}

export interface TestflowWrapper {
  testflow: Testflow;
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
