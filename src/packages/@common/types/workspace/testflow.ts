import type { HttpCResponseType } from "../http-client/client";

export interface TFNodeType {
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
