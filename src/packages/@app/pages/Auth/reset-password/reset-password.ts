import { resetPassword } from "@app/services/auth.service";
import type { resetPasswordPostBody } from "$lib/utils/dto";

import { notifications } from "@library/ui/toast/Toast";
import { checkValidation, resetPasswordSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

export const handleResetPassword = async (
  resetPasswordCredential: resetPasswordPostBody,
) => {
  const response = await resetPassword(resetPasswordCredential);

  if (response.isSuccessful) {
    notifications.success("Password updated successfully.");
    navigate("/login");
  } else {
    if (response.message === "Unauthorized Access") {
      notifications.error(
        "Old and New Password cannot be same. Please enter a different password.",
      );
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
