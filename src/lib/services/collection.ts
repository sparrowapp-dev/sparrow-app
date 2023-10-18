import constants from "$lib/utils/constants";
import { getUserToken } from "$lib/utils/token";
import { get, post } from "$lib/api/api.common";
const apiUrl = constants.API_URL;

const fetchCollection = async (workspaceId: string) => {
  const response = await get(
    `${apiUrl}/api/collection/${workspaceId}`,
    getUserToken(),
  );
  return response;
};

const insertCollectionDirectory = async (
  workspaceId,
  collectionId,
  directoryName,
) => {
  const response = await post(
    `${apiUrl}/api/collection/${collectionId}/workspace/${workspaceId}/folder`,
    {
      name: directoryName,
      description: "",
    },
    getUserToken(),
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

export { fetchCollection, insertCollectionDirectory };
