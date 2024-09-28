import MixpanelEvent from "@deprecate/utils/mixpanel/MixpanelEvent";
import { registerUser } from "../../../services/auth.service";
import { register_user } from "@deprecate/store/auth.store";
import { jwtDecode } from "@deprecate/utils/jwt";
import { notifications } from "@sparrow/library/ui";
import {
  checkValidation,
  registrationSchema,
} from "@deprecate/utils/validation";
import { navigate } from "svelte-navigator";
import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
import { sendUserDataToMixpanel } from "../login-page/login-page";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);
  register_user.set(response);
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
  const { isError, errorObject } = await checkValidation(
    registrationSchema,
    userData,
  );
  if (isError) {
    return errorObject;
  }
  return handleRegister(userData);
};
