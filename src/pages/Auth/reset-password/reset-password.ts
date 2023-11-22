import { resetPassword } from "$lib/services/auth.service";
import type { resetPasswordPostBody } from "$lib/utils/dto";
import { ErrorMessages } from "$lib/utils/enums/enums";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, resetPasswordSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

export const handleResetPassword = async (
  resetPasswordCredential: resetPasswordPostBody,
) => {
  const response = await resetPassword(resetPasswordCredential);

  if (response.isSuccessful) {
    notifications.success("Password Updated");
    navigate("/login");
  } else {
    if (response.message === ErrorMessages.Unauthorized) {
      notifications.error("Old Password and New Password cannot be same");
    }
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
