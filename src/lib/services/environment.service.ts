import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { CreateEnvironmentPostBody } from "$lib/utils/dto";

export class EnvironmentService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public fetchEnvironment = async (workspaceId: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/environment/${workspaceId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };

  public addEnvironment = async (environment: CreateEnvironmentPostBody) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/environment`,
      {
        body: environment,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public deleteEnvironment = async (
    environmentId: string,
    workspaceId: string,
  ) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/environment/${environmentId}/workspace/${workspaceId}`,
      { headers: getAuthHeaders() },
    );
    return response;
  };
}
