import { forgotPassword } from "../../../services/auth.service";
import type { EmailPostBody } from "@deprecate/utils/dto";
import { notifications } from "@sparrow/library/ui";
import { navigate } from "svelte-navigator";

export const handleForgotPassword = async (
  forgotPasswordCredential: EmailPostBody,
) => {
  await forgotPassword(forgotPasswordCredential);
  notifications.success("Verification code sent to registered email ID");
  navigate("/update/password");
};

//------------------------- Handle Login Validation -----------------//
export const handleForgotPasswordValidation = async (
  forgotPasswordCredential: EmailPostBody,
) => {
  // const { isError, errorObject } = await checkValidation(
  //   forgotPasswordSchema,
  //   forgotPasswordCredential,
  // );
  // if (isError) {
  //   return errorObject;
  // }
  handleForgotPassword(forgotPasswordCredential);
  return {};
};
