import { user } from "@app/store/auth.store";
import { Events } from "@sparrow/common/enums";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { ReleaseRepository } from "../../repositories/release.repository";
import { OpenfeedbackService } from "../../services/openfeedback.service";
import { FeedbackService } from "../../services/feedback.service";
import { ReleaseService } from "../../services/release.service";
import { notifications } from "@sparrow/library/ui";
import { DiscordIDs } from "@sparrow/support/constants/discord.constants";
import { LearnMoreURL } from "@sparrow/support/constants/learnMore.constant";
// import type { OpenfeedbackUserType } from "@common/types/openfeedback/openfeedback";
import { open } from "@tauri-apps/plugin-shell";
import * as Sentry from "@sentry/svelte";
class HelpPageViewModel {
  // Private Services
  private openfeedbackService = new OpenfeedbackService();
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
      notifications.success("Feedback added successfully.");
    } else {
      notifications.error("Failed to add the feedback. Please try again.");
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
   * Creates a user in openfeedback service .
   *
   * @returns Promise<any[]> with the authorID.
   */
  public createUser = async () => {
    let userInfo: OpenfeedbackUserType | null;
    await user.subscribe((value) => {
      userInfo = value;
    });
    const response = await this.openfeedbackService.createUser({
      name: userInfo?.name,
      email: userInfo?.email,
      userID: userInfo?._id,
    });
    return response;
  };
  /**
   * Retrieves the list of boards from the Openfeedback dashboard.
   * If VITE_OPENFEEDBACK_BOARD_ID is configured, fetches that specific board.
   * Otherwise, fetches all boards (existing behavior).
   *
   * @returns {Promise<Object>} The response from the Openfeedback service containing boards list.
   */
  public RetrieveBoards = async () => {
    const configuredBoardId = this.openfeedbackService.getBoardId();
    const response =
      await this.openfeedbackService.fetchBoards(configuredBoardId);
    return response;
  };

  /**
   * Retrieves the list of posts from the Openfeedback dashboard.
   *
   * @param  boardID - The ID of the board from which the posts are to be retrieved.
   * @returns A list of posts.
   */
  private getCategoryID = async (boardID: string) => {
    const response = await this.openfeedbackService.listCategories(boardID);
    return response;
  };

  /**
   * Retrieves the category ID from the Openfeedback dashboard.
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
    let userInfo;

    // Subscribe to the user store (assuming it's a Svelte store or similar)
    user.subscribe((value) => {
      userInfo = value;
    });

    // Retrieve the post data (keeping the full response intact)
    const response = await this.openfeedbackService.retrievePost(postID);

    // Retrieve the votes for the post
    const voteList = await this.listVoteUsingPostId(postID);

    const votes = voteList?.data?.votes || [];

    // Check if the logged-in user has voted (liked) the post
    const isLiked = votes.some((vote) => vote.voter?.email === userInfo.email);

    response.data.isPostLiked = isLiked;

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
  public getListOfPosts = async (
    sort: string,
    search: string,
    status: string,
    userId: string,
    currentCategory: string,
    limit: number,
    skip: number,
  ) => {
    const boards = await this.RetrieveBoards();
    const boardID = boards?.data?.boards[0]?.id;
    const response = await this.openfeedbackService.listPosts(
      boardID,
      sort,
      search,
      status,
      userId,
      limit,
      skip,
    );
    let voteList = await this.listVote();
    let result = response.data.posts?.map((post) => {
      const isLiked = voteList.data.votes.some(
        (vote) => vote.post.id === post.id,
      );
      return { ...post, isPostLiked: isLiked };
    });

    const filteredResult = currentCategory
      ? result?.filter(
          (post) =>
            post.category?.name?.toLowerCase() ===
            currentCategory.toLowerCase(),
        )
      : result;
    if (search !== "") {
      return this.searchFilter(filteredResult, search);
    }
    return filteredResult;
  };

  /**
   * Simple search function to filter objects based on title and details
   * @param {Array} data - Array of objects to search through
   * @param {string} searchQuery - Search query string
   * @returns {Array} - Array of matching objects
   */
  public searchFilter(data: any, searchQuery: string) {
    if (!searchQuery || searchQuery.trim() === "") {
      return data;
    }
    const query = searchQuery.toLowerCase().trim();
    const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);
    return data.filter((item: any) => {
      const title = (item?.title || "").toLowerCase();
      const details = (item?.details || "").toLowerCase();
      // Combine both fields for searching
      const searchableText = `${title} ${details}`;
      // Check if any search term is found in the searchable text
      return searchTerms.some((term) => searchableText.includes(term));
    });
  }

  /**
   * Creates a post on the feedback board using a single unified API call.
   *
   * @param  title - The title of the post.
   * @param  description - The description of the post.
   * @param  categoryName - The category name for the post.
   * @param  uploadFeedback - Object containing files to upload.
   * @returns Promise<Object> The response from the upload API.
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
    const errorMessage = "Failed to add the feedback. Please try again.";

    try {
      // Get user info for email
      let userInfo: OpenfeedbackUserType | null;
      await user.subscribe((value) => {
        userInfo = value;
      });

      // Get board ID and category ID
      const boards = await this.RetrieveBoards();
      const boardID = boards?.data?.boards[0]?.id;
      const categoryID = await this.getCategoryIDbyName(categoryName);

      // Build FormData with files and post data
      const formData = new FormData();

      // Append files if present
      const files = Array.from(uploadFeedback?.file?.value || []);
      files.forEach((file) => formData.append("files", file));

      // Append required fields
      formData.append("title", title);
      formData.append("boardID", boardID);

      // Append optional fields
      if (description) {
        formData.append("description", description);
      }
      if (userInfo?.email) {
        formData.append("email", userInfo.email);
      }
      if (categoryID) {
        formData.append("categoryID", categoryID);
      }

      // Single API call to upload files and create post
      const response = await this.feedbackService.uploadPost(formData);

      if (response.isSuccessful) {
        notifications.success("Feedback added successfully.");
      } else {
        notifications.error(errorMessage);
      }
      return response;
    } catch (e) {
      notifications.error(errorMessage);
      Sentry.captureException(e);
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
   * @returns {Promise<Object>} The response from the Openfeedback service after attempting to update the post.
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
    const errorMessage = "Failed to add the feedback. Please try again.";
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
        const response = await this.openfeedbackService.updatePost({
          postID: postID,
          title: title,
          details: description,
          imageURLs: combinedImages, // Use the combined image URLs
        });

        if (response.isSuccessful) {
          notifications.success("Feedback updated successfully.");
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
    limit?: number,
  ) => {
    const response = await this.openfeedbackService.listUsersPost(
      sort,
      userId,
      search,
      status,
      limit,
    );
    return response;
  };

  // public retreiveComments = async (body: object, authorID: string) => {
  //   const response = await this.openfeedbackService.retreiveComments(body, authorID)
  //   return response;
  // }

  public retrieveUserComments = async (
    authorID: string,
    sort?: string,
    search?: string,
    status?: string,
  ) => {
    const response = await this.openfeedbackService.retrieveUserComments(
      authorID,
      sort,
      search,
      status,
    );
    return response;
  };

  public retrieveUserVotes = async (userID: string) => {
    const response = await this.openfeedbackService.retrieveVotes({}, userID);
    return response;
  };

  /**
   * Adds a comment to a post using a single unified API call.
   * @param postID - The ID of the post to comment on.
   * @param value - The text of the comment.
   * @param parentID - The ID of the parent comment (for replies).
   * @param uploadedImageAttachment - Object containing files to upload.
   * @returns {Promise<any>} The response from the upload API.
   */
  public addComment = async (
    postID: string,
    value: string,
    parentID: string,
    uploadedImageAttachment: {
      file: {
        value: File[];
      };
    },
  ) => {
    const errorMessage = "Failed to add comment. Please try again.";

    try {
      // Get user info for email
      let userInfo: OpenfeedbackUserType | null;
      await user.subscribe((value) => {
        userInfo = value;
      });

      // Build FormData with files and comment data
      const formData = new FormData();

      // Append files if present
      const files = Array.from(uploadedImageAttachment?.file?.value || []);
      files.forEach((file) => formData.append("files", file));

      // Append required fields
      formData.append("postID", postID);
      formData.append("value", value);

      // Append optional fields
      if (parentID) {
        formData.append("parentID", parentID);
      }
      if (userInfo?.email) {
        formData.append("email", userInfo.email);
      }

      // Single API call to upload files and create comment
      const response = await this.feedbackService.uploadComment(formData);

      if (response.isSuccessful) {
        notifications.success("Comment added successfully.");
      } else {
        notifications.error(errorMessage);
      }
      return response;
    } catch (e) {
      notifications.error(errorMessage);
      Sentry.captureException(e);
    }
  };

  /**
   * Lists comments for a specific post. If the user exists, retrieves their comments for the post.
   * @param postID - The ID of the post to fetch comments for.
   * @param boardID - The ID of the board to which the post belongs.
   * @returns {Promise<any>} The response from the Openfeedback service.
   */
  public listComments = async (postID: string) => {
    let userInfo;
    await user.subscribe((value) => {
      userInfo = value;
    });

    const boards = await this.RetrieveBoards();
    const boardID = boards?.data?.boards[0]?.id;

    const response = await this.openfeedbackService.listComments(
      postID,
      boardID,
    );

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
    let userResponse = await this.openfeedbackService.retrieveUser(
      userInfo.email,
    );

    // If user does not exist, create a new user
    if (!userResponse?.isSuccessful) {
      userResponse = await this.openfeedbackService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }
    const UserId = userResponse?.data?.id; // Use the retrieved or newly created user's ID
    if (UserId) {
      const result = await this.openfeedbackService.createVote(postID, UserId);
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
    let userResponse = await this.openfeedbackService.retrieveUser(
      userInfo.email,
    );
    if (!userResponse?.isSuccessful) {
      userResponse = await this.openfeedbackService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }

    const UserId = userResponse?.data?.id;
    if (UserId) {
      const result = await this.openfeedbackService.deleteVote(postID, UserId);
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
    let userInfo: OpenfeedbackUserType | null;
    await user.subscribe((value) => {
      userInfo = value;
    });

    let userResponse = await this.openfeedbackService.retrieveUser(
      userInfo.email,
    );

    // If user does not exist, create a new user
    if (!userResponse?.isSuccessful) {
      userResponse = await this.openfeedbackService.createUser({
        name: userInfo?.name,
        email: userInfo?.email,
        userID: userInfo?._id,
      });
    }
    const UserId = userResponse?.data?.id; // Use the retrieved or newly created user's ID

    if (UserId) {
      const result = await this.openfeedbackService.listVotes(UserId);
      return result;
    }
  };

  /**
   * Fetches a list of votes for a specific post ID.
   * @param {string} postID - The ID of the post to retrieve votes for.
   */
  public listVoteUsingPostId = async (postID: string) => {
    if (postID) {
      const result =
        await this.openfeedbackService.listVotesUsingPostId(postID);
      return result;
    }
  };

  /**
   * Fetches the changelog based on the given type.
   * @param {string} type - The type of changelog to retrieve (e.g., feature, bugfix).
   */
  public listChangeLog = async (type: string) => {
    const result = await this.openfeedbackService.listChangeLog(type);
    return result;
  };
}

export default HelpPageViewModel;
