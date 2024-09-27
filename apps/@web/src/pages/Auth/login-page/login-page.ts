import { loginUser } from '$lib/services/auth.service';
import type { loginUserPostBody } from '$lib/utils/dto';
import { checkValidation, loginSchema } from '$lib/utils/validation';
import { navigate } from 'svelte-navigator';

//------------------------------Navigation-------------------------------//
export const navigateToRegister = () => {
	navigate('/register');
};

//---------------- Handle Login ------------------//
export const handleLogin = async (loginCredentials: loginUserPostBody) => {
	return await loginUser(loginCredentials);
};

//------------------------- Handle Login Validation -----------------//
export const handleLoginValidation = async (loginCredentials: loginUserPostBody) => {
	const { isError, errorObject } = await checkValidation(loginSchema, loginCredentials);
	if (isError) {
		return errorObject;
	}

	return;
};
