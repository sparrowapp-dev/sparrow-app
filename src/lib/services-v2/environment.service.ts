import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { UpdateEnvironmentPostBody } from "$lib/utils/dto";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";

export class EnvironmentService {
  private environmentRepository = new EnvironmentRepository();
  private environmentTabRepository = new EnvironmentTabRepository();
  constructor() {}

  private apiUrl: string = constants.API_URL;

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

    if (response.isSuccessful) {
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
}
