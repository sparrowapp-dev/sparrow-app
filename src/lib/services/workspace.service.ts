import constants from "$lib/utils/constants";
import { makeRequest, getAuthHeaders } from "$lib/api/api.common";
import type { WorkspacePostBody } from "$lib/utils/dto";
const apiUrl: string = constants.API_URL;

const fetchWorkspace = async (workspaceId: string): Promise<unknown> => {
  const response = await makeRequest(
    "GET",
    `${apiUrl}/api/workspace/${workspaceId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return response;
};

const updateWorkspace = async (
  workspaceId: string,
  workspace: WorkspacePostBody,
): Promise<unknown> => {
  const response = await makeRequest(
    "PUT",
    `${apiUrl}/api/workspace/${workspaceId}`,
    {
      body: workspace,
      headers: getAuthHeaders(),
    },
  );
  return response;
};

const deleteWorkspace = async (workspaceId: string): Promise<unknown> => {
  const response = await makeRequest(
    "DELETE",
    `${apiUrl}/api/workspace/${workspaceId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return response;
};

const createWorkspace = async (
  workspace: WorkspacePostBody,
): Promise<unknown> => {
  const response = await makeRequest("POST", `${apiUrl}/api/workspace`, {
    body: workspace,
    headers: getAuthHeaders(),
  });
  return response;
};

export { fetchWorkspace, updateWorkspace, deleteWorkspace, createWorkspace };
