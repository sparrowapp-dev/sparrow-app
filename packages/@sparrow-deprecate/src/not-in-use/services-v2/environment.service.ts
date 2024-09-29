/**
 * @deprecated - please use enbironment service v1
 */
import { getAuthHeaders, makeRequest } from "@deprecate/api/api.common";
import constants from "@deprecate/utils/constants";
import type { UpdateEnvironmentPostBody } from "@deprecate/utils/dto";
import { EnvironmentRepository } from "@app/repositories/environment.repository";

export class EnvironmentService {
  private environmentRepository = new EnvironmentRepository();

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
