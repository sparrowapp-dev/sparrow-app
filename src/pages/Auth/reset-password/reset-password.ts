import { resetPassword } from "$lib/services/auth.service";
import type { resetPasswordPostBody } from "$lib/utils/dto";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, resetPasswordSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

export const handleResetPassword = async (
  resetPasswordCredential: resetPasswordPostBody,
) => {
  const response = await resetPassword(resetPasswordCredential);
  if (response.isSuccessful) {
    notifications.success("Password Changed Successfully");
    navigate("/reset/password");
  } else {
    notifications.error("Something went wrong");
    throw "error login user: " + response.message;
  }
};

export const handleResetPasswordValidation = async (
  resetPasswordCredential: resetPasswordPostBody,
) => {
  const { isError, errorObject } = await checkValidation(
    resetPasswordSchema,
    resetPasswordCredential,
  );
  if (isError) {
    return errorObject;
  }
  handleResetPassword(resetPasswordCredential);
  return {};
};
