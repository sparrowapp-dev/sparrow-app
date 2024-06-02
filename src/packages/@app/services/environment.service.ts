import constants from "$lib/utils/constants";
import type {
  CreateEnvironmentPostBody,
  UpdateEnvironmentPostBody,
} from "$lib/utils/dto";
import type { AccessToken, BearerToken, HttpClient } from "@app/types";

export class EnvironmentService {
  private apiUrl: string = constants.API_URL;
  constructor(
    private httpClient: HttpClient,
    private bearerToken: BearerToken,
    private accessToken: AccessToken,
  ) {}

  public fetchAllEnvironments = async (workspaceId: string) => {
    const response = await this.httpClient.makeRequest({
      method: "GET",
      url: `${this.apiUrl}/api/workspace/${workspaceId}/environment`,
      headers: {
        ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
      },
    });
    return response;
  };

  public fetchEnvironment = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    const response = await this.httpClient.makeRequest({
      method: "GET",
      url: `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      headers: {
        ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
      },
    });
    return response;
  };

  public addEnvironment = async (environment: CreateEnvironmentPostBody) => {
    const response = await this.httpClient.makeRequest({
      method: "POST",
      url: `${this.apiUrl}/api/workspace/environment`,
      body: environment,
      headers: {
        ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
      },
    });

    return response;
  };

  public updateEnvironment = async (
    workspaceId: string,
    environmentId: string,
    environment: UpdateEnvironmentPostBody,
  ) => {
    const response = await this.httpClient.makeRequest({
      method: "PUT",
      url: `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      body: environment,
      headers: {
        ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
      },
    });
    return response;
  };
  public deleteEnvironment = async (
    workspaceId: string,
    environmentId: string,
  ) => {
    const response = await this.httpClient.makeRequest({
      method: "DELETE",
      url: `${this.apiUrl}/api/workspace/${workspaceId}/environment/${environmentId}`,
      headers: {
        ...this.bearerToken.getBearerToken(this.accessToken.getValue()),
      },
    });
    return response;
  };
}
