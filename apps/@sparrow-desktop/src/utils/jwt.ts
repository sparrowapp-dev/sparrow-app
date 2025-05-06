import constants from "@app/constants/constants";
import * as Sentry from "@sentry/svelte";

const jwtDecode = (
  jwt: string,
): {
  email: string;
  name: string;
  _id: string;
} => {
  try {
    return JSON.parse(window.atob(jwt.split(".")[1]));
  } catch (err) {
    Sentry.captureException(err);
    return {
      email: "",
      name: "",
      _id: "",
    };
  }
};

const setAuthJwt = (key: string, token: string) => {
  if (token[token.length - 1] == "#") {
    token = token.slice(0, -1);
  }
  localStorage.setItem(key, token);
};

const getAuthJwt = () => {
  const authToken = localStorage.getItem("AUTH_TOKEN");
  const refToken = localStorage.getItem("REF_TOKEN");
  return [authToken, refToken];
};

const clearAuthJwt = (): void => {
  localStorage.removeItem(constants.AUTH_TOKEN);
  localStorage.removeItem(constants.REF_TOKEN);
};

/**
 * Retrieves the authenticated client's user information.
 *
 * @returns An object containing the user's properties.
 */
const getClientUser = (): {
  email: string;
  name: string;
  id: string;
} => {
  // Get the authentication JWT from storage or another source
  const jwt = getAuthJwt();

  // Decode the JWT to extract user information
  const user = jwtDecode(jwt[0] as string);
  return {
    email: user.email,
    name: user.name,
    id: user._id,
  };
};

export { jwtDecode, setAuthJwt, clearAuthJwt, getAuthJwt, getClientUser };
