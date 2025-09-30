import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import { getSelfhostUrls } from "@app/utils/jwt";
import type { ScheduleTestFlowRunDto } from "@sparrow/common/types/workspace/testflow-dto";

export class TestflowService {
  constructor() {
    const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
      this.apiUrl = selfhostBackendUrl;
    } else {
      this.apiUrl = constants.API_URL;
    }
  }

  private apiUrl: string = constants.API_URL;

  public fetchAllTestflow = async (workspaceId: string, baseUrl: string) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/workspace/${workspaceId}/testflow`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public fetchAllPublicTestflow = async (
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/workspace/public/${workspaceId}/testflow`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public fetchTestflow = async (_testflowId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/testflow/${_testflowId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public addTestflow = async (
    _testflow: {
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
          blockName: string;
          requestId: string;
          collectionId: string;
          folderId: string;
          workspaceId: string;
          isDeleted: boolean;
          requestData: object;
        };
      }[];
    },
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/testflow`,
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}`,
      {
        body: _testflow,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public deleteTestflow = async (
    workspaceId: string,
    _testflowId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public runTestflowSchedule = async (
    _workspaceId: string,
    _testflowId: string,
    _scheduleId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}/run`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public deleteScheduleRunHistory = async (
    _workspaceId: string,
    _testflowId: string,
    _scheduleId: string,
    _runHistoryId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}/run-history/${_runHistoryId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public deleteTestflowSchedule = async (
    workspaceId: string,
    _testflowId: string,
    _scheduleId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public updateTestflowSchedule = async (
    workspaceId: string,
    _testflowId: string,
    _scheduleId: string,
    _schedule: any,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}`,
      {
        body: _schedule,
        headers: getAuthHeaders() },
    );
    return response;
  };

  public scheduleTestFlowRun = async (
    payload: ScheduleTestFlowRunDto,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/create-testflow-schedule`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
