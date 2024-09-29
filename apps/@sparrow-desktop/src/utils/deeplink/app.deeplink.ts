import { throttle } from "@sparrow/common/utils";
import { platform } from "@tauri-apps/plugin-os";
import { handleLoginV2 } from "@app/pages/Auth/login-page/login-page";
import { listen } from "@tauri-apps/api/event";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrent } from "@tauri-apps/api/window";

interface DeepLinkHandlerWindowsPayload {
  payload: {
    url: string;
  };
}

const handleLoginThrottler = throttle(handleLoginV2, 5000);

export const deepLinkHandlerWindows = async (
  deepLinkUrl: DeepLinkHandlerWindowsPayload,
) => {
  await getCurrent().setFocus();
  const url = deepLinkUrl.payload.url;
  if (url) {
    handleLoginThrottler(url);
  }
};

export const deepLinkHandlerMacOs = async (deepLinkUrls: string[]) => {
  if (deepLinkUrls && deepLinkUrls.length) {
    await handleLoginThrottler(deepLinkUrls[0]);
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
