import { registerUser } from "$lib/services/auth.service";
import { register_user } from "$lib/store/auth.store";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";

const handleRegister = async (userData) => {
  const response = await registerUser(userData);
  register_user.set(response);
  if (response.isSuccessful) {
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
