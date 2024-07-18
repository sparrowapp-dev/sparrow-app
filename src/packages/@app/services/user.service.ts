import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { MakeRequestResponse } from "$lib/utils/interfaces/common.interface";

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
