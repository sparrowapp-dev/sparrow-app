import { AuthTypeEnum } from "@sparrow/common/types/workspace";
import { AuthSection, AuthType } from "../enums/authorization.enum";
import {
  ContentTypeEnum,
  RequestDataType,
  RequestDataset,
} from "../enums/request.enum";
/* eslint-disable @typescript-eslint/no-explicit-any */
const findAuthHeader = (
  request: any,
): {
  key: string;
  value: string;
} => {
  const authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  if (
    request.state.requestAuthNavigation === AuthType.BEARER_TOKEN &&
    request.auth.bearerToken
  ) {
    authValue.key = "Authorization";
    authValue.value = "Bearer " + request.auth.bearerToken;
  } else if (request.state.requestAuthNavigation === AuthType.BASIC_AUTH) {
    authValue.key = "Authorization";
    authValue.value = `Basic ${btoa(
      request.auth.basicAuth.username + ":" + request.auth.basicAuth.password,
    )}`;
  } else if (
    request.state.requestAuthNavigation === AuthType.API_KEY &&
    request.auth.apiKey.addTo === AuthSection.HEADER &&
    (request.auth.apiKey.authKey || request.auth.apiKey.authValue)
  ) {
    authValue.key = request.auth.apiKey.authKey;
    authValue.value = request.auth.apiKey.authValue;
  } else {
    authValue.key = "";
    authValue.value = "";
  }
  return authValue;
};

const findAuthParameter = (
  request: any,
): {
  key: string;
  value: string;
} => {
  const authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  if (
    request.state.requestAuthNavigation === AuthType.API_KEY &&
    request.auth.apiKey.addTo === AuthSection.QUERY_PARAMETER &&
    (request.auth.apiKey.authKey || request.auth.apiKey.authValue)
  ) {
    authValue.key = request.auth.apiKey.authKey;
    authValue.value = request.auth.apiKey.authValue;
  } else {
    authValue.key = "";
    authValue.value = "";
  }
  return authValue;
};

const unsetBodyType = (bodyType: string) => {
  let contentType: ContentTypeEnum = ContentTypeEnum["text/plain"];
  switch (bodyType) {
    case RequestDataType.JSON:
      contentType = ContentTypeEnum["application/json"];
      break;
    case RequestDataType.XML:
      contentType = ContentTypeEnum["application/xml"];
      break;
    case RequestDataType.HTML:
      contentType = ContentTypeEnum["text/html"];
      break;
    case RequestDataType.JAVASCRIPT:
      contentType = ContentTypeEnum["application/javascript"];
      break;
    case RequestDataType.TEXT:
      contentType = ContentTypeEnum["text/plain"];
      break;
    case RequestDataset.URLENCODED:
      contentType = ContentTypeEnum["application/x-www-form-urlencoded"];
      break;
    case RequestDataset.FORMDATA:
      contentType = ContentTypeEnum["multipart/form-data"];
      break;
  }
  return contentType;
};

const setBodyType = (header: string) => {
  let requestBodyNavigation = RequestDataset.RAW;
  let requestBodyLanguage = RequestDataType.TEXT;
  switch (header) {
    case ContentTypeEnum["application/json"]:
      requestBodyNavigation = RequestDataset.RAW;
      requestBodyLanguage = RequestDataType.JSON;
      break;
    case ContentTypeEnum["application/xml"]:
      requestBodyNavigation = RequestDataset.RAW;
      requestBodyLanguage = RequestDataType.XML;
      break;
    case ContentTypeEnum["application/javascript"]:
      requestBodyNavigation = RequestDataset.RAW;
      requestBodyLanguage = RequestDataType.JAVASCRIPT;
      break;
    case ContentTypeEnum["text/plain"]:
      requestBodyNavigation = RequestDataset.RAW;
      requestBodyLanguage = RequestDataType.TEXT;
      break;
    case ContentTypeEnum["text/html"]:
      requestBodyNavigation = RequestDataset.RAW;
      requestBodyLanguage = RequestDataType.HTML;
      break;
    case ContentTypeEnum["application/x-www-form-urlencoded"]:
      requestBodyNavigation = RequestDataset.URLENCODED;
      break;
    case ContentTypeEnum["multipart/form-data"]:
      requestBodyNavigation = RequestDataset.FORMDATA;
      break;
  }
  return { requestBodyLanguage, requestBodyNavigation };
};

const setAuthType = (auth: string) => {
  let requestAuthNavigation = AuthType.NO_AUTH;
  switch (auth) {
    case AuthType.NO_AUTH:
      requestAuthNavigation = AuthType.NO_AUTH;
      break;
    case AuthType.API_KEY:
      requestAuthNavigation = AuthType.API_KEY;
      break;
    case AuthType.BASIC_AUTH:
      requestAuthNavigation = AuthType.BASIC_AUTH;
      break;
    case AuthType.BEARER_TOKEN:
      requestAuthNavigation = AuthType.BEARER_TOKEN;
      break;
  }
  return { requestAuthNavigation };
};

const unsetAuthType = (auth: AuthTypeEnum | undefined) => {
  let authType = AuthType.NO_AUTH;
  switch (auth) {
    case AuthTypeEnum.NO_AUTH:
      authType = AuthType.NO_AUTH;
      break;
    case AuthTypeEnum.API_KEY:
      authType = AuthType.API_KEY;
      break;
    case AuthTypeEnum.BASIC_AUTH:
      authType = AuthType.BASIC_AUTH;
      break;
    case AuthTypeEnum.BEARER_TOKEN:
      authType = AuthType.BEARER_TOKEN;
      break;
  }
  return authType;
};

const validateEmail = (email: string) => {
  const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  return emailRegex.test(email);
};

export {
  findAuthHeader,
  findAuthParameter,
  unsetBodyType,
  unsetAuthType,
  setBodyType,
  setAuthType,
  validateEmail,
};
