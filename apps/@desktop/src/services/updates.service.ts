import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
const apiUrl: string = constants.API_URL;
export class UpdatesService {
  constructor() {}
  /**
   * Retrieves updates for a specified workspace and page number from the API.
   *
   * This method makes a GET request to the API endpoint for updates based on the provided
   * workspace ID and page number. It includes authentication headers obtained from `getAuthHeaders`.
   *
   * @param workspaceId - The ID of the workspace to retrieve updates for.
   * @param pageNumber - The page number of updates to retrieve.
   * @returns A promise that resolves with the response from the API containing updates data.
   *
   * @example
   * // Example usage:
   * const updatesService = new UpdatesService();
   * const workspaceId = 'workspaceA';
   * const pageNumber = '1';
   * const updatesResponse = await updatesService.getUpdates(workspaceId, pageNumber);
   * console.log('Updates response:', updatesResponse);
   */
  public getUpdates = async (workspaceId: string, pageNumber: string) => {
    const response = await makeRequest(
      "GET",
      `${apiUrl}/api/updates/${workspaceId}/page/${pageNumber}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
