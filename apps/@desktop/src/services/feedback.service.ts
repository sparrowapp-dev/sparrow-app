import {
  getMultipartAuthHeaders,
  makeRequest,
} from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
const apiUrl: string = constants.API_URL;
export class FeedbackService {
  constructor() {}

  public createFeedback = async (feedback) => {
    const response = await makeRequest("POST", `${apiUrl}/api/feedback`, {
      body: feedback,
      headers: getMultipartAuthHeaders(),
    });
    return response;
  };

  public fetchuploads = async (feedback) => {
    const response = await makeRequest(
      "POST",
      `${apiUrl}/api/feedback/uploads`,
      {
        body: feedback,
        headers: getMultipartAuthHeaders(),
      },
    );
    return response;
  };
}
