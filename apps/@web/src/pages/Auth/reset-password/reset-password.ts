import { resetPassword } from "$lib/services/auth.service";
import type { resetPasswordPostBody } from "$lib/utils/dto";

import { checkValidation, resetPasswordSchema } from '$lib/utils/validation';
// import { navigate } from 'svelte-navigator';

export const handleResetPassword = async (resetPasswordCredential: resetPasswordPostBody) => {
	return await resetPassword(resetPasswordCredential);
	// if (response.isSuccessful) {
	//   notifications.success("Password Updated");
	//   navigate("/login");
	// } else {
	//   if (response.message === "Unauthorized Access") {
	//     notifications.error("Old Password and New Password cannot be same");
	//   }
	//   throw "error login user: " + response.message;
	// }
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
