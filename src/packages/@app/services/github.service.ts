import { makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";

export class GithubService {
  constructor() {}

  private apiUrl: string = constants.GITHUB_API;

  public getRepoMetaData = async (repoPath: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/repos/${repoPath}`,
      {},
    );
    return response;
  };
}
