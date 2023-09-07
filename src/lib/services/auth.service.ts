import authApi from "$lib/api/auth.api";
import { authActions } from "$lib/store/auth.store";

interface registerUserPostBody {
  email: string;
  username: string;
  name: string;
  password: string;
}

interface loginUserPostBody {
  email: string;
  password: string;
}

const registerUser = async (userInfo: registerUserPostBody) => {
  const response = await authApi.registerUser(userInfo);
  if (response.isSuccessful) {
    localStorage.setItem("AUTH_TOKEN", response.data.token);
    authActions.setUser(response.data);
  } else {
    throw response.message;
  }
};

const loginUser = async (userInfo: loginUserPostBody) => {
  const response = await authApi.loginUser(userInfo);
  if (response.isSuccessful) {
    authActions.setUser(response.data);
    localStorage.setItem("AUTH_TOKEN", response.data.token);
  } else {
    console.log("error registering user", response.message);
    throw "error registering user: " + response.message;
  }
};

export default {
  registerUser,
  loginUser,
};
