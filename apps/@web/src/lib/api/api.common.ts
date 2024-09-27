/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type Method } from 'axios';
import type { RequestData } from '../utils/dto/requestdata';
import { isLoading } from '$lib/store/auth.store';

interface MakeRequestResponse {
	status: 'success' | 'error';
	isSuccessful: boolean;
	message: string;
	data: any;
}

const error = (data: any, message: string = ''): MakeRequestResponse => {
	return {
		status: 'error',
		isSuccessful: false,
		message,
		data
	};
};

const success = (data: any, message: string = ""): MakeRequestResponse => {
	return {
		status: 'success',
		isSuccessful: true,
		message,
		data,
	};
};

const makeRequest = async (method: Method, url: string, requestData?: RequestData) => {
	isLoading.set(true);
	try {
		const response = await axios({
			method: method,
			url: url,
			data: requestData?.body,
			headers: requestData?.headers
		});
		return success(response.data?.data, response.data?.message);
	} catch (e: any) {
		if (e.response) {
			return error(e.response.data?.data, e.response.data?.message);
		}
		return error(e, "Internal server error");
	} finally {
		isLoading.set(false);
	}
};

export { makeRequest };
