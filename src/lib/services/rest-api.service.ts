import { makeHttpRequest } from "$lib/api/api.common";

const createApiRequest = async (data: string[], tabId: string) => {
  const [url, method, headers, body, datatype] = data;

  makeHttpRequest(url, method, headers, body, datatype, tabId);
  return;
};

export { createApiRequest };
