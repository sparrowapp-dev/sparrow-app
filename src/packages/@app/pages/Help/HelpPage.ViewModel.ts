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
  public sendFeedback = async (feedback) => {
    const response = await this.feedbackService.createFeedback(feedback);
    if (response.isSuccessful) {
      notifications.success("Feedback added successfully");
    } else {
      notifications.error("Feedback submission failed. Please try again.");
    }
  };
}

export default HelpPageViewModel;
