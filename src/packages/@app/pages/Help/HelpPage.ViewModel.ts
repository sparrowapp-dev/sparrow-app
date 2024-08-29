import { user } from "$lib/store";
import { Events } from "$lib/utils/enums";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { ReleaseRepository } from "@app/repositories/release.repository";
import { CannyIoService } from "@app/services/canny-io";
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

  private getCategoryID = async (boardID: string) => {
    const response = await this.cannyService.listCategories(boardID);
    return response;
  };

  private getCategoryIDbyName = async (categoryName) => {
    const boards = await this.RetrieveBoards();

    const boardID = boards?.data?.boards[0]?.id;

    const categoriesResponse = await this.getCategoryID(boardID);

    const categories = categoriesResponse?.data?.categories;

    const categoryID = categories?.find(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
    )?.id;
    return categoryID;
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
  ) => {
    const categoryID = await this.getCategoryIDbyName(categoryName);
    const res = await this.createUser();
    const boards = await this.RetrieveBoards();
    const boardID = boards?.data?.boards[0]?.id;
    const response = await this.cannyService.createPost({
      boardID: boardID,
      title: title,
      details: description,
      authorID: res?.data?.id,
      categoryID: categoryID,
    });
    return response;
  };
}

export default HelpPageViewModel;
