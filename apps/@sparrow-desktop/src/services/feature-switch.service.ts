import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import { getSelfhostUrls } from "@app/utils/jwt";

export class FeatureSwitchService {
  constructor() {    const [selfhostBackendUrl] = getSelfhostUrls();
        if (selfhostBackendUrl) {
            this.apiUrl = selfhostBackendUrl;
        }
        else{
            this.apiUrl = constants.API_URL;
        }
    }

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
