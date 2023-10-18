import { registerUser } from "$lib/services/auth.service";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";
import { jwtDecode, setJwt } from "$lib/utils/jwt";
import { setUser } from "$lib/store/auth.store";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);

  if (response.isSuccessful) {
    setJwt(response.data.data.accessToken.token);
    setUser(jwtDecode(response.data.data.accessToken.token));
    notifications.success("Registration successful!");
    navigate("/login");
  } else {
    notifications.error("Something went wrong");
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
