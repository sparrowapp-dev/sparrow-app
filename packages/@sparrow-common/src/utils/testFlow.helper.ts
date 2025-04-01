import {
  CollectionAuthTypeBaseEnum,
  CollectionRequestAddToBaseEnum,
} from "../types/workspace/collection-base";

export const transformRequestData = (input: any) => {
  return {
    id: input.data.requestId || "",
    name: input.data.name || "",
    type: "REQUEST",
    description: "[]",
    source: "USER",
    isDeleted: false,
    createdBy: "",
    updatedBy: "",
    createdAt: "",
    updatedAt: "",
    request: input.data.requestData,
  };
};

export const extractAuthData = (requestData: any) => {
  return {
    auth: {
      bearerToken: requestData.request.auth.bearerToken || "",
      basicAuth: {
        username: requestData.request.auth.basicAuth.username || "",
        password: requestData.request.auth.basicAuth.password || "",
      },
      apiKey: {
        authKey: requestData.request.auth.apiKey.authKey || "",
        authValue: requestData.request.auth.apiKey.authValue || "",
        addTo:
          requestData.request.auth.apiKey.addTo ||
          CollectionRequestAddToBaseEnum.HEADER,
      },
    },
    collectionAuthNavigation:
      requestData.request.selectedRequestAuthType ||
      CollectionAuthTypeBaseEnum.NO_AUTH,
  };
};

export const dumyRequestData = (method: string, url?: string) => {
  return {
    method: method || "",
    url: url || "",
    body: {
      raw: "",
      urlencoded: [
        {
          key: "",
          value: "",
          checked: false,
        },
      ],
      formdata: {
        text: [
          {
            key: "",
            value: "",
            checked: false,
          },
        ],
        file: [],
      },
    },
    headers: [
      {
        key: "",
        value: "",
        checked: false,
      },
    ],
    queryParams: [
      {
        key: "",
        value: "",
        checked: false,
      },
    ],
    auth: {
      bearerToken: "",
      basicAuth: {
        username: "",
        password: "",
      },
      apiKey: {
        authKey: "",
        authValue: "",
        addTo: "",
      },
    },
    selectedRequestBodyType: "text/plain",
    selectedRequestAuthType: "No Auth",
  };
};
