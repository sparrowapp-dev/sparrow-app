import { Events } from "$lib/utils/enums";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { ReleaseRepository } from "@app/repositories/release.repository";
import { FeedbackService } from "@app/services/feedback.service";
import { ReleaseService } from "@app/services/release.service";
import { notifications } from "@library/ui/toast/Toast";
import { DiscordIDs } from "@support/common/constants/discord.constants";
import { LearnMoreURL } from "@support/common/constants/learnMore.constant";
import { open } from "@tauri-apps/plugin-shell";

class HelpPageViewModel {
  // Private Services
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
    if (version == "undefined" || !version) {
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
}

export default HelpPageViewModel;
