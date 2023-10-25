import constants from "$lib/utils/constants";
import {
  makeRequest,
  getAuthHeaders,
  makeRequestforCrud,
} from "$lib/api/api.common";

import type {
  CreateApiRequestPostBody,
  CreateDirectoryPostBody,
} from "$lib/utils/dto";

import {
  apiEndPoint,
  methodText,
  requestType,
  responseText,
} from "$lib/store/api-request";

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

export const postMethod = async () => {
  //taking link from store
  let url = "";
  apiEndPoint.subscribe((value: string) => {
    url = value;
  });

  // taking GET,POST , PUT ,  DELETE...... method from store
  let method = "";
  methodText.subscribe((value) => {
    method = value;
  });

  //taking headers from store

  //taking body text from store

  // let body_email = "";
  // let body_name = "";
  // bodyEmail.subscribe((value) => {
  //   body_email = value;
  // });

  // bodyName.subscribe((value) => {
  //   body_name = value;
  //   console.log(body_name);
  // });

  // let body_text = {
  //   name: body_name,
  //   email: body_email,
  // };

  // console.log(body_text);

  const body_text = {
    name: "kashif",
    email: "kashif@gmail.com",
  };

  const body = JSON.stringify(body_text);

  console.log(body);

  //TAKING REQUEST TYPE FROM STORE (json , xml ,)
  let request_type = "";
  requestType.subscribe((value) => {
    request_type = value;
  });

  //just for now i am only giving this header for testing
  const headers =
    "Content-Type=application/json&User-Agent=PostmanRuntime/7.33.0&Accept=*/*&Connection=keep-alive"; // Add your headers if needed
  //const body =
  // "--form '=@\"/C:/Users/91877/Downloads/WhatsApp Image 2023-10-05 at 6.09.07 PM.jpeg\"'";

  // this below body type will be valid for url encoded request type
  // const body = "username=johndoe&password=secretpassword&data=example";

  const response = await makeRequestforCrud(
    url,
    method,
    headers,
    body,
    request_type,
  );
  console.log(response.data);
  responseText.set(response.data);
};

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

export { fetchCollection, insertCollectionDirectory, insertCollectionRequest };
