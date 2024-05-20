import {
  getAuthHeaders,
  getMultipartAuthHeaders,
  makeRequest,
} from "$lib/api/api.common";
import { TeamRepository } from "@app/repositories/team.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import constants from "$lib/utils/constants";
import type { InviteBody, TeamPostBody } from "$lib/utils/dto/team-dto";
const apiUrl: string = constants.API_URL;
export class TeamService {
  constructor() {}

  private teamRepository = new TeamRepository();
  private workspaceRepository = new WorkspaceRepository();

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

  public updateTeam = async (teamId: string, team: TeamPostBody) => {
    const response = await makeRequest("PUT", `${apiUrl}/api/team/${teamId}`, {
      body: team,
      headers: getMultipartAuthHeaders(),
    });
    return response;
  };

  public leaveTeam = async (teamId: string) => {
    const response = await makeRequest(
      "PUT",
      `${apiUrl}/api/team/${teamId}/leave`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (response.isSuccessful) {
      await this.teamRepository.removeTeam(teamId);
    }
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

  public removeMembersAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${apiUrl}/api/team/${teamId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public promoteToAdminAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/team/${teamId}/admin/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public demoteToMemberAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "PUT",
      `${apiUrl}/api/team/${teamId}/admin/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public promoteToOwnerAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/team/${teamId}/owner/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
