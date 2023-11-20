import { AuthSection, AuthType } from "../enums/authorization.enum";
import type { NewTab } from "../interfaces/request.interface";

const findAuthHeader = (
  requestData: NewTab,
): {
  key: string;
  value: string;
} => {
  const authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  if (
    requestData.request.state.auth === AuthType.BEARER_TOKEN &&
    requestData.request.auth.bearerToken
  ) {
    authValue.key = "Authorization";
    authValue.value = "Bearer " + requestData.request.auth.bearerToken;
  } else if (requestData.request.state.auth === AuthType.BASIC_AUTH) {
    authValue.key = "Authorization";
    authValue.value = `Basic ${btoa(
      requestData.request.auth.basicAuth.username +
        ":" +
        requestData.request.auth.basicAuth.password,
    )}`;
  } else if (
    requestData.request.state.auth === AuthType.API_KEY &&
    requestData.request.auth.apiKey.addTo === AuthSection.HEADER &&
    requestData.request.auth.apiKey.authKey &&
    requestData.request.auth.apiKey.authValue
  ) {
    authValue.key = requestData.request.auth.apiKey.authKey;
    authValue.value = requestData.request.auth.apiKey.authValue;
  } else {
    authValue.key = "";
    authValue.value = "";
  }
  return authValue;
};

const findAuthParameter = (
  requestData: NewTab,
): {
  key: string;
  value: string;
} => {
  const authValue: { key: string; value: string } = {
    key: "",
    value: "",
  };
  if (
    requestData.request.state.auth === AuthType.API_KEY &&
    requestData.request.auth.apiKey.addTo === AuthSection.QUERY_PARAMETER &&
    requestData.request.auth.apiKey.authKey &&
    requestData.request.auth.apiKey.authValue
  ) {
    authValue.key = requestData.request.auth.apiKey.authKey;
    authValue.value = requestData.request.auth.apiKey.authValue;
  } else {
    authValue.key = "";
    authValue.value = "";
  }
  return authValue;
};

export { findAuthHeader, findAuthParameter };
