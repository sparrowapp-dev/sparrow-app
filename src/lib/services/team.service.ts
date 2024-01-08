import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
const apiUrl: string = constants.API_URL;
export class TeamService {
  constructor() {}

  public fetchTeams = async (userId: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/team/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
