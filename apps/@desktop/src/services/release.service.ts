import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";

export class ReleaseService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = constants.RELEASE_NOTES_API;
  }

  /**
   * @description - Fetches release data from the backend server
   * @returns - Promise resolving to the fetched release data
   */

  public getReleaseData = async () => {
    const response = await makeRequest("GET", `${this.apiUrl}`, {
      headers: {
        Authorization: `Bearer ${constants.RELEASE_NOTES_PAT_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return response;
  };
}
