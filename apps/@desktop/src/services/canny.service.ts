import { makeHttpRequestV2, makeRequest } from "@app/containers/api/api.common";
import { ContentTypeEnum } from "@deprecate/utils/enums";
import constants from "@app/constants/constants";

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

  // returns the post data for a specific post
  retrievePost = async (postID: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/posts/retrieve`,
      {
        body: {
          apiKey: this.apiKey,
          id: postID,
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  // returns the list of posts available
  public listPosts = async (
    boardID: string,
    sort: string,
    search: string,
    status: string,
    userId: string,
    limit: number = 40,
  ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/posts/list`, {
      body: {
        apiKey: this.apiKey,
        boardID,
        sort,
        userID: userId,
        search,
        status,
        limit,
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

  // creates a new post in the board
  public updatePost = async (body: object) => {
    const response = await makeHttpRequestV2(
      `${this.apiUrl}/posts/update`,
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

  public listUsersPost = async (
    sort: string,
    userId: string,
    search?: string,
    status?: string,
  ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/posts/list`, {
      body: {
        apiKey: this.apiKey,
        // authorID: userId,
        sort,
        status,
        search,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };

  /**
   * Retrieves an existing user from Canny.
   * @param userIdentifier - The unique identifier of the user in your application.
   * @returns {Promise<any>} The response containing user details if found.
   */
  public retrieveUser = async (userIdentifier: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/users/retrieve`,
      {
        body: {
          apiKey: this.apiKey,
          email: userIdentifier, // You can also use email or id from Canny if needed
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  public retrieveUserById = async (id: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/users/retrieve`,
      {
        body: {
          apiKey: this.apiKey,
          id, // You can also use email or id from Canny if needed
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  /**
   * Creates a new comment on a post.
   *
   * @param    authorID - The ID of the author making the comment.
   * @param    postID - The ID of the post on which the comment is made.
   * @param    value - The content of the comment.
   * @param    parentID - The ID of the parent comment (if this is a reply).
   * @returns {Promise<Object>} The response from the server after creating the comment.
   */
  public createComment = async (
    authorID: string,
    postID: string,
    value: string,
    parentID: string,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/comments/create`,
      {
        body: {
          apiKey: this.apiKey,
          authorID,
          postID,
          value,
          parentID,
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );
    return response;
  };

  /**
   * Retrieves a list of comments for a specific post.
   *
   * @param  postID - The ID of the post whose comments are being retrieved.
   * @param  boardID - The ID of the board the post belongs to.
   * @param  [limit=10] - The maximum number of comments to retrieve.
   * @param  [skip=0] - The number of comments to skip (used for pagination).
   * @returns {Promise<Object>} The response from the server with the list of comments.
   */
  public listComments = async (
    postID: string,
    boardID: string,
    limit = 10,
    skip = 0,
  ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/comments/list`, {
      body: {
        apiKey: this.apiKey,
        postID,
        boardID,
        limit,
        skip,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });

    return response;
  };

  /**
   * Creates a vote on a post.
   *
   * @param  postID - The ID of the post to vote on.
   * @param  voterID - The ID of the user casting the vote.
   * @returns {Promise<Object>} The response from the server after creating the vote.
   */

  public createVote = async (postID: string, voterID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/create`, {
      body: {
        apiKey: this.apiKey,
        postID,
        voterID,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });

    return response;
  };

  /**
   * Deletes a vote on a post.
   *
   * @param  postID - The ID of the post whose vote is being deleted.
   * @param  voterID - The ID of the user removing their vote.
   * @returns {Promise<Object>} The response from the server after deleting the vote.
   */
  public deleteVote = async (postID: string, voterID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/delete`, {
      body: {
        apiKey: this.apiKey,
        postID,
        voterID,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });

    return response;
  };

  /**
   * Retrieves a list of votes for a post.
   *
   * @param    postID - The ID of the post whose votes are being retrieved.
   * @returns {Promise<Object>} The response from the server with the list of votes.
   */
  public listVotes = async (userID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/list`, {
      body: {
        apiKey: this.apiKey,
        userID,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });

    return response;
  };

  /**
   * Lists the change log entries of a specified type by making a POST request.
   *
   * @param    type - The type of change log entries to fetch (e.g., "new", "fixed","improved").
   * @returns {Promise<Object>} - A promise that resolves to the response object from the API call.
   */

  public listChangeLog = async (type: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/entries/list`, {
      body: {
        apiKey: this.apiKey,
        type,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });

    return response;
  };

  public retreiveComments = async (body?: object) => {
    const response = await makeRequest("POST", `${this.apiUrl}/comments/list`, {
      body: {
        apiKey: this.apiKey,
        // authorID,
        ...body,
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };

  public retrieveUserComments = async (
    authorID: string,
    sort?: string,
    search?: string,
    status?: string,
  ) => {
    const existingUser = await this.retrieveUserById(authorID);

    if (!existingUser) {
      return;
    }

    const response = await this.retreiveComments({ sort, search, status });
    return response;
  };

  public retrieveVotes = async (body: object, userID: string) => {
    const response = await makeRequest(
      "POST",
      `https://canny.io/api/v1/votes/list`,
      {
        body: {
          apiKey: this.apiKey,
          // userID,
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      },
    );

    return response;
  };
}
