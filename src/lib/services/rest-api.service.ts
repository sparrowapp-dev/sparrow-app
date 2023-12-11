import { makeHttpRequest } from "$lib/api/api.common";

const createApiRequest = async (data: string[]) => {
  const [url, method, headers, body, datatype] = data;
  return makeHttpRequest(url, method, headers, body, datatype);
};

export { createApiRequest };
