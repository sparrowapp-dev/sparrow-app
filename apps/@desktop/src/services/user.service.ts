import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import type { MakeRequestResponse } from "@deprecate/utils/interfaces/common.interface";

const apiUrl: string = constants.API_URL;
export class UserService {
  constructor() {}
  public disableNewInviteTag = async (userId: string, teamId: string) => {
    const response: MakeRequestResponse = await makeRequest(
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
    const response: MakeRequestResponse = await makeRequest(
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
    const response: MakeRequestResponse = await makeRequest(
      "GET",
      `${apiUrl}/api/user/email/${email}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
