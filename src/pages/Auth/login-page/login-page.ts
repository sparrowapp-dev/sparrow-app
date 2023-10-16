import authService from "$lib/services/auth.service";
import constants from "$lib/utils/constants";
import type { loginUserPostBody } from "$lib/utils/dto";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, loginSchema } from "$lib/utils/validation";
import { invoke } from "@tauri-apps/api";
import { navigate } from "svelte-navigator";

export const checkRust = async () => {
  console.log("Rust");
  const url = "https://jsonplaceholder.typicode.com/posts";
  // const method = "GET";
  const headers = new Headers(); // Add your headers if needed
  //const body =
  // "--form '=@\"/C:/Users/91877/Downloads/WhatsApp Image 2023-10-05 at 6.09.07 PM.jpeg\"'";
  const body1 = {
    name: "John Doe",
    age: 30,
  };
  const body2 = JSON.stringify(body1);
  console.log(body2);
  const body = "r#" + body2 + "#";
  console.log(body);
  const a: string = await invoke("make_post_http_request_command", {
    url,
    body,
    headers,
    // method,
    // body,
    // headers,
  });
  console.log("RESULT ===>", JSON.parse(a));
};

//------------------------------Navigation-------------------------------//
export const navigateToRegister = () => {
  navigate("/register");
};

export const authNavigate = () => {
  navigate(`${constants.API_URL}/api/auth/google`);
};

//---------------- Handle Login ------------------//
const handleLogin = async (loginCredentials: loginUserPostBody) => {
  try {
    await authService.loginUser(loginCredentials);
    notifications.success("Login successful!");
    navigate("/");
  } catch (error) {
    notifications.error("Something went wrong");
  }
};

//------------------------- Handle Login Validation -----------------//
export const handleLoginValidation = async (
  loginCredentials: loginUserPostBody,
) => {
  const { isError, errorObject } = await checkValidation(
    loginSchema,
    loginCredentials,
  );
  if (isError) {
    return errorObject;
  }
  handleLogin(loginCredentials);
  return {};
};
