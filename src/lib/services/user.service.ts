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
}
