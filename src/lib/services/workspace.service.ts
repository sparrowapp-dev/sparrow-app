import constants from "$lib/utils/constants";
import { makeRequest, getAuthHeaders } from "$lib/api/api.common";
import type {
  ChangeRoleBody,
  WorkspacePostBody,
  WorkspacePutBody,
} from "$lib/utils/dto";
const apiUrl: string = constants.API_URL;

export class WorkspaceService {
  constructor() {}
  public fetchWorkspaces = async (userId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchTeamsWorkspaces = async (teamId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/team/${teamId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public updateWorkspace = async (
    workspaceId: string,
    workspace: WorkspacePutBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${apiUrl}/api/workspace/${workspaceId}`,
      {
        body: workspace,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteWorkspace = async (workspaceId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${apiUrl}/api/workspace/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createWorkspace = async (workspace: WorkspacePostBody) => {
    const response = await makeRequest("POST", `${apiUrl}/api/workspace`, {
      body: workspace,
      headers: getAuthHeaders(),
    });
    return response;
  };

  public changeUserRoleAtWorkspace = async (
    workspaceId: string,
    userId: string,
    changeRoleBody: ChangeRoleBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        body: changeRoleBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public removeUserFromWorkspace = async (
    workspaceId: string,
    userId: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
