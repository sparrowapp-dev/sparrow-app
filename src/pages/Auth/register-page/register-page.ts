import { resizeWindowOnLogin } from "$lib/components/header/window-resize";
import { registerUser } from "$lib/services/auth.service";
import { setUser } from "$lib/store/auth.store";
import constants from "$lib/utils/constants";
import { jwtDecode, setAuthJwt } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);

  if (response.isSuccessful) {
    setAuthJwt(constants.AUTH_TOKEN, response?.data?.data?.accessToken.token);
    setAuthJwt(constants.REF_TOKEN, response?.data?.data?.refreshToken.token);
    setUser(jwtDecode(response.data?.data?.accessToken?.token));
    notifications.success("Registration successful!");
    navigate("/login");
    await resizeWindowOnLogin();
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
  handleRegister(userData);
  return {};
};
