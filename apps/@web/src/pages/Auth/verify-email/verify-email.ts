import { verifyUserEmail } from '$lib/services/auth.service';
import { errorMessageText } from '$lib/store/auth.store';
import type { verifyPostbody } from '$lib/utils/dto';
export const isSuccessfulResponse = writable(false);

import { writable } from 'svelte/store';

export const handleVerifyEmail = async (verifyCodeCredential: verifyPostbody) => {
	const response = await verifyUserEmail(verifyCodeCredential);
	if (response.isSuccessful) {
        errorMessageText.set("");
	} else {
		isSuccessfulResponse.set(true);
		if (response.message === 'verificationCode should not be empty') {
			errorMessageText.set('Please enter the 6-digit verification code.');
		}

		if (response.message === 'Wrong Code') {
			errorMessageText.set('You have entered wrong code, Please check again.');
		}
	}
	return response;
};
