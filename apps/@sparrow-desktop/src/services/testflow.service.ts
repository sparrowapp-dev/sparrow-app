import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import { getSelfhostUrls } from "@app/utils/jwt";
import type {
  ScheduleTestFlowRunDto,
  TestflowDataSetImportDto,
} from "@sparrow/common/types/workspace/testflow-dto";

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

  public fetchTestflow = async (_workspaceId: string, _testflowId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}`,
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
    payload?: { testflowDataSetId: string },
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}/run`,
      { headers: getAuthHeaders(), body: payload },
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

  public deleteScheduleRunTestDataHistory = async (
    _workspaceId: string,
    _testflowId: string,
    _scheduleId: string,
    _runHistoryTestDataId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${_workspaceId}/testflow/${_testflowId}/schedule/${_scheduleId}/run-history-dataset/${_runHistoryTestDataId}`,
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
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public scheduleTestFlowRun = async (
    payload: ScheduleTestFlowRunDto,
    testflowId: string,
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/testflow-schedule`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public validateTestFlowRun = async (
    workspaceId: string,
    testflowId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/validate-run`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchTestflowDataSets = async (
    workspaceId: string,
    testflowId: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/DataSets`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public deleteTestDataSet = async (
    _testflowId: string,
    testflowDataSetId: string,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}/dataset/${testflowDataSetId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public renameTestDataSet = async (
    _testflowId: string,
    testflowDataSetId: string,
    updatedDataSetName: string,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${_testflowId}/dataset/${testflowDataSetId}`,
      {
        body: { name: updatedDataSetName },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public importTestflowDataSet = async (
    testflowId: string,
    payload: TestflowDataSetImportDto,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/import-dataset`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public importTestflowDataSetFileChange = async (
    testflowId: string,
    payload: TestflowDataSetImportDto,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/import-dataset/file`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateDatasetByName = async (
    testflowId: string,
    payload: TestflowDataSetImportDto,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${this.apiUrl}/api/workspace/${workspaceId}/testflow/${testflowId}/dataset`,
      {
        body: payload,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
