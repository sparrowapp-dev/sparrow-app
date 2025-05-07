import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  CreateEnvironmentPostBody,
  UpdateEnvironmentPostBody,
} from "@sparrow/common/dto";

export class EnvironmentService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public fetchAllEnvironments = async (
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/workspace/${workspaceId}/environment`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public fetchAllPublicEnvironments = async (
    workspaceId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${baseUrl}/api/workspace/public/${workspaceId}/environment`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public fetchEnvironment = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public addEnvironment = async (
    environment: CreateEnvironmentPostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${baseUrl}/api/workspace/environment`,
      {
        body: environment,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public updateEnvironment = async (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${baseUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      {
        body: environment,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public deleteEnvironment = async (
    workspaceId: string,
    environmentId: string,
    baseUrl: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${baseUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };
}
