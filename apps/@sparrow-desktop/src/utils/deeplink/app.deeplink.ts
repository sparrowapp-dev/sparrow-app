// import { throttle } from "@sparrow/common/utils";
// import { platform } from "@tauri-apps/plugin-os";
// import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
// import { listen } from "@tauri-apps/api/event";
// import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
// import { getCurrent } from "@tauri-apps/api/window";
// import { Modal } from "@sparrow/library/ui";
// import { userValidationStore } from '@app/store/deviceSync.store';
// import { TeamExplorerPageViewModel } from "../../../../@sparrow-desktop/src/pages/teams-page/sub-pages/TeamExplorerPage/TeamExplorerPage.ViewModel";
// import { jwtDecode } from "../jwt";
// import constants from "@app/constants/constants";

// interface DeepLinkHandlerWindowsPayload {
//   payload: {
//     url: string;
//   };
// }

// interface JwtPayload {
//   _id: string;
//   email: string;
//   name: string;
//   exp: number;
//   iat: number;
// }

// const workspaceSwitcher = new TeamExplorerPageViewModel();
// const handleLoginThrottler = throttle(handleLoginV2, 5000);

// const performAutoLogin = async (accessToken: string, refreshToken: string): Promise<boolean> => {
//   try {
//     localStorage.setItem(constants.AUTH_TOKEN, accessToken);
//     localStorage.setItem(constants.REFRESH_TOKEN, refreshToken);
    
//     const userDetails = jwtDecode<JwtPayload>(accessToken);
    
//     if (userDetails) {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     return false;
//   }
// };

// const validateUserAccess = async (url: string, currentUserAccessToken: string | null): Promise<boolean> => {
//   try {
//     const existingUserToken = localStorage.getItem(constants.AUTH_TOKEN);

//     // Handle auto login for new users
//     if (!existingUserToken && currentUserAccessToken) {
//       const params = new URLSearchParams(url.split("?")[1]);
//       const refreshToken = params.get("refreshToken");
      
//       if (refreshToken) {
//         const autoLoginSuccess = await performAutoLogin(currentUserAccessToken, refreshToken);
//         userValidationStore.set({ isValid: autoLoginSuccess, checked: true });
//         return autoLoginSuccess;
//       }
//     }

//     // Validate existing user
//     if (currentUserAccessToken && existingUserToken) {
//       try {
//         const currentUserDetails = jwtDecode<JwtPayload>(currentUserAccessToken);
//         const existingUserDetails = jwtDecode<JwtPayload>(existingUserToken);

//         if (!currentUserDetails || !existingUserDetails) {
//           userValidationStore.set({ isValid: false, checked: true });
//           return false;
//         }

//         const areUsersEqual = currentUserDetails._id === existingUserDetails._id;
//         userValidationStore.set({ isValid: areUsersEqual, checked: true });
//         return areUsersEqual;
//       } catch (error) {
//         userValidationStore.set({ isValid: false, checked: true });
//         return false;
//       }
//     }

//     userValidationStore.set({ isValid: false, checked: true });
//     return false;
//   } catch (error) {
//     userValidationStore.set({ isValid: false, checked: true });
//     return false;
//   }
// };

// const handleLoginAndWorkspaceSwitch = async (url: string, workspaceId: string | null) => {
//   try {
//     // First handle the login
//     await handleLoginThrottler(url);
    
//     // After successful login, switch workspace if workspaceId exists
//     if (workspaceId) {
//       // Add a small delay to ensure login is completed
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       await workspaceSwitcher.handleSwitchWorkspace(workspaceId);
//     }
//   } catch (error) {
//     throw error;
//   }
// };

// const processDeepLink = async (url: string) => {
//   try {
//     await getCurrent().setFocus();
    
//     const params = new URLSearchParams(url.split("?")[1]);
//     const currentUserAccessToken = params.get("accessToken");
//     const workspaceId = params.get("workspaceID");
    
    
//     const isValidUser = await validateUserAccess(url, currentUserAccessToken);

//     if (!isValidUser && currentUserAccessToken) {
//       Modal.error({
//         title: "Access Denied",
//         content: "Please log out the current user before switching accounts"
//       });
//       return;
//     }

//     // Handle both login and workspace switch together
//     await handleLoginAndWorkspaceSwitch(url, workspaceId);
    
//   } catch (error) {
//     Modal.error({
//       title: "Error",
//       content: "An error occurred while processing your request"
//     });
//   }
// };

// export const deepLinkHandlerWindows = async (deepLinkUrl: DeepLinkHandlerWindowsPayload) => {
//   const url = deepLinkUrl.payload.url;
//   if (url) {
//     await processDeepLink(url);
//   }
// };

// export const deepLinkHandlerMacOs = async (deepLinkUrl: string) => {
//   if (deepLinkUrl) {
//     await processDeepLink(deepLinkUrl);
//   }
// };

// export const registerDeepLinkHandler = async () => {
//   try {
//     const os = await platform();
//     console.log("Registering deep link handler for:", os);

//     if (os === "windows") {
//       await listen("deep-link-urls", deepLinkHandlerWindows);
//     } else if (os === "macos") {
//       await onOpenUrl(deepLinkHandlerMacOs);
//     } else {
//       console.warn("Unsupported platform for deep linking:", os);
//     }
//   } catch (error) {
//     console.error("Error registering deep link handler:", error);
//   }
// };