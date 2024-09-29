import { resetPassword } from "../../../services/auth.service";
import type { resetPasswordPostBody } from "@deprecate/utils/dto";

import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";

export const handleResetPassword = async (
  resetPasswordCredential: resetPasswordPostBody,
) => {
  const response = await resetPassword(resetPasswordCredential);

  if (response.isSuccessful) {
    notifications.success("Password Updated");
    navigate("/login");
  } else {
    if (response.message === "Unauthorized Access") {
      notifications.error("Old Password and New Password cannot be same");
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
