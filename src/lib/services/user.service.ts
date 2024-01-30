import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";

const apiUrl: string = constants.API_URL;
export class UserService {
  constructor() {}
  public disableNewInviteTag = async (userId: string, teamId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/team/${teamId}/user/${userId}/disableTeamNewInvite`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
