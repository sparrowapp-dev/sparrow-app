import constants from "@app/constants/constants";
import {
  makeRequest,
  getAuthHeaders,
  makeHttpRequest,
} from "@app/containers/api/api.common";

import type {
  CreateApiRequestPostBody,
  CreateCollectionPostBody,
  CreateDirectoryPostBody,
} from "@deprecate/utils/dto";

// import {
//   apiEndPoint,
//   bodyText,
//   methodText,
//   requestType,
//   responseText,
// } from "@app/store/auth.store/api-request";
// import { keyStore, valueStore } from "@app/store/auth.store/parameter";

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

const updateCollectionRequest = async (
  id: string,
  folderId: string,
  collectionId: string,
  apiRequest: CreateApiRequestPostBody,
) => {
  const response = await makeRequest(
    "PUT",
    `${apiUrl}/api/collection/request/${id}`,
    {
      body: apiRequest,
      headers: getAuthHeaders(),
    },
  );
  return response;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const insertCollection: (
  collection: CreateCollectionPostBody,
) => Promise<any> = async (collection) => {
  const response = await makeRequest("POST", `${apiUrl}/api/collection`, {
    body: collection,
    headers: getAuthHeaders(),
  });
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

// export const crudMethod = async () => {
//   try {
//     let keyText: string;
//     let valueText: string;

//     keyStore.subscribe((value) => {
//       if (value) {
//         keyText = value;
//       }
//     });

//     valueStore.subscribe((value) => {
//       if (value) {
//         valueText = value;
//       }
//     });

//     let url: string = "";
//     const unsubscribeUrl = apiEndPoint.subscribe((value) => {
//       if (value) {
//         url = value;
//       }
//     });

//     if (url.length === 0) {
//       url = keyText + valueText;
//     }

//     let method: string = "";
//     const unsubscribeMethod = methodText.subscribe((value) => {
//       if (value) {
//         method = value;
//       }
//     });

//     let bodyTextValue: string;
//     const unsubscribeBody = bodyText.subscribe((value) => {
//       if (value) {
//         bodyTextValue = value;
//       }
//     });

//     if (bodyTextValue === "") {
//       bodyTextValue = "{}";
//     }

//     let request: string = "";
//     const unsubscribeRequest = requestType.subscribe((value) => {
//       if (value) {
//         request = value;
//       }
//     });

//     // Unsubscribe from the stores after we're done
//     unsubscribeUrl();
//     unsubscribeMethod();
//     unsubscribeBody();
//     unsubscribeRequest();

//     const headers =
//       "Content-Type=application/json&User-Agent=PostmanRuntime/7.33.0&Accept=*/*&Connection=keep-alive"; // Add your headers if needed

//     const response = await makeHttpRequest(
//       url,
//       method,
//       headers,
//       bodyTextValue,
//       request,
//     );
//     let responseData: any;

//     if (response?.data) {
//       try {
//         responseData = response?.data;
//       } catch (error) {
//         console.error("Error parsing JSON:", error);
//         responseData = null;
//       }
//     }

//     responseText.set(responseData);
//   } catch (error) {
//     console.error("Error:", error);
//     // return error.message;
//     // Handle the error gracefully, you can show an error message to the user or take other appropriate actions.
//   }
// };

// const newRequest = {
//   url: "https://example.com/api/resource",
//   headers: {
//     "Content-Type": "application/json",
//     // Add other headers as needed
//   },
//   body: JSON.stringify({ key: "value" }),
//   requestType: "POST",
// };

// apiRequests.update((requests) => [...requests, newRequest]);

export {
  fetchCollection,
  insertCollectionDirectory,
  insertCollectionRequest,
  insertCollection,
  updateCollectionRequest,
};
