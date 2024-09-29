import { user } from "@app/store/auth.store";
import { Events } from "@deprecate/utils/enums";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { ReleaseRepository } from "../../repositories/release.repository";
import { CannyIoService } from "../../services/canny.service";
import { FeedbackService } from "../../services/feedback.service";
import { ReleaseService } from "../../services/release.service";
import { notifications } from "@sparrow/library/ui";
import { DiscordIDs } from "@sparrow/support/common/constants/discord.constants";
import { LearnMoreURL } from "@sparrow/support/common/constants/learnMore.constant";
import { open } from "@tauri-apps/plugin-shell";

class HelpPageViewModel {
  // Private Services
  private cannyService = new CannyIoService();
  private feedbackService = new FeedbackService();
  private releaseService = new ReleaseService();
  private releaseRepository = new ReleaseRepository();

  constructor() {}

  /**
   * @description - uploads user feedback
   * @param uploadFeedback - includes file
   * @param type - feedback type
   * @param feedbackSubject - feedback subject
   * @param feedbackDescription - feedback description
   * @param subCategory - feedback subcategory
   * @returns
   */
  public sendFeedback = async (
    uploadFeedback,
    type,
    feedbackSubject,
    feedbackDescription,
    subCategory,
  ) => {
    const files = Array.from(uploadFeedback.file.value);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("type", type);
    if (type === "Feedback" || type === "Bug") {
      formData.append("subCategory", subCategory);
    }
    formData.append("subject", feedbackSubject);
    formData.append("description", feedbackDescription);
    const response = await this.feedbackService.createFeedback(formData);
    if (response.isSuccessful) {
      notifications.success("Feedback added successfully");
    } else {
      notifications.error("Feedback submission failed. Please try again.");
    }
    MixpanelEvent(Events.USER_FEEDBACK, {
      source: "Feedback",
    });
    return response;
  };

  /**
   * Navigates to web flow to join discord
   * @returns void
   */
  public joinDiscord = async () => {
    await open(DiscordIDs.SparrowDiscordURL);
    MixpanelEvent(Events.JOIN_DISCORD, {
      source: "Feedback",
    });
    return;
  };

  /**
   * Navigates to web flow to git hub release of sparrow
   * @returns void
   */
  public learnMore = async (version: string) => {
    if (!version) {
      return;
    }
    await open(`${LearnMoreURL}/tag/${version}`);
    return;
  };

  /**
   * opens 'add feedback' modal to fill the form
   * @returns void
   */
  public addFeedback = async () => {
    MixpanelEvent(Events.Add_Feedback, {
      source: "Feedback",
    });
    return true;
  };

  /**
   * Fetch release notes data from the backend
   * @returns Promise<any> - Promise resolving to the fetched release notes data
   */

  public fetchReleaseNotes = async (): Promise<any> => {
    const response = await this.releaseService.getReleaseData();
    if (response.isSuccessful && response.data) {
      const releaseNotes = response.data;
      const data = [];
      for (const note of releaseNotes) {
        const releaseObject = {
          id: note.id.toString(),
          versionName: note.name,
          dateCreated: note.published_at,
          features: note.body,
        };

        // Push the created object into the data array
        data.push(releaseObject);
      }
      this.releaseRepository.bulkInsertData(data);
    }
  };

  /**
   * Fetches all release notes from the database
   * @returns Promise<any[]> - Promise resolving to an array of release notes
   */
  public getAllReleaseNotes = async () => {
    const releaseNotes = await this.releaseRepository.findAll();
    let response = releaseNotes
      .map((value) => {
        return value.toMutableJSON();
      })
      .reverse();
    return response;
  };

