import { makeHttpRequest } from "@app/containers/api/api.common";

const createApiRequest = async (data: string[], tabId: string) => {
  const [url, method, headers, body, datatype] = data;
  return makeHttpRequest(url, method, headers, body, datatype, tabId);
};

export { createApiRequest };
