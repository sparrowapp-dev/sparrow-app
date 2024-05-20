import { getAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";

export class CommonService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  public isFeatureEnabled = async (feature: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/feature/check`,
      {
        body: feature,
        headers: getAuthHeaders(),
      },
    );

    if (response.isSuccessful) {
      return response;
    }
    return false;
  };
}
