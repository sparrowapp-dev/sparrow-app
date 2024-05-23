import { getMultipartAuthHeaders, makeRequest } from "$lib/api/api.common";
import constants from "$lib/utils/constants";
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
}
