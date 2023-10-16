import constants from "$lib/utils/constants";
import { getUserToken } from "$lib/utils/token";
import { get, post, put, del } from "$lib/api/api.common";
import type { WorkspacePostBody } from "$lib/utils/dto";
const apiUrl = constants.API_URL;

const fetchIndividualWorkspace = async (workspaceId: string) => {
  const response = await get(
    `${apiUrl}/api/workspace/${workspaceId}`,
    getUserToken(),
  );
  return response;
};

const updateWorkspace = async (
  workspaceId: string,
  data: WorkspacePostBody,
) => {
  const response = await put(
    `${apiUrl}/api/workspace/${workspaceId}`,
    data,
    getUserToken,
  );
  return response;
};

const deleteWorkspace = async (workspaceId: string) => {
  const response = await del(
    `${apiUrl}/api/workspace/${workspaceId}`,
    getUserToken,
  );
  return response;
};

const createWorkspace = async (data: WorkspacePostBody) => {
  const response = await post(`${apiUrl}/api/workspace`, data, getUserToken);
  return response;
};

export default {
  fetchIndividualWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createWorkspace,
};
