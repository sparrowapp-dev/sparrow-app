import { user } from "$lib/store";
import { Events } from "$lib/utils/enums";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { ReleaseRepository } from "@app/repositories/release.repository";
import { CannyIoService } from "@app/services/canny.service";
import { FeedbackService } from "@app/services/feedback.service";
import { ReleaseService } from "@app/services/release.service";
import { notifications } from "@library/ui/toast/Toast";
import { DiscordIDs } from "@support/common/constants/discord.constants";
import { LearnMoreURL } from "@support/common/constants/learnMore.constant";
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
    MixpanelEvent(Events.ADD_FEEDBACK, {
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
  // write js docs
  retrievePostData = async (postID: string) => {
    const response = await this.cannyService.retrievePost(postID);
    return response;
  };

  public getListOfPOsts = async (sort, userID) => {
    const boards = await this.RetrieveBoards();

    const boardID = boards?.data?.boards[0]?.id;
    const response = await this.cannyService.listPosts(boardID, sort, userID);
    return response;
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

  public updatePost = async (postID) => {
    const response = await this.cannyService.updatePost(postID, {});
    return response;
  };

  public getUserPosts = async (sort: string, userId: string) => {
    const response = await this.cannyService.listUsersPost(sort, userId)
    return response
  }

  public retreiveComments = async (body: object, authorID: string) => {
    const response = await this.cannyService.retreiveComments({}, authorID)
    return response;
  }

  public retrieveUserVotes = async (userID: string) => {
    const response = await this.cannyService.retrieveVotes({}, userID)
    return response
  }
}

export default HelpPageViewModel;
