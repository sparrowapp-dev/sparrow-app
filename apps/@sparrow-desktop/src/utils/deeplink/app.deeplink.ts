import { throttle } from "@sparrow/common/utils";
import { platform } from "@tauri-apps/plugin-os";
import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrent } from "@tauri-apps/api/window";
import { TeamExplorerPageViewModel } from "../../../../@sparrow-desktop/src/pages/teams-page/sub-pages/TeamExplorerPage/TeamExplorerPage.ViewModel";
import { jwtDecode } from "../jwt";
import constants from "@app/constants/constants";
import { Modal } from "@sparrow/library/ui";
import { userValidationStore } from '@app/store/deviceSync.store';

interface DeepLinkHandlerWindowsPayload {
  payload: {
    url: string;
  };
}

interface JwtPayload {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

const workspaceSwitcher = new TeamExplorerPageViewModel();
const handleLoginThrottler = throttle(handleLoginV2, 5000);

const performAutoLogin = async (accessToken: string, refreshToken: string) => {
  try {
    console.log("Performing auto login...");
    
    // Store the tokens
    localStorage.setItem(constants.AUTH_TOKEN, accessToken);
    localStorage.setItem(constants.REFRESH_TOKEN, refreshToken);
    
    // You might need to initialize your auth state here
    const userDetails = jwtDecode<JwtPayload>(accessToken);
    
    if (userDetails) {
      console.log("Auto login successful for user:", userDetails.email);
      // Update any necessary auth states or stores here
      return true;
    }
    return false;
  } catch (error) {
    console.error("Auto login failed:", error);
    return false;
  }
};

const validateUserAccess = async (url: string, currentUserAccessToken: string | null): Promise<boolean> => {
  try {
    console.log("Starting user validation...");
    const existingUserToken = localStorage.getItem(constants.AUTH_TOKEN);
    console.log("Existing user token:", existingUserToken ? "Present" : "Not found");
    console.log("Current user token:", currentUserAccessToken ? "Present" : "Not found");

    // If no existing user, perform auto login
    if (!existingUserToken && currentUserAccessToken) {
      const params = new URLSearchParams(url.split("?")[1]);
      const refreshToken = params.get("refreshToken");
      if (refreshToken) {
        const autoLoginSuccess = await performAutoLogin(currentUserAccessToken, refreshToken);
        if (autoLoginSuccess) {
          userValidationStore.set({ isValid: true, checked: true });
          console.log("Auto login completed successfully");
          return true;
        }
        console.log("Auto login failed");
        return false;
      }
    }

    // Existing validation logic
    if (currentUserAccessToken && existingUserToken) {
      try {
        const currentUserDetails = jwtDecode<JwtPayload>(currentUserAccessToken);
        const existingUserDetails = jwtDecode<JwtPayload>(existingUserToken);

        if (!currentUserDetails || !existingUserDetails) {
          console.error("Failed to decode JWT tokens");
          userValidationStore.set({ isValid: false, checked: true });
          return false;
        }

        console.log("Current user details:", {
          id: currentUserDetails._id,
          email: currentUserDetails.email,
          name: currentUserDetails.name
        });

        const areUsersEqual = currentUserDetails._id === existingUserDetails._id;
        console.log("Users match:", areUsersEqual ? "Yes" : "No - Different user detected");

        userValidationStore.set({ isValid: areUsersEqual, checked: true });
        return areUsersEqual;
      } catch (jwtError) {
        console.error("Error decoding JWT tokens:", jwtError);
        userValidationStore.set({ isValid: false, checked: true });
        return false;
      }
    }

    console.log("Validation failed: Missing tokens");
    userValidationStore.set({ isValid: false, checked: true });
    return false;
  } catch (error) {
    console.error("Error during user validation:", error);
    userValidationStore.set({ isValid: false, checked: true });
    return false;
  }
};

const processDeepLink = async (url: string) => {
  try {
    await getCurrent().setFocus();
    console.log("Processing deep link URL:", url);
    
    const params = new URLSearchParams(url.split("?")[1]);
    const currentUserAccessToken = params.get("accessToken");
    
    console.log("Extracted access token:", currentUserAccessToken ? "Present" : "Not found");
    
    // Validate user access with the URL included for auto login
    const isValidUser = await validateUserAccess(url, currentUserAccessToken);
    console.log("User validation result:", isValidUser);

    if (!isValidUser && currentUserAccessToken) {
      console.log("%cYou don't seem to have access to this resource. Please check if you are using the right account", "color: red; font-weight: bold");
      Modal.error({
        title: "Access Denied",
        content: "Please log out the current user before switching accounts"
      });
      return;
    }

    // Handle workspace switch
    if (url.includes("workspaceID=")) {
      const workspaceId = params.get("workspaceID");
      console.log("Workspace switch attempted for ID:", workspaceId);
      
      if (workspaceId) {
        try {
          console.log("Proceeding with workspace switch");
          await workspaceSwitcher.handleSwitchWorkspace(workspaceId);
          console.log("Workspace switch completed successfully");
        } catch (error) {
          console.error("Error during workspace switch:", error);
          Modal.error({
            title: "Workspace Switch Failed",
            content: "Unable to switch workspace. Please try again later."
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in processDeepLink:", error);
    Modal.error({
      title: "Error",
      content: "An error occurred while processing your request"
    });
  }
};

// Windows deep link handler
export const deepLinkHandlerWindows = async (deepLinkUrl: DeepLinkHandlerWindowsPayload) => {
  console.log("Windows deep link handler triggered");
  const url = deepLinkUrl.payload.url;
  if (url) {
    await processDeepLink(url);
  }
};

// MacOS deep link handler
export const deepLinkHandlerMacOs = async (deepLinkUrl: string) => {
  console.log("MacOS deep link handler triggered");
  if (deepLinkUrl) {
    await processDeepLink(deepLinkUrl);
  }
};

// Register the deep link handler based on platform
export const registerDeepLinkHandler = async () => {
  try {
    console.log("Registering deep link handler");
    const os = await platform();
    console.log("Detected platform:", os);

    if (os === "windows") {
      await listen("deep-link-urls", deepLinkHandlerWindows);
      console.log("Windows deep link handler registered");
    } else if (os === "macos") {
      await onOpenUrl(deepLinkHandlerMacOs);
      console.log("MacOS deep link handler registered");
    } else {
      console.warn("Unsupported platform for deep linking:", os);
    }
  } catch (error) {
    console.error("Error registering deep link handler:", error);
  }
};
