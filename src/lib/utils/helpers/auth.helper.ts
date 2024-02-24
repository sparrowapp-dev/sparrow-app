import { AuthSection, AuthType } from "../enums/authorization.enum";
import {
  ContentTypeEnum,
  RequestDataType,
  RequestDataset,
} from "../enums/request.enum";
import type { NewTab } from "../interfaces/request.interface";
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
    request.state.auth === AuthType.BEARER_TOKEN &&
    request.auth.bearerToken
  ) {
    authValue.key = "Authorization";
    authValue.value = "Bearer " + request.auth.bearerToken;
  } else if (request.state.auth === AuthType.BASIC_AUTH) {
    authValue.key = "Authorization";
    authValue.value = `Basic ${btoa(
      request.auth.basicAuth.username + ":" + request.auth.basicAuth.password,
    )}`;
  } else if (
    request.state.auth === AuthType.API_KEY &&
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
    request.state.auth === AuthType.API_KEY &&
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

const setContentTypeHeader = (bodyType: string) => {
  let contentType: ContentTypeEnum;
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

const setBodyType = (request: NewTab, header: string) => {
  switch (header) {
    case ContentTypeEnum["application/json"]:
      request.property.request.state.dataset = RequestDataset.RAW;
      request.property.request.state.raw = RequestDataType.JSON;
      break;
    case ContentTypeEnum["application/xml"]:
      request.property.request.state.dataset = RequestDataset.RAW;
      request.property.request.state.raw = RequestDataType.XML;
      break;
    case ContentTypeEnum["application/javascript"]:
      request.property.request.state.dataset = RequestDataset.RAW;
      request.property.request.state.raw = RequestDataType.JAVASCRIPT;
      break;
    case ContentTypeEnum["text/plain"]:
      request.property.request.state.dataset = RequestDataset.RAW;
      request.property.request.state.raw = RequestDataType.TEXT;
      break;
    case ContentTypeEnum["text/html"]:
      request.property.request.state.dataset = RequestDataset.RAW;
      request.property.request.state.raw = RequestDataType.HTML;
      break;
    case ContentTypeEnum["application/x-www-form-urlencoded"]:
      request.property.request.state.dataset = RequestDataset.URLENCODED;
      break;
    case ContentTypeEnum["multipart/form-data"]:
      request.property.request.state.dataset = RequestDataset.FORMDATA;
      break;
  }
  return request;
};

const validateEmail = (email: string) => {
  const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  return emailRegex.test(email);
};

export {
  findAuthHeader,
  findAuthParameter,
  setContentTypeHeader,
  setBodyType,
  validateEmail,
};
