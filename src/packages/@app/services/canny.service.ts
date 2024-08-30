import { makeHttpRequestV2, makeRequest } from "$lib/api/api.common";
import { ContentTypeEnum } from "$lib/utils/enums";
import constants from "$lib/utils/constants";

export class CannyIoService {
  constructor() {}
  private apiUrl: string = constants.CANNY_URL;
  private apiKey: string = constants.CANNY_API;

  // returns the list of boards available
  public fetchBoards = async () => {
    const response = await makeRequest("POST", `${this.apiUrl}/boards/list`, {
      body: {
        apiKey: this.apiKey,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };

  // returns the list of posts available
  public listPosts = async (boardID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/posts/list`, {
      body: {
        apiKey: this.apiKey,
        boardID,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };

  // Fetches the list of categories available for a specific board from canny.
  public listCategories = async (boardID: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/categories/list`,
      {
        body: {
          apiKey: this.apiKey,
          boardID,
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  // creates a new user , as in order to create post we need userid
  public createUser = async (body: object) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/users/find_or_create`,
      {
        body: {
          apiKey: this.apiKey,
          ...body,
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  // creates a new post in the board
  public createPost = async (body: object) => {
    const response = await makeHttpRequestV2(
      `${this.apiUrl}/posts/create`,
      "POST",
      JSON.stringify([]),
      JSON.stringify({
        apiKey: this.apiKey,
        ...body,
      }),
      ContentTypeEnum["application/json"],
    );
    return response;
  };
}
