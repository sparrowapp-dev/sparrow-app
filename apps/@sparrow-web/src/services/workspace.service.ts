import constants from "@app/constants/constants";
import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import type {
  WorkspacePostBody,
  WorkspacePutBody,
  WorkspaceTypePatchBody,
  addUsersInWorkspacePayload,
} from "@sparrow/common/dto";
import type { WorkspaceRole } from "@sparrow/common/enums";
import type { HttpClientResponseInterface } from "@app/types/http-client";
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
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/workspace/${workspaceId}`,
      {
        body: workspace,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteWorkspace = async (
    workspaceId: string,
    baseUrl: string,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createWorkspace = async (
    workspace: WorkspacePostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest("POST", `${baseUrl}/api/workspace`, {
      body: workspace,
      headers: getAuthHeaders(),
    });
    return response;
  };

  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/${workspaceId}/user`,
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
    baseUrl: string,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "PUT",
      `${baseUrl}/api/workspace/${workspaceId}/user/${userId}`,
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
    baseUrl: string,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchPublicWorkspace = async (workspaceId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/public/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public updateWorkspaceType = async (
    workspaceId: string,
    workspace: WorkspaceTypePatchBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PATCH",
      `${baseUrl}/api/workspace/${workspaceId}`,
      {
        body: workspace,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchPublicWorkspaceList = async (pageNumber: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/public-list?page=${pageNumber}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public searchPublicWorkspaces = async (
    searchTerm: string,
    page: number = 1,
  ) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/public-search?name=${encodeURIComponent(
        searchTerm,
      )}&page=${page}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
