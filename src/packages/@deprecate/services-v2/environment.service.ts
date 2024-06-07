/**
 * @deprecated - please use enbironment service v1
 */
import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { UpdateEnvironmentPostBody } from "$lib/utils/dto";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { EnvironmentTabRepository } from "@app/repositories/environment-tab.repository";

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
    return response;
  };
}
