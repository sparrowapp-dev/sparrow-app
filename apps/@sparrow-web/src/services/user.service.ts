import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type { HttpClientResponseInterface } from "@app/types/http-client";

const apiUrl: string = constants.API_URL;
export class UserService {
  constructor() {}
  public disableNewInviteTag = async (userId: string, teamId: string) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${apiUrl}/api/team/${teamId}/user/${userId}/disableTeamNewInvite`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Disables the new invite tag for a user in a workspace.
   *
   * @param userId - The ID of the user for whom the new invite tag should be disabled.
   * @param workspaceId - The ID of the workspace.
   * @returns A promise that resolves to the response of the request.
   */
  public disableWorkspaceNewInviteTag = async (
    userId: string,
    workspaceId: string,
  ) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${apiUrl}/api/workspace/${workspaceId}/user/${userId}/disableWorkspaceNewInvite`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Validates the user email by making a GET request to the server.
   *
   * @param email - The email address to be validated.
   * @return A promise that resolves to the server's response.
   */
  public validateUserEmail = async (email: string) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${apiUrl}/api/user/email/${email}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  /**
   * Gets the trial exhausted status for a user by email.
   *
   * @param email - The email address of the user.
   * @returns A promise that resolves to the server's response.
   */
  public getUserTrialExhaustedStatus = async (email: string) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${apiUrl}/api/user/trial-exhausted/${email}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Insert Trial flow collectionId into users.
   *
   * @param email - The email address of the user.
   * @param collectionId - The collection Id which user has completed the trial.
   * @returns A promise that resolves to the server's response.
   */
  public InsertGenerateTrialCollectionIds = async (collectionId: string) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/user/${collectionId}/trial-generate-variable`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * If the user has completed Demo of Generate variables.
   *
   * @param email - The email address of the user.
   * @returns A promise that resolves to the server's response.
   */
  public generateVariableDemoCompleted = async () => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/user/generate-variable-demo`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * If the user has completed Demo of RequestTests.
   *
   * @returns A promise that resolves to the server's response.
   */
  public requestTabNocodeTestsDemoCompleted = async () => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/user/request-tests-nocode-demo`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * If the user has completed Demo of RequestTests script.
   *
   * @returns A promise that resolves to the server's response.
   */
  public requestTabScriptTestsDemoCompleted = async () => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/user/request-tests-script-demo`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
