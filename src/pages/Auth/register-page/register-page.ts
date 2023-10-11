import authService from "$lib/services/auth.service";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

const handleRegister = async (userData) => {
  try {
    await authService.registerUser({
      email: userData.email,
      name: userData.name,
      password: userData.password,
    });
    notifications.success("Registration successful!");
    navigate("/");
  } catch (error) {
    console.log(error);
    throw error;
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
