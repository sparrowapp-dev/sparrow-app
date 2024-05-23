import { FeedbackService } from "@app/services/feedback.service";
import { notifications } from "@library/ui/toast/Toast";

class HelpPageViewModel {
  // Private Services
  private feedbackService = new FeedbackService();

  constructor() {}

  /**
   * @description - uploads users feedback
   * @param feedback - feedback payload
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
    return response;
  };
}

export default HelpPageViewModel;
