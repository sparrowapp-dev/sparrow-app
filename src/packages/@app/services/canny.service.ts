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

  public updatePost = async (postID: string, body: object) => {
    const response = await makeRequest("POST", `${this.apiUrl}/posts/update`, {
      body: {
        apiKey: this.apiKey,
        id: postID,
        ...body,
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
  public listPosts = async (boardID: string, sort: string, search:string,status: string) => {   
    const response = await makeRequest("POST", `${this.apiUrl}/posts/list`, {
      body: {
        apiKey: this.apiKey,
        boardID,
        sort,
        search,
        status
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

    /**
   * Retrieves an existing user from Canny.
   * @param userIdentifier - The unique identifier of the user in your application.
   * @returns {Promise<any>} The response containing user details if found.
   */
    public retrieveUser = async (userIdentifier: string) => {
      const response = await makeRequest("POST", `${this.apiUrl}/users/retrieve`, {
        body: {
          apiKey: this.apiKey,
          email: userIdentifier,  // You can also use email or id from Canny if needed
        },
        headers: {
          "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
        },
      });
      return response;
    };


  public createComment = async ( authorID: string, postID: string, value: string, parentID :string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/comments/create`, {
      body: {
        apiKey: this.apiKey,
        authorID,
        postID,
        value,
        parentID
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
    return response;
  };


  public listComments = async (postID: string, boardID: string, limit = 10, skip = 0) => {
    const response = await makeRequest("POST", `${this.apiUrl}/comments/list`, {
      body: {
        apiKey: this.apiKey,
        postID,
        boardID,
        limit,
        skip
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
  
    return response;
  };


  public createVote = async (postID: string, voterID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/create`, {
      body: {
        apiKey: this.apiKey,
        postID,
        voterID
       
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
  
    return response;
    console.log("return response of create vote ", response)
  };

  public deleteVote = async (postID: string, voterID: string) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/delete`, {
      body: {
        apiKey: this.apiKey,
        postID,
        voterID
       
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
  
    return response;
  };



  public listVotes = async (postID: string ) => {
    const response = await makeRequest("POST", `${this.apiUrl}/votes/list`, {
      body: {
        apiKey: this.apiKey,
        postID,
       
      },
      headers: {
        "Content-type": ContentTypeEnum["application/x-www-form-urlencoded"],
      },
    });
  
    return response;
    console.log("This is respones", response)
  };


}
  



