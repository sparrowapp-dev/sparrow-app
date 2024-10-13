import { resetPassword } from "../../../../../apps/@desktop/src/services/auth.service";
import type { resetPasswordPostBody } from "@sparrow/common/dto";

import { notifications } from "@sparrow/library/ui";
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
  // const { isError, errorObject } = await checkValidation(
  //   resetPasswordSchema,
  //   resetPasswordCredential,
  // );
  // if (isError) {
  //   return errorObject;
  // }
  handleResetPassword(resetPasswordCredential);
  return {};
};
