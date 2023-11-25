import { AuthSection, AuthType } from "../enums/authorization.enum";
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
    request.auth.apiKey.authKey &&
    request.auth.apiKey.authValue
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
    request.auth.apiKey.authKey &&
    request.auth.apiKey.authValue
  ) {
    authValue.key = request.auth.apiKey.authKey;
    authValue.value = request.auth.apiKey.authValue;
  } else {
    authValue.key = "";
    authValue.value = "";
  }
  return authValue;
};

export { findAuthHeader, findAuthParameter };
