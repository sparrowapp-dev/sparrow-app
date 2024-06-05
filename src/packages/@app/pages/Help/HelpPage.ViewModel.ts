import { Events } from "$lib/utils/enums";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { FeedbackService } from "@app/services/feedback.service";
import { notifications } from "@library/ui/toast/Toast";
import { DiscordIDs } from "@support/common/constants/discord.constants";
import { open } from "@tauri-apps/plugin-shell";

class HelpPageViewModel {
  // Private Services
  private feedbackService = new FeedbackService();

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
   * opens 'add feedback' modal to fill the form
   * @returns void
   */
  public addFeedback = async () => {
    MixpanelEvent(Events.ADD_FEEDBACK, {
      source: "Feedback",
    });
    return true;
  };
}

export default HelpPageViewModel;
