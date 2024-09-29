import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import { registerUser } from "../../../services/auth.service";
import { jwtDecode } from "@app/utils/jwt";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";
import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
import { sendUserDataToMixpanel } from "../login-page/login-page";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);
  if (response.isSuccessful) {
    const userDetails = jwtDecode(response.data?.data?.accessToken?.token);
    sendUserDataToMixpanel(userDetails);
    MixpanelEvent(Events.USER_SIGNUP, {
      Login_Method: "Email",
      Success: response.isSuccessful,
    });
    notifications.success("Registration successful!");
    navigate("/welcome");
  } else {
    notifications.error(response.message);
    throw "error registering user: " + response.message;
  }
};

export const handleRegisterValidation = async (userData) => {
  // const { isError, errorObject } = await checkValidation(
  //   registrationSchema,
  //   userData,
  // );
  // if (isError) {
  //   return errorObject;
  // }
  return handleRegister(userData);
};
