import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type {
  CreateEnvironmentPostBody,
  UpdateEnvironmentPostBody,
} from "@deprecate/utils/dto";

export class EnvironmentService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public fetchAllEnvironments = async (workspaceId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${workspaceId}/environment`,
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

  public addEnvironment = async (environment: CreateEnvironmentPostBody) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/environment`,
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
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
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
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };
}
