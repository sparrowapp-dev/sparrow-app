import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";

export class FeatureSwitchService {
  constructor() {}

  private apiUrl: string = constants.API_URL;

  /**
   * @description - fetches all features from db
   * @returns - all features
   */
  public getAllFeatures = async () => {
    const response = await makeRequest("GET", `${this.apiUrl}/api/feature`, {
      headers: getAuthHeaders(),
    });
    return response;
  };
}
