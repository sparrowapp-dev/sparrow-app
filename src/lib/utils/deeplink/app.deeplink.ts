import { handleLoginV2 } from "../../../pages/Auth/login-page/login-page";

export const handleDeepLinkHandler = async (deepLinkUrl) => {
  const url = deepLinkUrl.payload.url;
  if (url) {
    await handleLoginV2(url);
  }
};
