import { RequestDataset, RequestDataType, RequestMethod } from "../enums";
import {
  CollectionAuthTypeBaseEnum,
  CollectionRequestAddToBaseEnum,
} from "../types/workspace/collection-base";
import { HttpRequestAuthTypeBaseEnum } from "../types/workspace/http-request-base";

export const defaultAuthValue = {
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
};

export const httpMethodData = [
  {
    name: "GET",
    id: RequestMethod.GET,
    color: "success",
  },
  {
    name: "POST",
    id: RequestMethod.POST,
    color: "warning",
  },
  {
    name: "PUT",
    id: RequestMethod.PUT,
    color: "secondary",
  },
  {
    name: "DELETE",
    id: RequestMethod.DELETE,
    color: "danger",
  },
  {
    name: "PATCH",
    id: RequestMethod.PATCH,
    color: "patch",
  },
];

export const httpsAuthData = [
  {
    name: "No Auth",
    id: HttpRequestAuthTypeBaseEnum.NO_AUTH,
  },
  {
    name: "API Key",
    id: HttpRequestAuthTypeBaseEnum.API_KEY,
  },
  {
    name: "Bearer Token",
    id: HttpRequestAuthTypeBaseEnum.BEARER_TOKEN,
  },
  {
    name: "Basic Auth",
    id: HttpRequestAuthTypeBaseEnum.BASIC_AUTH,
  },
];

export const requestBodyTypes = [
  {
    name: "none",
    id: RequestDataset.NONE,
  },
  {
    name: "form-data",
    id: RequestDataset.FORMDATA,
  },
  {
    name: "x-www-form-urlencoded",
    id: RequestDataset.URLENCODED,
  },
  {
    name: "raw",
    id: RequestDataset.RAW,
  },
  {
    name: "binary",
    id: RequestDataset.BINARY,
    disabled: true,
  },
];

export const requestBodySubTypes = [
  {
    name: "HTML",
    id: RequestDataType.HTML,
  },
  {
    name: "JSON",
    id: RequestDataType.JSON,
  },
  {
    name: "JavaScript",
    id: RequestDataType.JAVASCRIPT,
  },
  {
    name: "Text",
    id: RequestDataType.TEXT,
  },
  {
    name: "XML",
    id: RequestDataType.XML,
  },
];

export const responseBodyDataFormatTypes = [
  {
    name: "JSON",
    id: RequestDataType.JSON,
  },
  {
    name: "XML",
    id: RequestDataType.XML,
  },
  {
    name: "HTML",
    id: RequestDataType.HTML,
  },
  {
    name: "Javascript",
    id: RequestDataType.JAVASCRIPT,
  },
  {
    name: "Text",
    id: RequestDataType.TEXT,
  },
];

export const defaultAutoGeneratedHeaders = [
  { key: "Accept", value: "*/*", checked: true },
  { key: "Connection", value: "keep-alive", checked: true },
  {
    key: "User-Agent",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    checked: true,
  },
  { key: "Accept-Encoding", value: "gzip, br", checked: true },
];

export const defaultState = {
  requestBodyLanguage: "Text",
  requestBodyNavigation: "None",
  requestAuthNavigation: "No Auth",
  requestNavigation: "Parameters",
  responseNavigation: "Response",
  responseBodyLanguage: "Text",
  responseBodyFormatter: "Pretty",
  requestExtensionNavigation: "",
  requestLeftSplitterWidthPercentage: 50,
  requestRightSplitterWidthPercentage: 50,
  isExposeEditDescription: true,
  isSendRequestInProgress: false,
  isSaveDescriptionInProgress: false,
  isSaveRequestInProgress: false,
  isParameterBulkEditActive: false,
  isHeaderBulkEditActive: false,
  isChatbotActive: false,
  isChatbotSuggestionsActive: true,
  isChatbotGeneratingResponse: false,
  isDocGenerating: false,
  isDocAlreadyGenerated: false,
};

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

export const defaultRequestData = (
  name: string,
  method: string,
  url?: string,
) => {
  return {
    name: name || "",
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
    autoGeneratedHeaders: defaultAutoGeneratedHeaders,
    state: {
      requestBodyLanguage: "Text",
      requestBodyNavigation: "None",
      requestAuthNavigation: "No Auth",
      requestNavigation: "Parameters",
      responseNavigation: "Response",
      responseBodyLanguage: "Text",
      responseBodyFormatter: "Pretty",
      requestExtensionNavigation: "",
      requestLeftSplitterWidthPercentage: 50,
      requestRightSplitterWidthPercentage: 50,
      isExposeEditDescription: true,
      isSendRequestInProgress: false,
      isSaveDescriptionInProgress: false,
      isSaveRequestInProgress: false,
      isParameterBulkEditActive: false,
      isHeaderBulkEditActive: false,
      isChatbotActive: false,
      isChatbotSuggestionsActive: true,
      isChatbotGeneratingResponse: false,
      isDocGenerating: false,
      isDocAlreadyGenerated: false,
    },
  };
};

export const extractQueryParams = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);

    const result = [];

    for (const [key, value] of searchParams.entries()) {
      result.push({
        key,
        value,
        checked: true,
      });
    }

    // If no params found, return one empty object
    return result.length > 0
      ? result
      : [{ key: "", value: "", checked: false }];
  } catch (error) {
    // console.error("Invalid URL:", error);
    return [{ key: "", value: "", checked: false }];
  }
};
