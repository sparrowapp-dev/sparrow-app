import {
  getAuthHeaders,
  getMultipartAuthHeaders,
  makeRequest,
} from "$lib/api/api.common";
import constants from "$lib/utils/constants";
import type { InviteBody, TeamPostBody } from "$lib/utils/dto/team-dto";
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

  public createTeam = async (team: TeamPostBody) => {
    const response = await makeRequest("POST", `${apiUrl}/api/team`, {
      body: team,
      headers: getMultipartAuthHeaders(),
    });
    return response;
  };

  public inviteMembersAtTeam = async (
    teamId: string,
    inviteBody: InviteBody,
  ) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/team/${teamId}/user`,
      {
        body: inviteBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
