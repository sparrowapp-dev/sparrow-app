import type {
	loginUserPostBody,
	registerUserPostBody,
	EmailPostBody,
	verifyPostbody,
	resetPasswordPostBody
} from '$lib/utils/dto';
import { makeRequest } from '$lib/api/api.common';
import constants from '$lib/utils/constants';
const apiUrl: string = constants.API_URL;

const registerUser = async (userInfo: registerUserPostBody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user`, {
		body: userInfo
	});

	return response;
};

const loginUser = async (userInfo: loginUserPostBody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/auth/login`, {
		body: userInfo
	});
	return response;
};

const loginWithGoogle = async () => {
	const response = await makeRequest('GET', `${apiUrl}/api/auth/google`);

	return response;
};

const getUser = async (email: string) => {
	const response = await makeRequest('GET', `${apiUrl}/api/user/email/${email}`);

	return response;
};

const forgotPassword = async (emailInfo: EmailPostBody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user/send-verification-email`, {
		body: emailInfo
	});

	return response;
};

const verifyEmail = async (verifyInfo: verifyPostbody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user/verify-email`, {
		body: verifyInfo
	});
	return response;
};

const resetPassword = async (changePasswordBody: resetPasswordPostBody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user/change-password`, {
		body: changePasswordBody
	});
	return response;
};

const sendUserEmailVerification = async (emailInfo: EmailPostBody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user/send-user-verification-email`, {
		body: emailInfo
	});
	return response;
};

const verifyUserEmail = async (verifyInfo: verifyPostbody) => {
	const response = await makeRequest('POST', `${apiUrl}/api/user/verify-user-email`, {
		body: verifyInfo
	});
	return response;
};

export { registerUser, loginUser, forgotPassword, loginWithGoogle, verifyEmail, resetPassword, getUser, sendUserEmailVerification, verifyUserEmail };
