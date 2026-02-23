import {
  getMultipartAuthHeaders,
  makeRequest,
} from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import { getSelfhostUrls } from "@app/utils/jwt";
let apiUrl: string = constants.API_URL;
let OPENFEEDBACK_URL: string = constants.OPENFEEDBACK_URL;
export class FeedbackService {
  constructor() {
    const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
      apiUrl = selfhostBackendUrl;
    } else {
      apiUrl = constants.API_URL;
    }
  }

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

  /**
   * Uploads a post with files and data in a single API call.
   * @param formData - FormData containing: files (File[]), title (string, required),
   *                   description (string), boardID (string, required),
   *                   authorID (string), email (string), categoryID (string)
   * @returns Promise with the response from the upload API
   */
  public uploadPost = async (formData: FormData) => {
    const response = await makeRequest(
      "POST",
      `${OPENFEEDBACK_URL}/posts/upload`,
      {
        body: formData,
        headers: getMultipartAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Uploads a comment with files and data in a single API call.
   * @param formData - FormData containing: files (File[]), postID (string, required),
   *                   value (string, required), parentID (string),
   *                   authorID (string), email (string)
   * @returns Promise with the response from the upload API
   */
  public uploadComment = async (formData: FormData) => {
    const response = await makeRequest(
      "POST",
      `${OPENFEEDBACK_URL}/comments/upload`,
      {
        body: formData,
        headers: getMultipartAuthHeaders(),
      },
    );
    return response;
  };
}
