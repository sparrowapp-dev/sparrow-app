import { forgotPassword } from "$lib/services/auth.service";
import type { EmailPostBody } from "$lib/utils/dto";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, forgotPasswordSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";

export const handleForgotPassword = async (
  forgotPasswordCredential: EmailPostBody,
) => {
  const response = await forgotPassword(forgotPasswordCredential);

  if (response.isSuccessful) {
    notifications.success("Verification code sent to registered email ID");
    navigate("/update/password");
  } else {
    notifications.error(response.message);
    throw "error login user: " + response.message;
  }
};

//------------------------- Handle Login Validation -----------------//
export const handleForgotPasswordValidation = async (
  forgotPasswordCredential: EmailPostBody,
) => {
  const { isError, errorObject } = await checkValidation(
    forgotPasswordSchema,
    forgotPasswordCredential,
  );
  if (isError) {
    return errorObject;
  }
  handleForgotPassword(forgotPasswordCredential);
  return {};
};
