import { throttle } from "@sparrow/common/utils";
import { platform } from "@tauri-apps/plugin-os";
import { handleLoginV2 } from "@app/pages/auth-page/sub-pages/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrent } from "@tauri-apps/api/window";
import { TeamExplorerPageViewModel } from "../../../../@sparrow-desktop/src/pages/teams-page/sub-pages/TeamExplorerPage/TeamExplorerPage.ViewModel";

interface DeepLinkHandlerWindowsPayload {
  payload: {
    url: string;
  };
}

const workspaceSwitcher = new TeamExplorerPageViewModel();

const handleLoginThrottler = throttle(handleLoginV2, 5000);

const handleDeepLink = async (url: string) => {
  await getCurrent().setFocus();

  if (url.includes("workspace=")) {
    const workspaceId = new URL(url).searchParams.get("workspace");
    if (workspaceId) {
      await workspaceSwitcher.handleSwitchWorkspace(workspaceId);
    }
  } else {
    await handleLoginThrottler(url);
  }
};

export const deepLinkHandlerWindows = async (
  deepLinkUrl: DeepLinkHandlerWindowsPayload,
) => {
  const url = deepLinkUrl.payload.url;
  if (url) {
    await handleDeepLink(url);
  }
};

export const deepLinkHandlerMacOs = async (deepLinkUrls: string[]) => {
  if (deepLinkUrls && deepLinkUrls.length) {
    await handleDeepLink(deepLinkUrls[0]);
  }
};

export const registerDeepLinkHandler = async () => {
  const os = await platform();
  if (os === "windows") {
    await listen("deep-link-urls", deepLinkHandlerWindows);
  } else if (os === "macos") {
    await onOpenUrl(deepLinkHandlerMacOs);
  }
};
