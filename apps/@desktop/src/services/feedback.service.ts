import {
  getMultipartAuthHeaders,
  makeRequest,
} from "@deprecate/api/api.common";
import constants from "@deprecate/utils/constants";
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
