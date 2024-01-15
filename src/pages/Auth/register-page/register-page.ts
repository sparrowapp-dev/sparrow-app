import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { registerUser } from "$lib/services/auth.service";
import { register_user } from "$lib/store/auth.store";
import { jwtDecode } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import mixpanel from "mixpanel-browser";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);
  register_user.set(response);
  if (response.isSuccessful) {
    const userDetails = jwtDecode(response.data?.data?.accessToken?.token);
    mixpanel.identify(userDetails._id);
    mixpanel.people.set({ $email: userDetails.email });
    MixpanelEvent({
      eventName: "User_Signup",
      properties: { Login_Method: "Email", Success: response.isSuccessful },
    });
    return response;
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
