import { forgotPassword } from '$lib/services/auth.service';
import type { EmailPostBody } from '$lib/utils/dto';
import { checkValidation, forgotPasswordSchema } from '$lib/utils/validation';

export const handleForgotPassword = async (forgotPasswordCredential: EmailPostBody) => {
	return await forgotPassword(forgotPasswordCredential);
};

//------------------------- Handle Login Validation -----------------//
export const handleForgotPasswordValidation = async (forgotPasswordCredential: EmailPostBody) => {
	const { isError, errorObject } = await checkValidation(
		forgotPasswordSchema,
		forgotPasswordCredential
	);
	if (isError) {
		return errorObject;
	}
	return;
};
