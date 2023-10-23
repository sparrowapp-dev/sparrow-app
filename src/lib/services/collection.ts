import constants from "$lib/utils/constants";
import { makeRequest, getAuthHeaders } from "$lib/api/api.common";
import type {
  CreateApiRequestPostBody,
  CreateDirectoryPostBody,
} from "$lib/utils/dto";
const apiUrl: string = constants.API_URL;

const fetchCollection = async (workspaceId: string) => {
  const response = await makeRequest(
    "GET",
    `${apiUrl}/api/collection/${workspaceId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return response;
};

const insertCollectionDirectory = async (
  workspaceId: string,
  collectionId: string,
  directory: CreateDirectoryPostBody,
) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder`,
    {
      body: directory,
      headers: getAuthHeaders(),
    },
  );
  return response;
};

const insertCollectionRequest = async (
  apiRequest: CreateApiRequestPostBody,
) => {
  const response = await makeRequest(
    "POST",
    `${apiUrl}/api/collection/request`,
    {
      body: apiRequest,
      headers: getAuthHeaders(),
    },
  );
  return response;
};

// collection  to create files and folder
// const createCollectionEntry = async (collectionId :string, workspaceId: string) =>{
//   const response = await post(
//     `${apiUrl}/api/collection/${collectionId}`,
//     {
//       collectionId, workspaceId
//     },
//     getUserToken()
//   );
//   return response;
// }

// const updateWorkspace = async (
//   workspaceId: string,
//   data: WorkspacePostBody,
// ) => {
//   const response = await put(
//     `${apiUrl}/api/workspace/${workspaceId}`,
//     data,
//     getUserToken,
//   );
//   return response;
// };

// const deleteWorkspace = async (workspaceId: string) => {
//   const response = await del(
//     `${apiUrl}/api/workspace/${workspaceId}`,
//     getUserToken,
//   );
//   return response;
// };

// const createWorkspace = async (data: WorkspacePostBody) => {
//   const response = await post(`${apiUrl}/api/workspace`, data, getUserToken);
//   return response;
// };

export { fetchCollection, insertCollectionDirectory, insertCollectionRequest };
