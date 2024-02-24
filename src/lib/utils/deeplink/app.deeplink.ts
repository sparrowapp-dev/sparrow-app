import { handleLoginV2 } from "../../../pages/Auth/login-page/login-page";

export const handleDeepLinkHandler = async (urls: string[]) => {
  console.log("urrl", urls);
  if (urls.length) {
    const url = urls[0];
    if (url.indexOf("refreshToken") != -1) {
      await handleLoginV2(urls[0]);
    }
  }
};
