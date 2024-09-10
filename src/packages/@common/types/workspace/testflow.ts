export interface NodesWrapper {
  nodes: {
    id: string;
    type: string;
    data: object;
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
