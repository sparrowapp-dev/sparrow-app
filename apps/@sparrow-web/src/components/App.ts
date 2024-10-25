import constants from "../constants/constants";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";
import { jwtDecode, setAuthJwt, getAuthJwt } from "../utils/jwt";
import { setUser } from "../store/auth.store";
import mixpanel from "mixpanel-browser";
import MixpanelEvent from "../utils/mixpanel/MixpanelEvent";
import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
import { GuideRepository } from "../repositories/guide.repository";
import { isUserFirstSignUp } from "src/store/user.store";
const _guideRepository = new GuideRepository();

export const sendUserDataToMixpanel = (userDetails: {
  _id: string;
  email: string;
}) => {
  if (constants.ENABLE_MIX_PANEL === "true") {
    mixpanel.identify(userDetails._id);
    mixpanel.people.set({ $email: userDetails.email });
  }
};

export async function handleLogin(url: string) {
  const tokens = getAuthJwt();
  if ((!tokens[0] || !tokens[1]) && !url) {
    window.location.href = constants.SPARROW_AUTH_URL + "/init?source=web";
    return;
  }
  if (!url) return;
  if (tokens[0] && tokens[1]) {
    // handles case if account already running in app
    return;
  }
  const params = new URLSearchParams(url.split("?")[1]);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const event = params.get("event");

  if (!accessToken || !refreshToken) {
    window.location.href = constants.SPARROW_AUTH_URL + "/init?source=web";
    return;
  }
  // handles case if token exist in url
  const userDetails = jwtDecode(accessToken);
  setAuthJwt(constants.AUTH_TOKEN, accessToken);
  setAuthJwt(constants.REF_TOKEN, refreshToken);
  setUser(jwtDecode(accessToken));
  sendUserDataToMixpanel(userDetails);
  MixpanelEvent(Events.USER_LOGIN, {
    Login_Method: "Email",
    Success: true,
  });
  // User login successfully
  if (event === "register") {
    navigate("/app/home");
    _guideRepository.insert({ isActive: true, id: "environment-guide" });
    _guideRepository.insert({ isActive: true, id: "collection-guide" });
    isUserFirstSignUp.set(true);
  } else {
    navigate("/app/home");

    _guideRepository.insert({ isActive: false, id: "environment-guide" });
    _guideRepository.insert({ isActive: false, id: "collection-guide" });
  }
}
