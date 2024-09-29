import constants from "@app/constants/constants";
import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import type {
  WorkspacePostBody,
  WorkspacePutBody,
  addUsersInWorkspacePayload,
} from "@deprecate/utils/dto";
import type { WorkspaceRole } from "@deprecate/utils/enums";
import type { MakeRequestResponse } from "@deprecate/utils/interfaces/common.interface";
/* eslint-disable @typescript-eslint/no-explicit-any */
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

  public deleteWorkspace = async (
    workspaceId: string,
  ): Promise<MakeRequestResponse> => {
    const response: MakeRequestResponse = await makeRequest(
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

  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
  ) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/workspace/${workspaceId}/user`,
      {
        body: addUsersInWorkspaceDto,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public getUserDetailsOfWorkspace = async (workspaceId: string) => {
    if (workspaceId) {
      const response = await makeRequest(
        "GET",
        `${apiUrl}/api/workspace/${workspaceId}/users`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response;
    }
  };

  public changeUserRoleAtWorkspace = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<MakeRequestResponse> => {
    const response: MakeRequestResponse = await makeRequest(
      "PUT",
      `${apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        body: { role },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public removeUserFromWorkspace = async (
    workspaceId: string,
    userId: string,
  ): Promise<MakeRequestResponse> => {
    const response: MakeRequestResponse = await makeRequest(
      "DELETE",
      `${apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
