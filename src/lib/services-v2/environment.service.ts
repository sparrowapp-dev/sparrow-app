import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type {
  CreateEnvironmentPostBody,
  UpdateEnvironmentPostBody,
} from "$lib/utils/dto";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
// import { EnvironmentRepositoryMethods } from "$lib/utils/interfaces";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";

export class EnvironmentService {
  private environmentRepository = new EnvironmentRepository();
  // private environmentRepositoryMethods = new EnvironmentRepositoryMethods();
  private environmentTabRepository = new EnvironmentTabRepository();
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
    console.log("response", response);
    // debugger;
    if (response.isSuccessful) {
      // debugger;
      this.environmentRepository.updateEnvironment(
        response.data.data._id,
        response.data.data,
      );
      await this.environmentTabRepository.setEnvironmentTabProperty(
        response.data.data.variable,
        "variable",
        response.data.data._id,
      );
      await this.environmentTabRepository.setEnvironmentTabProperty(
        true,
        "isSave",
        response.data.data._id,
      );
    }
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
