import { makeHttpRequest } from "$lib/api/api.common";

const createApiRequest = async (data: string[]) => {
  const [url, method, headers, body, datatype] = data;
  const response = await makeHttpRequest(url, method, headers, body, datatype);
  return response;
};

export { createApiRequest };
