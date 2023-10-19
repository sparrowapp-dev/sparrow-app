import { registerUser } from "$lib/services/auth.service";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);

  if (response.isSuccessful) {
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
