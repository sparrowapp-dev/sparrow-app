import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";

export class TestflowService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public fetchAllTestflow = async (workspaceId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public fetchTestflow = async (_workspaceId: string, _testflowId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public addTestflow = async (_testflow: {
    name: string;
    workspaceId: string;
    edges: {
      id: string;
      source: string;
      target: string;
    }[];
    nodes: {
      id: string;
      type: string;
      position: {
        x: number;
        y: number;
      };
      data: {
        requestId: string;
        collectionId: string;
        folderId: string;
      };
    }[];
  }) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/testflow`,
      {
        body: _testflow,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public updateTestflow = async (
    _workspaceId: string,
    _testflowId: string,
    _testflow: any,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}`,
      {
        body: _testflow,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public deleteTestflow = async (workspaceId: string, _testflowId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };
}