  /**
   * Creates a user in canny service .
   *
   * @returns Promise<any[]> with the authorID.
   */
  public createUser = async () => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });
    const response = await this.cannyService.createUser({
      name: userInfo?.name,
      email: userInfo?.email,
      userID: userInfo?._id,
    });
    return response;
  };
  /**
   * Retrieves the list of boards from the Canny dashboard.
   *
   * @returns {Promise<Object>} The response from the Canny service containing boards list.
   */
  public RetrieveBoards = async () => {
    const response = await this.cannyService.fetchBoards();
    return response;
  };

  /**
   * Retrieves the list of posts from the Canny dashboard.
   *
   * @param  boardID - The ID of the board from which the posts are to be retrieved.
   * @returns A list of posts.
   */
  private getCategoryID = async (boardID: string) => {
    const response = await this.cannyService.listCategories(boardID);
    return response;
  };

  /**
   * Retrieves the category ID from the Canny dashboard.
   *
   * @param  categoryName - The name of the category for which the ID is to be retrieved.
   * @returns The category
   * */

  private getCategoryIDbyName = async (categoryName: string) => {
    const boards = await this.RetrieveBoards();

    const boardID = boards?.data?.boards[0]?.id;

    const categoriesResponse = await this.getCategoryID(boardID);

    const categories = categoriesResponse?.data?.categories;

    const categoryID = categories?.find(
      (category) =>
        category?.name?.toLowerCase() === categoryName?.toLowerCase(),
    )?.id;
    return categoryID;
  };

  /**
   * Retrieves data for a specific post using the post ID.
   *
   * @param   postID - The ID of the post to retrieve.
   * @returns {Promise<Object>} The response from the server containing the post data.
   */

  public retrievePostData = async (postID: string) => {
    const response = await this.cannyService.retrievePost(postID);
    return response;
  };
  /**
   * Retrieves a list of posts based on sorting, search, and status filters.
   *
   * @param   sort - The sorting criteria for the posts (e.g., by date, votes, etc.).
   * @param   search - The search query to filter posts.
   * @param   status - The status of the posts to filter (e.g., open, closed).
   * @returns {Promise<Object>} The response from the server containing the list of posts.
   */
  public getListOfPOsts = async (
    sort: string,
    search: string,
    status: string,
  ) => {
    const boards = await this.RetrieveBoards();
    const boardID = boards?.data?.boards[0]?.id;
    const response = await this.cannyService.listPosts(
      boardID,
      sort,
      search,
      status,
    );
    let voteList = await this.listVote();
    let result = response.data.posts.map((post) => {
      const isLiked = voteList.data.votes.some(
        (vote) => vote.post.id === post.id,
      );
      return { ...post, isPostLiked: isLiked };
    });
    return result;
  };

  /**
   * Creates a post on the feedback board retrieved from Canny service with the given title and description.
   *
   * @param  title - The title of the post.
   * @param  description - The description of the post.
   * @returns Promise<Object> The response from the Canny service after creating the post.
   */

  public createPost = async (
    title: string,
    description: string,
    categoryName: string,
    uploadFeedback: {
      file: {
        value: File[];
      };
    },
  ) => {
    const errorMessage = "Feedback submission failed. Please try again.";
    const files = Array.from(uploadFeedback?.file?.value);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const imageResponse = await this.feedbackService.fetchuploads(formData);
    if (imageResponse?.isSuccessful) {
      const images = imageResponse?.data?.data?.map(
        (file: { fileUrl: string }) => file?.fileUrl,
      );
      try {
        const categoryID = await this.getCategoryIDbyName(categoryName);
        const userResponse = await this.createUser();
        const boards = await this.RetrieveBoards();
        const boardID = boards?.data?.boards[0]?.id;
        const response = await this.cannyService.createPost({
          boardID: boardID,
          title: title,
          details: description,
          authorID: userResponse?.data?.id,
          categoryID: categoryID,
          imageURLs: images,
        });
        if (response.isSuccessful) {
          notifications.success("Feedback added successfully");
        } else {
          notifications.error(errorMessage);
        }
        return response;
      } catch (e) {
        notifications.error(errorMessage);
      }
    } else {
      notifications.error(errorMessage);
    }
  };

  /**
   * Updates a post with the provided title, description, uploaded files, and image URLs.
   *
   * @param {string} postID - The ID of the post to update.
   * @param {string} title - The updated title of the post.
   * @param {string} description - The updated description of the post.
   * @param {{ file: { value: File[] } }} uploadFeedback - An object containing the uploaded files for feedback.
   * @param {string[]} imageURLsArray - An array of existing image URLs to be combined with new uploads.
   *
   * @returns {Promise<Object>} The response from the Canny service after attempting to update the post.
   */

  public updatePost = async (
    postID: string,
    title: string,
    description: string,
    uploadFeedback: {
      file: {
        value: File[];
      };
    },
    imageURLsArray: string[], // Add this parameter to receive the image URLs
  ) => {
    const errorMessage = "Feedback submission failed. Please try again.";
    const files = Array.from(uploadFeedback?.file?.value);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    let combinedImages: string[] = [...imageURLsArray]; // Start with existing image URLs

    const imageResponse = await this.feedbackService.fetchuploads(formData);
    if (imageResponse?.isSuccessful) {
      const uploadedImages = imageResponse?.data?.data?.map(
        (file: { fileUrl: string }) => file?.fileUrl,
      );

      // Append uploaded image URLs to the combinedImages array
      if (uploadedImages) {
        combinedImages = [...combinedImages, ...uploadedImages];
      }

      try {
        const response = await this.cannyService.updatePost({
          postID: postID,
          title: title,
          details: description,
          imageURLs: combinedImages, // Use the combined image URLs
        });

        if (response.isSuccessful) {
          notifications.success("Feedback Updated successfully");
        } else {
          notifications.error(errorMessage);
        }
        return response;
      } catch (e) {
        notifications.error(errorMessage);
      }
    } else {
      notifications.error(errorMessage);
    }
  };

  public getUserPosts = async (
    sort: string,
    userId: string,
    search?: string,
    status?: string,
  ) => {
    const response = await this.cannyService.listUsersPost(
      sort,
      userId,
      search,
      status,
    );
    return response;
  };

  // public retreiveComments = async (body: object, authorID: string) => {
  //   const response = await this.cannyService.retreiveComments(body, authorID)
  //   return response;
  // }

  public retrieveUserComments = async (
    authorID: string,
    sort?: string,
    search?: string,
    status?: string,
  ) => {
    const response = await this.cannyService.retrieveUserComments(
      authorID,
      sort,
      search,
      status,
    );
    return response;
  };

  public retrieveUserVotes = async (userID: string) => {
    const response = await this.cannyService.retrieveVotes({}, userID);
    return response;
  };

  /**
   * Adds a comment to a post. If the user does not exist, creates a new user and then adds the comment.
   * @param postID - The ID of the post to comment on.
   * @param value - The text of the comment.
   * @returns {Promise<any>} The response from the Canny service.
   */
  public addComment = async (
    postID: string,
    value: string,
    parentID: string,
  ) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });

    // Try to retrieve the user first
    let userResponse = await this.cannyService.retrieveUser(userInfo?.email);

    // If user does not exist, create a new user
    if (!userResponse?.data) {
      userResponse = await this.cannyService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }

    const authorID = userResponse?.data?.id; // Use the retrieved or newly created user's ID

    // Call the create comment API
    const response = await this.cannyService.createComment(
      authorID,
      postID,
      value,
      parentID,
    );
    if (response.isSuccessful) {
      notifications.success("Comment added successfully");
    } else {
      notifications.error("Failed to add comment. Please try again.");
    }
    return response;
  };

  /**
   * Lists comments for a specific post. If the user exists, retrieves their comments for the post.
   * @param postID - The ID of the post to fetch comments for.
   * @param boardID - The ID of the board to which the post belongs.
   * @returns {Promise<any>} The response from the Canny service.
   */
  public listComments = async (postID: string) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });

    const boards = await this.RetrieveBoards();
    const boardID = boards?.data?.boards[0]?.id;

    const response = await this.cannyService.listComments(postID, boardID);

    if (response.isSuccessful) {
      const comments = response.data.comments;
      return comments;
    }
  };

  /**
   * Creates a vote for a post. If the user doesn't exist, it creates a new user first.
   *
   * @param   postID - The ID of the post to vote on.
   * @returns {Promise<Object>} The response from the server after creating the vote.
   */
  public CreateVote = async (postID: string) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });

    // Try to retrieve the user first
    let userResponse = await this.cannyService.retrieveUser(userInfo.email);

    // If user does not exist, create a new user
    if (!userResponse?.data) {
      userResponse = await this.cannyService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }
    const UserId = userResponse?.data?.id; // Use the retrieved or newly created user's ID
    if (UserId) {
      const result = await this.cannyService.createVote(postID, UserId);
      return result;
    }
  };

  /**
   * Deletes a vote for a post. If the user doesn't exist, it creates a new user first.
   *
   * @param   postID - The ID of the post whose vote is to be deleted.
   * @returns {Promise<Object>} The response from the server after deleting the vote.
   */

  public deleteVote = async (postID: string) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });
    let userResponse = await this.cannyService.retrieveUser(userInfo.email);
    if (!userResponse?.data) {
      userResponse = await this.cannyService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }

    const UserId = userResponse?.data?.id;
    if (UserId) {
      const result = await this.cannyService.deleteVote(postID, UserId);
      return result;
    }
  };

  /**
   * Retrieves the list of votes for a post. If the user doesn't exist, it creates a new user first.
   *
   * @param   postID - The ID of the post whose votes are being retrieved.
   * @returns {Promise<Object>} The response from the server with the list of votes.
   */

  public listVote = async (postID: string) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });

    let userResponse = await this.cannyService.retrieveUser(userInfo.email);

    // If user does not exist, create a new user
    if (!userResponse?.data) {
      userResponse = await this.cannyService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }
    const UserId = userResponse?.data?.id; // Use the retrieved or newly created user's ID

    if (UserId) {
      const result = await this.cannyService.listVotes(UserId);
      return result;
    }
  };

  public listChangeLog = async (type: string) => {
    const result = await this.cannyService.listChangeLog(type);
    return result;
  };
}

export default HelpPageViewModel;
