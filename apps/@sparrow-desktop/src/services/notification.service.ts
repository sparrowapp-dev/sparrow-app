import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import constants from "@app/constants/constants";
import { getSelfhostUrls } from "@app/utils/jwt";
import { setNotifications, loadingNotifications } from "@sparrow/common/store";

export class NotificationService {
  private apiUrl: string = constants.API_URL;

  constructor() {
    const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
      this.apiUrl = selfhostBackendUrl;
    }
  }

  /**
   * Fetch user notifications
   */
  public fetchNotifications = async (
    page = 1,
    limit = 20,
    includeArchived = false,
  ) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/notifications?page=${page}&limit=${limit}&includeArchived=${includeArchived}`,
      {
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  /**
   * Mark notification as read
   */
  public markAsRead = async (notificationId: string) => {
    const response = await makeRequest(
      "PATCH",
      `${this.apiUrl}/api/notifications/${notificationId}/read`,
      {
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  /**
   * Mark all notifications as read
   */
  public markAllAsRead = async () => {
    const response = await makeRequest(
      "PATCH",
      `${this.apiUrl}/api/notifications/read-all`,
      {
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  /**
   * Archive notification
   */
  public archiveNotification = async (notificationId: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/notifications/${notificationId}/archive`,
      {
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  /**
   * Respond to invite
   */
  public respondToInvite = async (
    notificationId: string,
    action: "accept" | "reject",
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/notifications/${notificationId}/respond`,
      {
        headers: getAuthHeaders(),
        body: { action },
      },
    );

    return response;
  };
  public loadNotificationsToStore = async () => {
    try {
      loadingNotifications.set(true);

      const res = await this.fetchNotifications();

      setNotifications(res.data?.data?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      loadingNotifications.set(false);
    }
  };
}
